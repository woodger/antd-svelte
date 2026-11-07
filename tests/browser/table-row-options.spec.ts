import { test, expect } from './test';
import hoverReference from './fixtures/ant-design-table-hover-reference.json' with { type: 'json' };
import classReference from './fixtures/ant-design-table-row-classes-reference.json' with { type: 'json' };
import observation from './fixtures/ant-design-table-hover-observation.json' with { type: 'json' };

function rowColors() {
  return [...document.querySelectorAll('#table-row-control tbody tr.ant-table-row:first-child td')]
    .map(node => ({
      color: getComputedStyle(node).color,
      background: getComputedStyle(node).backgroundColor
    }));
}

function rowClasses() {
  return [...document.querySelectorAll('#table-row-control tbody tr.ant-table-row')].map(node => ({
    userClasses: [...node.classList].filter(name => name.startsWith('user-row-')),
    name: node.querySelector('td:not(.ant-table-selection-column)')?.textContent,
    selected: node.classList.contains('ant-table-row-selected')
  }));
}

test.use({ viewport: hoverReference.viewport });
test.beforeEach(async ({ page }) => { await page.goto('/?fixture=table-row-options'); });

for (const sample of hoverReference.cases) {
  for (const [mode, states] of Object.entries(sample.modes)) {
    for (const [setting, expected] of Object.entries(states)) {
      test(`Table ${mode} ${setting} row hover matches source colors for ${sample.name}`,
        async ({ page }) => {
          await page.getByLabel('Table row theme', { exact: true }).selectOption(sample.name);
          await page.getByLabel('Table row mode', { exact: true }).selectOption(mode);
          await page.getByLabel('Table row hover', { exact: true }).selectOption(setting);
          await page.locator('#table-row-control tbody tr.ant-table-row').first()
            .locator('td').last().hover();

          // HoverContext class — диагностика Source; native CSS :hover сравнивается по paint values.
          await expect.poll(() => page.evaluate(rowColors)).toEqual(expected.map(item => ({
            color: item.color, background: item.background
          })));
        });
    }
  }
}

for (const sample of classReference.cases) {
  test(`Table rowClassName receives source page records and flat indices for ${sample.mode}`,
    async ({ page }) => {
      await page.getByLabel('Table row mode', { exact: true }).selectOption('classes');
      await page.getByLabel('Table row class', { exact: true }).selectOption(sample.mode);

      await expect.poll(() => page.evaluate(rowClasses)).toEqual(sample.rows);
    });
}

test('Table disabling row hover clears paint under the stationary pointer and preserves the row',
  async ({ page }) => {
    const root = page.locator('#table-row-control');
    const row = root.locator('tbody tr.ant-table-row').first();
    const original = await row.elementHandle();
    const cell = row.locator('td').first();
    await cell.hover();
    await expect(cell).toHaveCSS('background-color', 'rgb(230, 244, 255)');
    expect(observation.disabledUnderPointer).toEqual(observation.enabled);
    expect(observation.disabledAfterLeave).toEqual(observation.enabled);

    await page.getByLabel('Table row hover', { exact: true })
      .evaluate(node => {
        const select = node as HTMLSelectElement;
        select.value = 'disabled';
        select.dispatchEvent(new Event('change', { bubbles: true }));
      });

    await expect(cell).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    expect(await row.evaluate(node => node.matches(':hover'))).toBe(true);
    expect(await row.evaluate((node, old) => node === old, original)).toBe(true);
    await expect(root.getByLabel('Table row events', { exact: true })).toHaveText('[]');

    await page.mouse.move(1300, 1100);

    await expect(cell).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  });

test('Table row options preserve editors, keyboard selection, sorting and source core classes',
  async ({ page }) => {
    await page.getByLabel('Table row mode', { exact: true }).selectOption('stateful');
    await page.getByLabel('Table row class', { exact: true }).selectOption('callback');
    const root = page.locator('#table-row-control');
    const input = root.getByRole('textbox', { name: 'Row draft', exact: true });
    const row = root.locator('tbody tr.ant-table-row').first();
    const checkbox = row.getByRole('checkbox');
    await input.fill('Retained row');
    await input.evaluate(node => (node as HTMLInputElement).setSelectionRange(1, 5, 'backward'));
    const originalInput = await input.elementHandle();
    const originalCheckbox = await checkbox.elementHandle();
    const originalRow = await row.elementHandle();

    await page.getByRole('button', { name: 'Update row class', exact: true }).dispatchEvent('click');
    await page.getByLabel('Table row hover', { exact: true }).evaluate(node => {
      const select = node as HTMLSelectElement;
      select.value = 'disabled';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });

    await expect(row).toHaveClass(/updated-row-1-0-0/);
    await expect(row).toHaveClass(/ant-table-row-selected/);
    await expect(input).toHaveValue('Retained row');
    await expect(input).toBeFocused();
    expect(await input.evaluate((node, old) => node === old, originalInput)).toBe(true);
    expect(await row.evaluate((node, old) => node === old, originalRow)).toBe(true);
    expect(await checkbox.evaluate((node, old) => node === old, originalCheckbox)).toBe(true);
    expect(await input.evaluate(node => {
      const field = node as HTMLInputElement;
      return [field.selectionStart, field.selectionEnd, field.selectionDirection];
    })).toEqual([1, 5, 'backward']);
    expect(await root.getByRole('form').evaluate(node =>
      new FormData(node as HTMLFormElement).get('draft'))).toBe('Retained row');
    await expect(root.getByLabel('Table row events', { exact: true })).toHaveText('[]');

    await checkbox.focus();
    await page.keyboard.press('Space');

    await expect(checkbox).not.toBeChecked();
    await expect(row).not.toHaveClass(/ant-table-row-selected/);
    await expect(row).toHaveClass(/updated-row-1-0-0/);
    await expect(root.getByLabel('Table row events', { exact: true })).toHaveText('["selection"]');
    await root.locator('.sort-button').focus();
    await page.keyboard.press('Enter');
    await expect(root.locator('th[aria-sort="ascending"]')).toBeVisible();
    await expect(root.getByLabel('Table row events', { exact: true }))
      .toHaveText('["selection","sort"]');
    await expect(input).toHaveValue('Retained row');
  });

test('Table row class props update without clearing legacy classes or retained selection',
  async ({ page }) => {
    await page.getByLabel('Table row mode', { exact: true }).selectOption('classes');
    await page.getByLabel('Table row class', { exact: true }).selectOption('constant');
    const root = page.locator('#table-row-control');
    const row = root.locator('tbody tr.ant-table-row').first();
    const original = await row.elementHandle();

    await page.getByRole('button', { name: 'Update row class', exact: true }).click();
    await page.getByLabel('Apply source row theme', { exact: true }).uncheck();

    await expect(row).toHaveClass(/updated-row-constant updated-row-extra/);
    await expect(row).toHaveClass(/ant-table-row-selected/);
    expect(await row.evaluate((node, old) => node === old, original)).toBe(true);
    await expect(row.getByRole('checkbox')).toBeChecked();
    await expect(root.getByLabel('Table row events', { exact: true })).toHaveText('[]');

    await page.getByLabel('Mount row table', { exact: true }).uncheck();

    await expect(root).toHaveCount(0);
    expect(await original?.evaluate(node => node.isConnected)).toBe(false);
  });
