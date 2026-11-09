import { test, expect } from './test';
import reference from './fixtures/ant-design-color-picker-prefix-reference.json' with { type: 'json' };
import { snapshotColorPickerPrefix } from './color-picker-prefix-metrics';

test.use({ viewport: reference.reference.viewport });

for (const entry of reference.cases) {
  for (const scope of ['normal', 'nested', 'sibling'] as const) {
    test(`ColorPicker prefixes match Source ${entry.sample.id}/${scope}`, async ({ page }) => {
      await page.goto('/?fixture=color-picker-prefix');
      await page.getByRole('combobox', { name: 'ColorPicker prefix sample', exact: true })
        .selectOption(entry.sample.id);
      await page.getByRole('combobox', { name: 'ColorPicker prefix scope', exact: true })
        .selectOption(scope);
      await page.mouse.move(1270, 890);

      const expected = scope === 'nested' && entry.freshNamespace
        ? entry.freshNamespace.nested : entry.result[scope];

      await expect.poll(() => page.evaluate(snapshotColorPickerPrefix)).toEqual(expected);
    });
  }
}

test('ColorPicker prefix updates retain open popup, hex draft, caret, focus and color callbacks',
  async ({ page }) => {
    await page.goto('/?fixture=color-picker-prefix');
    await page.getByRole('checkbox', { name: 'Live ColorPicker prefix', exact: true }).check();
    const popup = page.locator('.fixture-color-prefix-popup');
    const input = popup.getByRole('textbox', { name: 'Hex color', exact: true });
    const trigger = page.getByRole('button', { name: 'Prefix color', exact: true });
    const oldTrigger = await trigger.elementHandle();
    const oldPopup = await popup.elementHandle();
    const oldInput = await input.elementHandle();
    const id = await popup.getAttribute('id');
    await input.fill('12');
    await input.evaluate((node: HTMLInputElement) => node.setSelectionRange(0, 2, 'backward'));

    for (const step of reference.transitions) {
      await page.getByRole('textbox', { name: 'Live ColorPicker prefix value', exact: true })
        .evaluate((node: HTMLInputElement, value) => {
          node.value = value;
          node.dispatchEvent(new Event('input', { bubbles: true }));
        }, step.prefix);

      await expect.poll(() => page.evaluate(snapshotColorPickerPrefix)).toEqual(step.result);
      expect(await trigger.evaluate((node, old) => node === old, oldTrigger)).toBe(true);
      expect(await popup.evaluate((node, old) => node === old, oldPopup)).toBe(true);
      expect(await input.evaluate((node, old) => node === old, oldInput)).toBe(true);
      await expect(input).toBeFocused();
      await expect(input).toHaveValue(step.value);
      await expect(popup).toHaveAttribute('id', id!);
      await expect(trigger).toHaveAttribute('aria-controls', id!);
      expect(await input.evaluate((node: HTMLInputElement) =>
        [node.selectionStart, node.selectionEnd, node.selectionDirection])).toEqual(step.selection);
      await expect(page.getByLabel('ColorPicker prefix events', { exact: true })).toHaveText('');
    }
    await input.fill('ff0000');

    await expect(trigger).toContainText('#FF0000');
    await expect(page.getByLabel('ColorPicker prefix events', { exact: true }))
      .toHaveText('change:rgb(255,0,0)|complete:rgb(255,0,0)');
  });

test('ColorPicker local prefixes retain collapsed presets and independent child namespaces',
  async ({ page }) => {
    await page.goto('/?fixture=color-picker-prefix');
    await page.getByRole('checkbox', { name: 'Live ColorPicker prefix', exact: true }).check();
    const popup = page.locator('.fixture-color-prefix-popup');
    const preset = popup.getByRole('button', { name: 'Stored colors', exact: true });
    await preset.click();
    const oldPreset = await preset.elementHandle();
    const input = popup.getByRole('textbox', { name: 'Hex color', exact: true });
    await input.fill('12');

    await page.getByRole('textbox', { name: 'Local ColorPicker prefix value', exact: true })
      .evaluate((node: HTMLInputElement) => {
        node.value = 'colors';
        node.dispatchEvent(new Event('input', { bubbles: true }));
      });

    await expect(popup).toHaveClass(/\bcolors\b/);
    await expect(popup).toHaveClass(/\bsuite-popover\b/);
    await expect(popup.locator('.colors-format-select > .suite-select')).toHaveCount(1);
    await expect(popup.locator('.suite-input-number')).toHaveCount(1);
    await expect(popup.locator('.suite-divider')).toHaveCount(1);
    await expect(popup.locator('.suite-collapse')).toHaveCount(1);
    expect(await preset.evaluate((node, old) => node === old, oldPreset)).toBe(true);
    await expect(preset).toHaveAttribute('aria-expanded', 'false');
    await expect(input).toBeFocused();
    await expect(input).toHaveValue('12');
    await expect(page.getByLabel('ColorPicker prefix events', { exact: true })).toHaveText('');
    await preset.click();
    await popup.getByRole('button', { name: 'rgb(250,84,28)', exact: true }).click();

    await expect(page.getByLabel('ColorPicker prefix value', { exact: true }))
      .toHaveText('rgb(250,84,28)');
  });

test('ColorPicker prefix changes preserve the custom portal and remove it on unmount',
  async ({ page }) => {
    await page.goto('/?fixture=color-picker-prefix');
    await page.getByRole('checkbox', { name: 'Live ColorPicker prefix', exact: true }).check();
    await page.getByRole('checkbox', { name: 'Portal prefix ColorPicker', exact: true })
      .dispatchEvent('click');
    const popup = page.locator('#color-prefix-portal .fixture-color-prefix-popup');
    const oldPopup = await popup.elementHandle();
    const input = popup.getByRole('textbox', { name: 'Hex color', exact: true });
    await input.fill('12');

    await page.getByRole('textbox', { name: 'Live ColorPicker prefix value', exact: true })
      .evaluate((node: HTMLInputElement) => {
        node.value = 'next';
        node.dispatchEvent(new Event('input', { bubbles: true }));
      });

    await expect(popup).toHaveClass(/\bnext-popover\b/);
    expect(await popup.evaluate((node, old) => node === old, oldPopup)).toBe(true);
    await expect(input).toBeFocused();
    await expect(input).toHaveValue('12');
    await page.getByRole('checkbox', { name: 'Mount prefix ColorPicker', exact: true })
      .dispatchEvent('click');

    await expect(popup).toHaveCount(0);
    expect(await oldPopup!.evaluate(node => node.isConnected)).toBe(false);
  });

test('ColorPicker prefixes retain default styling and a custom trigger', async ({ page }) => {
  await page.goto('/?fixture=color-picker-prefix');
  await page.getByRole('checkbox', { name: 'Live ColorPicker prefix', exact: true }).check();
  await page.getByRole('checkbox', { name: 'Source prefix ColorPicker theme', exact: true })
    .dispatchEvent('click');
  const popup = page.locator('.fixture-color-prefix-popup');
  const input = popup.getByRole('textbox', { name: 'Hex color', exact: true });
  await input.fill('12');
  await page.evaluate(() => Promise.all(document.getAnimations()
    .filter(animation => animation.effect?.getComputedTiming().iterations !== Infinity)
    .map(animation => animation.finished.catch(() => {}))));
  const before = await page.evaluate(snapshotColorPickerPrefix);

  await page.getByRole('textbox', { name: 'Live ColorPicker prefix value', exact: true })
    .evaluate((node: HTMLInputElement) => {
      node.value = 'next';
      node.dispatchEvent(new Event('input', { bubbles: true }));
    });

  await expect.poll(() => page.evaluate(snapshotColorPickerPrefix)).toEqual(before);
  await expect(input).toBeFocused();
  await expect(input).toHaveValue('12');
  await page.getByRole('checkbox', { name: 'Custom prefix ColorPicker', exact: true })
    .dispatchEvent('click');
  const custom = page.getByRole('button', { name: 'Custom prefix color', exact: true });
  await expect(custom).toBeVisible();
  await custom.click();
  await expect(popup).not.toBeVisible();
  await custom.click();

  await expect(popup).toBeVisible();
  await popup.getByRole('textbox', { name: 'Hex color', exact: true }).press('Escape');
  await expect(custom).toBeFocused();
});
