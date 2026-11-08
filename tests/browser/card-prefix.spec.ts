import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-card-prefix-reference.json' with { type: 'json' };
import { snapshotCardPrefix } from './card-prefix-metrics';

test.use({ viewport: reference.reference.viewport });

for (const entry of reference.cases) {
  test(`Card prefix matches explicit source child prefixes for ${entry.sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=card-prefix');
    await page.getByRole('combobox', { name: 'Card prefix sample', exact: true })
      .selectOption(entry.sample.id);

    const expected = 'expectedNative' in entry ? entry.expectedNative : entry.matched;

    await expect.poll(() => page.evaluate(snapshotCardPrefix)).toEqual(expected);
  });
}

async function setPrefix(page: Page, value: string, local = false) {
  await page.getByRole('textbox', {
    name: local ? 'Local Card prefix value' : 'Live Card prefix value', exact: true
  }).evaluate((node: HTMLInputElement, value) => {
    node.value = value;
    node.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
}

test(
  'Card prefix updates retain Grid/Meta, tab selection, editor state and focus',
  async ({ page }) => {
    await page.goto('/?fixture=card-prefix');
    await page.getByRole('checkbox', { name: 'Live Card prefix', exact: true }).check();
    const scope = page.locator('[data-card-prefix-scope="normal"]');
    const root = scope.locator('.fixture-card-prefix');
    await scope.getByRole('tab', { name: 'Beta', exact: true }).click();
    const editor = scope.getByRole('textbox', { name: 'normal card draft', exact: true });
    const oldRoot = await root.elementHandle();
    const oldInput = await editor.elementHandle();
    const meta = scope.locator('.fixture-card-meta');
    const oldMeta = await meta.elementHandle();
    const grids = scope.locator('.fixture-card-grid');
    const oldGrids = await grids.elementHandles();
    await editor.fill('kept draft');
    await editor.evaluate((node: HTMLInputElement) => { node.setSelectionRange(1, 5); });

    for (const step of reference.transitions) {
      await setPrefix(page, step.prefix);

      await expect.poll(() => page.evaluate(snapshotCardPrefix)).toEqual(step.result);
      expect(await root.evaluate((node, old) => node === old, oldRoot)).toBe(step.sameRoot);
      expect(await editor.evaluate((node, old) => node === old, oldInput)).toBe(step.sameInput);
      expect(await meta.evaluate((node, old) => node === old, oldMeta)).toBe(step.sameMeta);
      for (const [index, oldGrid] of oldGrids.entries()) {
        expect(await grids.nth(index).evaluate((node, old) => node === old, oldGrid)).toBe(step.sameGrids);
      }
      await expect(editor).toHaveValue(step.value);
      expect(await editor.evaluate(node => node === document.activeElement)).toBe(step.focused);
      expect(await editor.evaluate((node: HTMLInputElement) => [
        node.selectionStart, node.selectionEnd
      ])).toEqual(step.selection);
      expect(await scope.evaluate(node => new FormData(node as HTMLFormElement).get('draft')))
        .toBe(step.formValue);
      await expect(scope.getByLabel('normal Card prefix ref')).toHaveText('mounted');
      await expect(scope.getByLabel('normal Card prefix events')).toHaveText('tab:b');
    }
    await setPrefix(page, 'panel', true);

    await expect(root).toHaveClass(/panel-contain-grid/);
    await expect(meta).toHaveClass(/panel-meta/);
    await expect(grids.first()).toHaveClass(/panel-grid/);
    await expect(editor).toBeFocused();
    await expect(scope.getByRole('tab', { name: 'Beta', exact: true }))
      .toHaveAttribute('aria-selected', 'true');
  }
);
