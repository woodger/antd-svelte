import { test, expect } from './test';
import reference from './fixtures/ant-design-color-picker-theme-reference.json' with { type: 'json' };
import {
  snapshotColorPickerThemeTriggers, snapshotColorPickerThemePopup
} from './color-picker-theme-metrics';

test.use({ viewport: reference.viewport });
test.beforeEach(async ({ page }) => { await page.goto('/?fixture=color-picker-theme'); });

for (const sample of reference.cases) {
  test(`ColorPicker trigger themes match source sizes and scopes for ${sample.name}`,
    async ({ page }) => {
      await page.getByLabel('ColorPicker theme preset', { exact: true }).selectOption(sample.name);

      await expect.poll(() => page.evaluate(snapshotColorPickerThemeTriggers)).toEqual(sample.metrics);
    });

  for (const [mode, expected] of Object.entries(sample.popups)) {
    test(`ColorPicker ${mode} popup theme matches source for ${sample.name}`, async ({ page }) => {
      await page.getByLabel('ColorPicker theme preset', { exact: true }).selectOption(sample.name);
      await page.getByLabel('ColorPicker theme popup', { exact: true }).selectOption(mode);
      await expect(page.locator('.theme-color-popup')).toBeVisible();

      await expect.poll(() => page.evaluate(snapshotColorPickerThemePopup)).toEqual(expected);
    });
  }
}

test('ColorPicker theme updates keep popup position, hex draft, caret and collapsed presets',
  async ({ page }) => {
    await page.getByLabel('ColorPicker theme popup', { exact: true }).selectOption('basic');
    const popup = page.locator('.theme-color-popup');
    const presets = popup.getByRole('button', { name: 'Stored colors', exact: true });
    await presets.click();
    await expect(presets).toHaveAttribute('aria-expanded', 'false');
    const input = popup.getByLabel('Hex color', { exact: true });
    const trigger = page.getByRole('button', { name: 'Themed ColorPicker normal basic', exact: true });
    const originalInput = await input.elementHandle();
    const originalPopup = await popup.elementHandle();
    const originalTrigger = await trigger.elementHandle();
    await input.fill('12');
    await input.evaluate(node => (node as HTMLInputElement).setSelectionRange(0, 2, 'backward'));

    await page.getByRole('button', { name: 'Update ColorPicker tokens', exact: true })
      .dispatchEvent('click');

    const updated = reference.cases.find(item => item.name === 'updated-aliases')!;
    await expect(trigger).toHaveCSS('font-size', updated.metrics.normal.basic.root['font-size']);
    await expect(popup).toHaveCSS('font-size', updated.popups.basic.popup!['font-size']);
    await expect(popup).toHaveCSS('position', 'fixed');
    expect(await popup.evaluate(node => [
      (node as HTMLElement).style.left, (node as HTMLElement).style.top
    ])).toEqual([expect.stringMatching(/px$/), expect.stringMatching(/px$/)]);
    expect(await input.evaluate((node, old) => node === old, originalInput)).toBe(true);
    expect(await popup.evaluate((node, old) => node === old, originalPopup)).toBe(true);
    expect(await trigger.evaluate((node, old) => node === old, originalTrigger)).toBe(true);
    await expect(presets).toHaveAttribute('aria-expanded', 'false');
    await expect(input).toBeFocused();
    await expect(input).toHaveValue('12');
    expect(await input.evaluate(node => {
      const input = node as HTMLInputElement;
      return [input.selectionStart, input.selectionEnd, input.selectionDirection];
    })).toEqual([0, 2, 'backward']);
    await expect(page.getByLabel('ColorPicker theme events normal', { exact: true })).toHaveText('[]');

    await input.fill('ff0000');

    await expect(trigger).toContainText('#FF0000');
    await expect(page.getByLabel('ColorPicker theme events normal', { exact: true }))
      .toHaveText('["change:basic:rgb(255,0,0)","complete:basic:rgb(255,0,0)"]');
  });

test('ColorPicker inheritance reset keeps its focused trigger, color and DOM identity',
  async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Themed ColorPicker nested basic', exact: true });
    const original = await trigger.elementHandle();
    await trigger.focus();

    await page.getByLabel('Inherit ColorPicker theme', { exact: true }).dispatchEvent('click');

    const expected = reference.cases.find(item => item.name === 'default')!.metrics.nested.basic;
    await expect(trigger).toHaveCSS('font-family', expected.root['font-family']);
    await expect(trigger).toHaveCSS('font-size', expected.root['font-size']);
    expect(await trigger.evaluate((node, old) => node === old, original)).toBe(true);
    await expect(trigger).toBeFocused();
    await expect(trigger).toContainText('#1677FF');
    await expect(page.getByLabel('ColorPicker theme events nested', { exact: true })).toHaveText('[]');
  });

test('ColorPicker restores default styling and removes its portal without changing sibling themes',
  async ({ page }) => {
    await page.getByLabel('ColorPicker theme popup', { exact: true }).selectOption('basic');
    const popup = page.locator('.theme-color-popup');
    const input = popup.getByLabel('Hex color', { exact: true });
    const trigger = page.getByRole('button', { name: 'Themed ColorPicker normal basic', exact: true });
    const originalInput = await input.elementHandle();
    const originalPopup = await popup.elementHandle();
    await input.fill('12');

    await page.getByLabel('Apply source ColorPicker theme', { exact: true }).dispatchEvent('click');

    await expect(trigger).toHaveCSS('font-size', '14px');
    await expect(popup).toHaveCSS('font-size', '14px');
    expect(await input.evaluate((node, old) => node === old, originalInput)).toBe(true);
    expect(await popup.evaluate((node, old) => node === old, originalPopup)).toBe(true);
    await expect(input).toBeFocused();
    await expect(input).toHaveValue('12');
    await expect(page.getByLabel('ColorPicker theme events normal', { exact: true })).toHaveText('[]');

    await page.getByLabel('Mount themed ColorPickers', { exact: true }).dispatchEvent('click');

    await expect(popup).toHaveCount(0);
    expect(await originalInput!.evaluate(node => node.isConnected)).toBe(false);
    expect(await originalPopup!.evaluate(node => node.isConnected)).toBe(false);
    await expect(page.getByRole('button', { name: 'Themed ColorPicker sibling basic', exact: true }))
      .toHaveCSS('font-size', '17px');
  });
