import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-descriptions-prefix-reference.json' with { type: 'json' };
import { snapshotDescriptionsPrefix } from './descriptions-prefix-metrics';

test.use({ viewport: reference.reference.viewport });

for (const entry of reference.cases) {
  const title = 'expectedNative' in entry
    ? `Descriptions preserves the recorded Table styling correction for ${entry.sample.id}`
    : `Descriptions prefix matches source layout for ${entry.sample.id}`;

  test(title, async ({ page }) => {
    await page.goto('/?fixture=descriptions-prefix');
    await page.getByRole('combobox', { name: 'Descriptions prefix sample', exact: true })
      .selectOption(entry.sample.id);

    const expected = 'expectedNative' in entry ? entry.expectedNative : entry.result;

    await expect.poll(() => page.evaluate(snapshotDescriptionsPrefix)).toEqual(expected);
  });
  if ('viewports' in entry) {
    for (const [width, expected] of Object.entries(entry.viewports!)) {
      test(`Descriptions prefix follows source responsive columns at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width: Number(width), height: 1000 });
        await page.goto('/?fixture=descriptions-prefix');
        await page.getByRole('combobox', { name: 'Descriptions prefix sample', exact: true })
          .selectOption(entry.sample.id);

        await expect.poll(() => page.evaluate(snapshotDescriptionsPrefix)).toEqual(expected);
      });
    }
  }
}

async function setPrefix(page: Page, value: string, local = false) {
  await page.getByRole('textbox', {
    name: local ? 'Local Descriptions prefix value' : 'Live Descriptions prefix value', exact: true
  }).evaluate((node: HTMLInputElement, value) => {
    node.value = value;
    node.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
}

test(
  'Descriptions prefix updates preserve cells, native field state and form data',
  async ({ page }) => {
    await page.goto('/?fixture=descriptions-prefix');
    await page.getByRole('checkbox', { name: 'Live Descriptions prefix', exact: true }).check();
    const scope = page.locator('[data-descriptions-prefix-scope="normal"]');
    const root = scope.locator('[data-prefix-desc-root]');
    const oldRoot = await root.elementHandle();
    const input = scope.getByRole('textbox', { name: 'normal descriptions draft', exact: true });
    const oldInput = await input.elementHandle();
    const oldCell = await input.evaluateHandle(node => node.closest('td'));
    await input.fill('kept draft');
    await input.evaluate((node: HTMLInputElement) => { node.setSelectionRange(1, 5); });

    for (const step of reference.transitions) {
      await setPrefix(page, step.prefix);

      await expect.poll(() => page.evaluate(snapshotDescriptionsPrefix)).toEqual(step.result);
      expect(await root.evaluate((node, old) => node === old, oldRoot)).toBe(step.sameRoot);
      expect(await input.evaluate((node, old) => node === old, oldInput)).toBe(step.sameInput);
      expect(await input.evaluate((node, old) => node.closest('td') === old, oldCell)).toBe(step.sameCell);
      await expect(input).toHaveValue(step.value);
      expect(await input.evaluate(node => node === document.activeElement)).toBe(step.focused);
      expect(await input.evaluate((node: HTMLInputElement) => [
        node.selectionStart, node.selectionEnd
      ])).toEqual(step.selection);
      expect(await scope.evaluate(node => new FormData(node as HTMLFormElement).get('draft')))
        .toBe(step.formValue);
      await expect(scope.getByLabel('normal Descriptions prefix ref')).toHaveText('mounted');
    }
    await setPrefix(page, 'details', true);

    await expect(root).toHaveClass(/details/);
    await expect(input).toBeFocused();
    await expect(input).toHaveValue('kept draft');
  }
);

test(
  'Descriptions canonical local prefix keeps expanded Table namespaces isolated',
  async ({ page }) => {
    await page.goto('/?fixture=descriptions-prefix');
    await page.getByRole('combobox', { name: 'Descriptions prefix sample', exact: true })
      .selectOption('table-canonical');
    const scope = page.locator('[data-descriptions-prefix-scope="normal"]');
    const view = scope.locator('.ant-descriptions-view');

    await expect(view).toHaveCSS('display', 'flex');
    await scope.evaluate(node => {
      node.querySelector('.suite-table-wrapper')!.className = 'ant-table-wrapper';
      node.querySelector('.suite-table-expanded-row')!.className = 'ant-table-expanded-row';
    });

    await expect(view).toHaveCSS('display', 'block');
    await expect(page.locator('[data-descriptions-prefix-scope="sibling"] .ant-descriptions-view'))
      .toHaveCSS('display', 'flex');
    await scope.evaluate(node => {
      node.querySelector('.ant-table-wrapper')!.className = 'suite-table-wrapper';
      node.querySelector('.ant-table-expanded-row')!.className = 'suite-table-expanded-row';
    });

    await expect(view).toHaveCSS('display', 'flex');
  }
);
