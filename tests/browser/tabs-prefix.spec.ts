import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-tabs-prefix-reference.json' with { type: 'json' };
import { snapshotTabsPrefix } from './tabs-prefix-metrics';

test.use({ viewport: reference.reference.viewport });

for (const entry of reference.cases) {
  test(`Tabs prefix matches source styles for ${entry.sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=tabs-prefix');
    await page.getByRole('combobox', { name: 'Tabs prefix sample', exact: true })
      .selectOption(entry.sample.id);

    await expect.poll(() => page.evaluate(snapshotTabsPrefix)).toEqual(entry.result);
  });
}

async function setPrefix(page: Page, value: string, local = false) {
  await page.getByRole('textbox', {
    name: local ? 'Local Tabs prefix value' : 'Live Tabs prefix value', exact: true
  }).evaluate((node: HTMLInputElement, value) => {
    node.value = value;
    node.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
}

test(
  'editable Tabs reveal the selected cell including its remove button',
  async ({ page }) => {
    await page.goto('/?fixture=tabs-prefix');
    await page.getByRole('checkbox', { name: 'Live Tabs prefix', exact: true }).check();
    await setPrefix(page, '');
    const scope = page.locator('[data-tabs-prefix-scope="normal"]');
    await scope.getByRole('button', { name: 'Select third normal tab', exact: true }).click();
    await scope.getByRole('tabpanel').getByRole('textbox').focus();
    const cell = scope.locator('[data-tabs-cell="c"]');

    await expect.poll(() => cell.evaluate(node => {
      const viewport = node.closest('[data-ant-tabs-part="nav-wrap"]')!.getBoundingClientRect();
      const bounds = node.getBoundingClientRect();

      return bounds.right - viewport.right;
    })).toBeLessThanOrEqual(1);
    await expect.poll(() => cell.evaluate(node => {
      const viewport = node.closest('[data-ant-tabs-part="nav-wrap"]')!.getBoundingClientRect();

      return node.getBoundingClientRect().left - viewport.left;
    })).toBeGreaterThanOrEqual(-1);
  }
);

test(
  'Tabs prefix updates retain the active panel, editor, selection and focus',
  async ({ page }) => {
    await page.goto('/?fixture=tabs-prefix');
    await page.getByRole('checkbox', { name: 'Live Tabs prefix', exact: true }).check();
    const scope = page.locator('[data-tabs-prefix-scope="normal"]');
    await scope.getByRole('button', { name: 'Select third normal tab', exact: true }).click();
    const root = scope.locator('.fixture-tabs-prefix');
    const panel = root.getByRole('tabpanel');
    const editor = panel.getByRole('textbox', { name: 'normal tabs panel draft', exact: true });
    const oldRoot = await root.elementHandle();
    const oldPanel = await panel.elementHandle();
    const oldInput = await editor.elementHandle();
    await editor.fill('kept panel draft');
    await editor.evaluate((node: HTMLInputElement) => { node.setSelectionRange(1, 5); });

    for (const step of reference.transitions) {
      await setPrefix(page, step.prefix);

      await expect.poll(() => page.evaluate(snapshotTabsPrefix)).toEqual(step.result);
      expect(await root.evaluate((node, old) => node === old, oldRoot)).toBe(step.sameRoot);
      expect(await panel.evaluate((node, old) => node === old, oldPanel)).toBe(step.samePanel);
      expect(await editor.evaluate((node, old) => node === old, oldInput)).toBe(step.sameInput);
      await expect(editor).toHaveValue(step.value);
      expect(await editor.evaluate(node => node === document.activeElement)).toBe(step.focused);
      expect(await editor.evaluate((node: HTMLInputElement) => [
        node.selectionStart, node.selectionEnd
      ])).toEqual(step.selection);
      await expect(scope.getByLabel('normal Tabs prefix ref')).toHaveText('mounted');
      await expect(scope.getByLabel('normal Tabs prefix events')).toHaveText('');
    }
    await setPrefix(page, 'work-tabs', true);

    await expect(editor).toBeFocused();
    await expect(root).toHaveClass(/work-tabs-editable-card/);
  }
);

test(
  'Tabs prefix updates retain open More, its menu and a focused popup editor',
  async ({ page }) => {
    await page.goto('/?fixture=tabs-prefix');
    await page.getByRole('checkbox', { name: 'Live Tabs prefix', exact: true }).check();
    const scope = page.locator('[data-tabs-prefix-scope="normal"]');
    await scope.getByRole('button', { name: 'Select third normal tab', exact: true }).click();
    const panelInput = scope.getByRole('tabpanel').getByRole('textbox');
    await panelInput.fill('kept panel draft');
    await scope.locator('[data-ant-tabs-part="nav-more"]').click();
    const popup = page.locator('.fixture-tabs-popup-normal');
    const menu = popup.getByRole('listbox');
    const editor = popup.getByRole('textbox', { name: 'normal tabs popup draft', exact: true });
    const oldPopup = await popup.elementHandle();
    const oldMenu = await menu.elementHandle();
    const oldInput = await editor.elementHandle();
    await editor.fill('kept popup draft');
    await editor.evaluate((node: HTMLInputElement) => { node.setSelectionRange(2, 6); });

    for (const step of reference.popupTransitions) {
      await setPrefix(page, step.prefix);

      await expect.poll(() => page.evaluate(snapshotTabsPrefix)).toEqual(step.result);
      expect(await popup.evaluate((node, old) => node === old, oldPopup)).toBe(step.samePopup);
      expect(await menu.evaluate((node, old) => node === old, oldMenu)).toBe(step.sameMenu);
      expect(await editor.evaluate((node, old) => node === old, oldInput)).toBe(step.sameInput);
      await expect(editor).toHaveValue(step.value);
      expect(await editor.evaluate(node => node === document.activeElement)).toBe(step.focused);
      expect(await editor.evaluate((node: HTMLInputElement) => [
        node.selectionStart, node.selectionEnd
      ])).toEqual(step.selection);
    }
    await setPrefix(page, 'work-tabs', true);

    await expect(popup).toHaveClass(/work-tabs-dropdown/);
    await expect(editor).toBeFocused();
    await editor.press('Escape');

    await expect(popup).toBeHidden();
    await expect(scope.locator('[data-ant-tabs-part="nav-more"]')).toBeFocused();
    await expect(panelInput).toHaveValue('kept panel draft');
  }
);
