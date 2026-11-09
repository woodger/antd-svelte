import { test, expect } from './test';
import reference from './fixtures/ant-design-picker-theme-reference.json' with { type: 'json' };
import {
  snapshotPickerThemeInputs,
  snapshotPickerThemePopup,
  snapshotPickerThemeScroll
} from './picker-theme-metrics';

test.use({ viewport: reference.viewport });
test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date(reference.reference.now));
  await page.goto('/?fixture=picker-theme');
});

for (const sample of reference.cases) {
  test(`Picker input themes match source sizes, variants and scopes for ${sample.name}`,
    async ({ page }) => {
      await page.getByLabel('Picker theme preset', { exact: true }).selectOption(sample.name);

      await expect.poll(() => page.evaluate(snapshotPickerThemeInputs)).toEqual(sample.metrics);
    });

  for (const [mode, expected] of Object.entries(sample.focused)) {
    test(`Picker ${mode} focus theme matches source for ${sample.name}`, async ({ page }) => {
      await page.getByLabel('Picker theme preset', { exact: true }).selectOption(sample.name);
      await page.locator(`[data-picker-theme="normal"] [data-picker-input="${mode}"] input`)
        .first().focus();

      await expect.poll(() => page.evaluate(snapshotPickerThemeInputs)
        .then(metrics => metrics.normal[mode])).toEqual(expected);
    });
  }

  for (const [mode, expected] of Object.entries(sample.popups)) {
    test(`Picker ${mode} popup theme matches source for ${sample.name}`, async ({ page }) => {
      await page.getByLabel('Picker theme preset', { exact: true }).selectOption(sample.name);
      await page.getByLabel('Picker theme popup', { exact: true }).selectOption(mode);
      await page.locator(`[data-picker-theme="normal"] [data-picker-input="${mode}"]`)
        .scrollIntoViewIfNeeded();
      await expect(page.locator('.theme-picker-popup')).toBeVisible();

      await expect.poll(() => page.evaluate(snapshotPickerThemePopup)).toEqual(expected);
    });
  }
}

for (const sample of reference.headerCases) {
  test(`Datetime time header matches the source for ${sample.name}`, async ({ page }) => {
    await page.getByLabel('Picker theme preset', { exact: true }).selectOption('default');
    await page.getByLabel('Picker datetime header', { exact: true }).selectOption(sample.name);
    await page.getByLabel('Picker theme popup', { exact: true }).selectOption('datetime');
    await expect(page.locator('.theme-picker-popup')).toBeVisible();

    await expect.poll(() => page.evaluate(snapshotPickerThemePopup)).toEqual(sample.metrics);
  });
}

test('TimePicker token updates preserve source scroll positions, selection and commit precision',
  async ({ page }) => {
    await page.getByLabel('Picker theme popup', { exact: true }).selectOption('time');
    const input = page.locator('[data-picker-theme="normal"] [data-picker-input="time"] input');
    const popup = page.locator('.theme-picker-popup');
    await expect.poll(() => page.evaluate(snapshotPickerThemeScroll))
      .toEqual(reference.warmResize.before.columns);
    const originalInput = await input.elementHandle();
    const originalPopup = await popup.elementHandle();
    const selected = popup.locator('[data-type="hour"] .ant-picker-time-panel-cell-selected');
    const originalSelected = await selected.elementHandle();
    await input.focus();
    await input.evaluate(node => (node as HTMLInputElement).setSelectionRange(2, 5, 'backward'));

    await page.getByRole('button', { name: 'Update Picker tokens', exact: true })
      .dispatchEvent('click');

    await expect.poll(() => page.evaluate(snapshotPickerThemePopup))
      .toEqual(reference.warmResize.after.popup);
    await expect.poll(() => page.evaluate(snapshotPickerThemeScroll))
      .toEqual(reference.warmResize.after.columns);
    expect(await input.evaluate((node, old) => node === old, originalInput)).toBe(true);
    expect(await popup.evaluate((node, old) => node === old, originalPopup)).toBe(true);
    expect(await selected.evaluate((node, old) => node === old, originalSelected)).toBe(true);
    await expect(input).toBeFocused();
    await expect(input).toHaveValue('12:34:56');
    expect(await input.evaluate(node => {
      const input = node as HTMLInputElement;
      return [input.selectionStart, input.selectionEnd, input.selectionDirection];
    })).toEqual([2, 5, 'backward']);
    await expect(page.getByLabel('Picker theme events normal', { exact: true })).toHaveText('[]');

    await popup.getByRole('button', { name: 'hour 13', exact: true }).click();
    await popup.getByRole('button', { name: 'OK', exact: true }).click();

    await expect(input).toHaveValue(reference.commitObservation.input);
    const expected = reference.commitObservation.events
      .map(event => `change:${event.mode}:${event.value}`);
    await expect(page.getByLabel('Picker theme events normal', { exact: true }))
      .toHaveText(JSON.stringify(expected));
  });

for (const mode of ['date', 'datetime', 'range', 'datetime-range', 'time', 'time-range']) {
  test(`Picker ${mode} keeps its open popup, input draft and caret across token updates`,
    async ({ page }) => {
      await page.getByLabel('Picker theme popup', { exact: true }).selectOption(mode);
      const control = page.locator(`[data-picker-theme="normal"] [data-picker-input="${mode}"]`);
      const input = control.locator('input').first();
      const popup = page.locator('.theme-picker-popup');
      const originalInput = await input.elementHandle();
      const originalPopup = await popup.elementHandle();
      await input.fill('incomplete');
      await input.evaluate(node => (node as HTMLInputElement).setSelectionRange(1, 3, 'backward'));

      await page.getByRole('button', { name: 'Update Picker tokens', exact: true })
        .dispatchEvent('click');

      await expect(control.locator('.ant-picker')).toHaveCSS('padding-top', '10px');
      await expect(popup).toBeVisible();
      await expect(popup).toHaveCSS('position', 'fixed');
      expect(await popup.evaluate(node => [
        (node as HTMLElement).style.left, (node as HTMLElement).style.top
      ])).toEqual([expect.stringMatching(/px$/), expect.stringMatching(/px$/)]);
      expect(await input.evaluate((node, old) => node === old, originalInput)).toBe(true);
      expect(await popup.evaluate((node, old) => node === old, originalPopup)).toBe(true);
      await expect(input).toBeFocused();
      await expect(input).toHaveValue('incomplete');
      expect(await input.evaluate(node => {
        const input = node as HTMLInputElement;
        return [input.selectionStart, input.selectionEnd, input.selectionDirection];
      })).toEqual([1, 3, 'backward']);
      await expect(page.getByLabel('Picker theme events normal', { exact: true })).toHaveText('[]');
    });
}

test('Picker inheritance reset preserves the focused input and its unfinished value',
  async ({ page }) => {
    const input = page.locator('[data-picker-theme="nested"] [data-picker-input="time"] input');
    const original = await input.elementHandle();
    await input.fill('incomplete');
    await input.evaluate(node => (node as HTMLInputElement).setSelectionRange(1, 3, 'backward'));

    await page.getByLabel('Inherit Picker theme', { exact: true }).dispatchEvent('click');

    await expect(input).toHaveCSS('font-size', '16px');
    expect(await input.evaluate((node, old) => node === old, original)).toBe(true);
    await expect(input).toBeFocused();
    await expect(input).toHaveValue('incomplete');
    expect(await input.evaluate(node => {
      const input = node as HTMLInputElement;
      return [input.selectionStart, input.selectionEnd, input.selectionDirection];
    })).toEqual([1, 3, 'backward']);
    await expect(page.getByLabel('Picker theme events nested', { exact: true })).toHaveText('[]');
  });

test('Picker restores default styling and removes its portal without changing sibling themes',
  async ({ page }) => {
    await page.getByLabel('Picker theme popup', { exact: true }).selectOption('time');
    const control = page.locator('[data-picker-theme="normal"] [data-picker-input="time"]');
    const input = control.locator('input');
    const popup = page.locator('.theme-picker-popup');
    const originalInput = await input.elementHandle();
    const originalPopup = await popup.elementHandle();
    const selected = popup.locator('[data-type="hour"] .ant-picker-time-panel-cell-selected');
    const originalSelected = await selected.elementHandle();
    await input.focus();

    await page.getByLabel('Apply source Picker theme', { exact: true }).dispatchEvent('click');

    await expect(control.locator('.ant-picker')).toHaveCSS('font-size', '14px');
    await expect(selected).toHaveCSS('height', '28px');
    expect(await input.evaluate((node, old) => node === old, originalInput)).toBe(true);
    expect(await popup.evaluate((node, old) => node === old, originalPopup)).toBe(true);
    expect(await selected.evaluate((node, old) => node === old, originalSelected)).toBe(true);
    await expect(input).toBeFocused();
    await expect(input).toHaveValue('12:34:56');
    await expect(page.getByLabel('Picker theme events normal', { exact: true })).toHaveText('[]');

    await page.getByLabel('Mount themed pickers', { exact: true }).dispatchEvent('click');

    await expect(popup).toHaveCount(0);
    expect(await originalInput!.evaluate(node => node.isConnected)).toBe(false);
    expect(await originalPopup!.evaluate(node => node.isConnected)).toBe(false);
    await expect(page.locator('[data-picker-theme="sibling"] [data-picker-input="time"] input'))
      .toHaveCSS('font-size', '17px');
  });
