import type { Locator } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-table-header-reference.json' with { type: 'json' };
import { snapshotTableHeader } from './table-header-metrics';

test.use({ viewport: reference.viewport });
test.beforeEach(async ({ page }) => { await page.goto('/?fixture=table-header'); });

async function expectPinnedBody(region: Locator) {
  await expect.poll(() => region.evaluate(node => {
    const table = node.querySelector('table')!;
    const row = table.tBodies[0]?.rows[0];
    const bounds = node.getBoundingClientRect();
    const left = bounds.left + node.clientLeft;
    const right = left + node.clientWidth;
    const rtl = getComputedStyle(node).direction === 'rtl';
    let start = rtl ? right : left;
    let end = rtl ? left : right;
    const errors: number[] = [];
    const startCells = [...(row?.querySelectorAll('.ant-table-cell-fix-start') ?? [])];
    const endCells = [...(row?.querySelectorAll('.ant-table-cell-fix-end') ?? [])].reverse();
    for (const cell of startCells) {
      const rect = cell.getBoundingClientRect();
      errors.push(Math.abs((rtl ? rect.right : rect.left) - start));
      start = rtl ? rect.left : rect.right;
    }
    for (const cell of endCells) {
      const rect = cell.getBoundingClientRect();
      errors.push(Math.abs((rtl ? rect.left : rect.right) - end));
      end = rtl ? rect.right : rect.left;
    }

    return errors.length ? Math.max(...errors) : Infinity;
  })).toBeLessThan(1.5);
}

for (const sample of reference.cases) {
  for (const [mode, expected] of Object.entries(sample.modes)) {
    test(`Table showHeader matches source ${mode} structure and corners for ${sample.name}`,
      async ({ page }) => {
        await page.getByLabel('Table header theme', { exact: true }).selectOption(sample.name);
        await page.getByLabel('Table header mode', { exact: true }).selectOption(mode);
        await page.mouse.move(1300, 1100);

        await expect.poll(() => page.evaluate(snapshotTableHeader)).toEqual(expected);
      });
  }
}

test('Table header toggles preserve caption, expanded data, editor selection and body controls',
  async ({ page }) => {
    await page.getByLabel('Table header mode', { exact: true }).selectOption('stateful');
    const root = page.locator('#table-header-control');
    const input = root.getByRole('textbox', { name: 'Header row draft', exact: true });
    const checkbox = root.getByRole('checkbox', { name: 'Select Alpha', exact: true });
    const table = root.getByRole('table', { name: 'Header people', exact: true });
    await input.fill('Header draft');
    await input.evaluate(node => (node as HTMLInputElement).setSelectionRange(1, 5, 'backward'));
    const original = await input.elementHandle();
    const originalCheckbox = await checkbox.elementHandle();
    const originalTable = await table.elementHandle();

    await page.getByLabel('Table header visibility', { exact: true }).evaluate(node => {
      const select = node as HTMLSelectElement;
      select.value = 'hidden';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });

    await expect(root.locator('thead')).toHaveCount(0);
    await expect(table).toBeVisible();
    await expect(root.locator('.ant-table-expanded-row')).toContainText('Details for Alpha');
    await expect(input).toBeFocused();
    await expect(input).toHaveValue('Header draft');
    await expect(checkbox).toBeChecked();
    expect(await input.evaluate((node, old) => node === old, original)).toBe(true);
    expect(await checkbox.evaluate((node, old) => node === old, originalCheckbox)).toBe(true);
    expect(await table.evaluate((node, old) => node === old, originalTable)).toBe(true);
    expect(await input.evaluate(node => {
      const field = node as HTMLInputElement;
      return [field.selectionStart, field.selectionEnd, field.selectionDirection];
    })).toEqual([1, 5, 'backward']);
    expect(await root.getByRole('form').evaluate(node =>
      new FormData(node as HTMLFormElement).get('draft'))).toBe('Header draft');
    await expect(root.getByLabel('Table header events', { exact: true })).toHaveText('[]');

    await checkbox.focus();
    await page.keyboard.press('Space');

    await expect(checkbox).not.toBeChecked();
    await expect(root.getByLabel('Table header events', { exact: true })).toHaveText('["selection"]');

    await page.getByLabel('Table header visibility', { exact: true }).selectOption('shown');

    await expect(root.locator('thead th')).toHaveCount(5);
    await expect(checkbox).not.toBeChecked();
    await expect(input).toHaveValue('Header draft');
    expect(await input.evaluate((node, old) => node === old, original)).toBe(true);
  });

for (const rtl of [false, true]) {
  test(`Table hidden header keeps fixed cells measured after data and empty changes in ${rtl ? 'RTL' : 'LTR'}`,
    async ({ page }) => {
      await page.getByLabel('Table header mode', { exact: true }).selectOption('stateful');
      if (rtl) await page.getByLabel('Right to left header table', { exact: true }).check();
      await page.getByLabel('Table header visibility', { exact: true }).selectOption('hidden');
      const root = page.locator('#table-header-control');
      const region = root.getByRole('region', { name: 'Header people', exact: true });
      await region.evaluate((node, rtl) => { node.scrollLeft = rtl ? -180 : 180; }, rtl);

      await expectPinnedBody(region);
      await expect(region).toHaveCSS('scroll-padding-top', '0px');

      await page.getByRole('button', { name: 'Replace header table rows', exact: true }).click();

      await expect(root.locator('tbody tr.ant-table-row')).toHaveCount(2);
      await expect(root.getByRole('checkbox', { name: 'Select Gamma', exact: true })).toBeVisible();
      await expectPinnedBody(region);

      await page.getByRole('button', { name: 'Toggle empty header table', exact: true }).click();

      await expect(root.locator('tbody tr.ant-table-row')).toHaveCount(0);
      await expect(root.locator('thead')).toHaveCount(0);

      await page.getByRole('button', { name: 'Toggle empty header table', exact: true }).click();

      await expect(root.locator('tbody tr.ant-table-row')).toHaveCount(2);
      await expectPinnedBody(region);
      await expect(root.getByLabel('Table header events', { exact: true })).toHaveText('[]');
    });
}

test('Table removing the header closes its filter popover and leaves body data intact',
  async ({ page }) => {
    const root = page.locator('#table-header-control');
    await root.locator('.ant-table-filter-trigger').click();
    await expect(root.getByRole('dialog')).toBeVisible();

    await page.getByLabel('Table header visibility', { exact: true }).evaluate(node => {
      const select = node as HTMLSelectElement;
      select.value = 'hidden';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });

    await expect(root.getByRole('dialog')).toHaveCount(0);
    await expect(page.locator(':popover-open')).toHaveCount(0);
    await expect(root.locator('tbody tr.ant-table-row')).toHaveCount(2);
    await expect(root.getByLabel('Table header events', { exact: true })).toHaveText('[]');
  });
