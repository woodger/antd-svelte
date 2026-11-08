import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-grid-row-prefix-reference.json' with { type: 'json' };
import { snapshotGridRowPrefix } from './grid-row-prefix-metrics';

test.use({ viewport: reference.reference.viewport });

for (const entry of reference.cases) {
  test(`Row prefix matches source layout for ${entry.sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=grid-row-prefix');
    await page.getByRole('combobox', { name: 'Row prefix sample', exact: true })
      .selectOption(entry.sample.id);

    await expect.poll(() => page.evaluate(snapshotGridRowPrefix)).toEqual(entry.result);
  });
  if ('viewports' in entry) {
    for (const [width, expected] of Object.entries(entry.viewports!)) {
      test(`Row prefix follows source responsive layout at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width: Number(width), height: 1000 });
        await page.goto('/?fixture=grid-row-prefix');
        await page.getByRole('combobox', { name: 'Row prefix sample', exact: true })
          .selectOption(entry.sample.id);

        await expect.poll(() => page.evaluate(snapshotGridRowPrefix)).toEqual(expected);
      });
    }
  }
}

async function setPrefix(page: Page, value: string, local = false) {
  await page.getByRole('textbox', {
    name: local ? 'Local Row prefix value' : 'Live Row prefix value', exact: true
  }).evaluate((node: HTMLInputElement, value) => {
    node.value = value;
    node.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
}

test('Row prefix updates retain columns, editor draft, selection, focus and form value', async ({ page }) => {
  await page.goto('/?fixture=grid-row-prefix');
  await page.getByRole('checkbox', { name: 'Live Row prefix', exact: true }).check();
  const scope = page.locator('[data-grid-row-prefix-scope="normal"]');
  const row = scope.locator('.fixture-row-prefix');
  const columns = row.locator(':scope > div');
  const oldRow = await row.elementHandle();
  const oldCols = await columns.elementHandles();
  const input = scope.getByRole('textbox', { name: 'normal row editor', exact: true });
  const oldInput = await input.elementHandle();
  await input.fill('kept draft');
  await input.evaluate((node: HTMLInputElement) => { node.setSelectionRange(1, 5); });

  for (const step of reference.transitions) {
    await setPrefix(page, step.prefix);

    await expect.poll(() => page.evaluate(snapshotGridRowPrefix)).toEqual(step.result);
    expect(await row.evaluate((node, old) => node === old, oldRow)).toBe(step.sameRow);
    for (const [index, oldCol] of oldCols.entries()) {
      expect(await columns.nth(index).evaluate((node, old) => node === old, oldCol)).toBe(step.sameCols);
    }
    expect(await input.evaluate((node, old) => node === old, oldInput)).toBe(step.sameInput);
    await expect(input).toHaveValue(step.value);
    expect(await input.evaluate(node => node === document.activeElement)).toBe(step.focused);
    expect(await input.evaluate((node: HTMLInputElement) => [
      node.selectionStart, node.selectionEnd
    ])).toEqual(step.selection);
    expect(await scope.evaluate(node => new FormData(node as HTMLFormElement).get('draft')))
      .toBe(step.value);
  }
  await setPrefix(page, 'line', true);

  await expect(row).toHaveClass(/line-space-between/);
  await expect(input).toBeFocused();
  await expect(input).toHaveValue('kept draft');
});
