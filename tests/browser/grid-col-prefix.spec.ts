import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-grid-col-prefix-reference.json' with { type: 'json' };
import { snapshotGridColPrefix } from './grid-col-prefix-metrics';

test.use({ viewport: reference.reference.viewport });

for (const entry of reference.cases) {
  test(`Col prefixes match Source columns and Form layout for ${entry.sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=grid-col-prefix');
    await page.getByRole('combobox', { name: 'Col prefix sample', exact: true })
      .selectOption(entry.sample.id);

    for (const result of entry.widths) {
      await page.setViewportSize({ width: result.width, height: 1100 });

      await expect.poll(() => page.evaluate(snapshotGridColPrefix)).toEqual(result.expectedNative);
    }
  });
}

async function setPrefix(page: Page, value: string, local = false) {
  await page.getByRole('textbox', {
    name: local ? 'Local Col prefix value' : 'Live Col prefix value', exact: true
  }).evaluate((node: HTMLInputElement, value) => {
    node.value = value;
    node.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
}

test('Col prefix changes retain nodes, draft, selection, focus and native ref', async ({ page }) => {
  await page.goto('/?fixture=grid-col-prefix');
  await page.getByRole('checkbox', { name: 'Live Col prefix', exact: true }).check();
  const scope = page.locator('[data-col-prefix-scope="normal"]');
  const input = scope.getByRole('textbox', { name: 'normal column draft', exact: true });
  const column = scope.locator('[data-fixture-col="first"]');
  const oldInput = await input.elementHandle();
  const oldCol = await column.elementHandle();
  await input.fill('kept draft');
  await input.evaluate((node: HTMLInputElement) => { node.setSelectionRange(1, 5); });

  for (const step of reference.transitions) {
    await setPrefix(page, step.prefix);

    await expect.poll(() => page.evaluate(snapshotGridColPrefix)).toEqual(step.result);
    expect(await input.evaluate((node, old) => node === old, oldInput)).toBe(step.sameInput);
    expect(await column.evaluate((node, old) => node === old, oldCol)).toBe(step.sameCol);
    await expect(input).toHaveValue(step.value);
    expect(await input.evaluate(node => node === document.activeElement)).toBe(step.focused);
    expect(await input.evaluate((node: HTMLInputElement) => [
      node.selectionStart, node.selectionEnd
    ])).toEqual(step.selection);
    await expect(scope.getByLabel('normal column ref')).toHaveText('mounted');
  }
  await setPrefix(page, 'column', true);

  await expect(column).toHaveClass(/column-md-flex/);
  await expect(input).toBeFocused();
  await expect(column).toHaveCSS('--suite-col-md-flex', '2 2 auto');
});

test('Form columns retain layout with independent local label and control prefixes', async ({ page }) => {
  await page.goto('/?fixture=grid-col-prefix');
  await page.getByRole('combobox', { name: 'Col prefix sample', exact: true })
    .selectOption('child-override');

  for (const width of [520, 820, 1700]) {
    await page.setViewportSize({ width, height: 1100 });
    await page.getByRole('checkbox', { name: 'Local Form column prefixes', exact: true }).uncheck();
    const original = await page.evaluate(snapshotGridColPrefix);
    await page.getByRole('checkbox', { name: 'Local Form column prefixes', exact: true }).check();

    await expect.poll(() => page.evaluate(snapshotGridColPrefix)).toEqual(original);
    await expect(page.locator('.fixture-col-label.label-column')).toHaveCount(6);
    await expect(page.locator('.fixture-col-control.control-column')).toHaveCount(6);
  }
});
