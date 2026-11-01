import { test, expect } from './test';

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=color-picker');
  await expect(page.getByRole('button', { name: 'Color picker', exact: true })).toBeVisible();
});

test('ColorPicker opens from a native button and dismisses without submitting', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'Color picker', exact: true });
  await expect(trigger).toHaveClass(/configured-color/);
  await expect(trigger).toContainText('#1677FF');
  await trigger.press('Enter');

  await expect(page.getByRole('dialog', { name: 'Color picker' })).toBeVisible();
  await expect(page.getByLabel('Hex color', { exact: true })).toHaveValue('1677ff');
  await page.getByLabel('Hex color', { exact: true }).focus();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await expect(page.getByRole('dialog', { name: 'Color picker' })).toHaveCount(0);
  await expect(page.getByLabel('Color submissions', { exact: true })).toHaveText('0');
});

test('ColorPicker sanitizes hex drafts and publishes change before complete', async ({ page }) => {
  await page.getByRole('button', { name: 'Color picker', exact: true }).click();
  await page.getByLabel('Hex color', { exact: true }).fill('ff');
  await expect(page.getByLabel('Color css', { exact: true })).toHaveText('');
  await page.getByLabel('Hex color', { exact: true }).fill('ff_00_gg');
  await expect(page.getByLabel('Hex color', { exact: true })).toHaveValue('ff00');
  await page.getByLabel('Hex color', { exact: true }).fill('ff5500');

  await expect(page.getByLabel('Color css', { exact: true })).toHaveText('rgb(255,85,0)');
  await expect(page.getByLabel('Color events', { exact: true }))
    .toContainText('change:rgb(255,85,0)|complete:rgb(255,85,0)');
});

test('ColorPicker clears once and preserves source saturation when restoring its hue', async ({ page }) => {
  await page.getByRole('button', { name: 'Color picker', exact: true }).click();
  await page.getByRole('button', { name: 'Clear color', exact: true }).click();
  const events = page.getByLabel('Color events', { exact: true });
  await expect(events).toContainText('|clear');
  const previous = await events.textContent();
  await page.getByRole('button', { name: 'Clear color', exact: true }).click();
  await expect(events).toHaveText(previous!);
  await expect(page.getByRole('button', { name: 'Color picker', exact: true })).toContainText('Прозрачный');
  await page.getByRole('slider', { name: 'Hue', exact: true }).press('Home');
  await expect(page.getByLabel('Color css', { exact: true })).toHaveText('rgb(255,22,22)');
});

test('ColorPicker selects preset colors with native buttons and retains collapsed groups', async ({ page }) => {
  await page.getByRole('button', { name: 'Color picker', exact: true }).click();
  await page.getByRole('button', { name: 'rgb(0,255,0)', exact: true }).press('Space');

  await expect(page.getByLabel('Color css', { exact: true })).toHaveText('rgb(0,255,0)');
  await expect(page.getByRole('button', { name: 'rgb(0,255,0)', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: /Gradients/ })).toHaveAttribute('aria-expanded', 'false');
  await page.getByRole('button', { name: /Gradients/ }).click();
  await page.getByRole('button', { name: 'linear-gradient(90deg, rgb(0,0,0) 0%, rgb(255,255,255) 100%)', exact: true }).click();
  await expect(page.locator('.ant-color-picker-gradient-slider input')).toHaveCount(2);
});

test('ColorPicker switches formats and edits RGB and rounded HSB fields', async ({ page }) => {
  await page.getByRole('button', { name: 'Color picker', exact: true }).click();
  await page.getByRole('combobox', { name: 'Color format', exact: true }).click();
  await page.getByRole('option', { name: 'RGB', exact: true }).click();
  await page.getByLabel('Color r', { exact: true }).fill('255');
  await page.getByLabel('Color r', { exact: true }).press('Enter');
  await expect(page.getByLabel('Color css', { exact: true })).toHaveText('rgb(255,119,255)');
  await page.getByRole('combobox', { name: 'Color format', exact: true }).click();
  await page.getByRole('option', { name: 'HSB', exact: true }).click();
  await expect(page.getByLabel('Color s', { exact: true })).toHaveValue(/%$/);
  await page.getByLabel('Color h', { exact: true }).fill('120');
  await page.getByLabel('Color h', { exact: true }).press('Enter');
  await expect(page.getByLabel('Color h', { exact: true })).toHaveValue('120');
});

test('ColorPicker adds interpolated gradient stops and preserves identity while crossing', async ({ page }) => {
  await page.getByRole('button', { name: 'Set gradient owner', exact: true }).click();
  await page.getByRole('button', { name: 'Color picker', exact: true }).click();
  const gradient = page.locator('.ant-color-picker-gradient-slider');
  const box = (await gradient.boundingBox())!;
  await page.mouse.click(box.x + box.width * .5, box.y + box.height / 2);

  await expect(page.getByLabel('Color css', { exact: true }))
    .toHaveText('linear-gradient(90deg, rgb(255,0,0) 0%, rgb(128,0,128) 50%, rgb(0,0,255) 100%)');
  const first = gradient.locator('input').first();
  const start = (await first.boundingBox())!;
  await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * .8, box.y + box.height / 2);
  await page.mouse.up();

  await expect(page.getByLabel('Color css', { exact: true }))
    .toHaveText('linear-gradient(90deg, rgb(128,0,128) 50%, rgb(255,0,0) 80%, rgb(0,0,255) 100%)');
});

test('ColorPicker restores its cached gradient after a single-mode round trip', async ({ page }) => {
  await page.getByRole('button', { name: 'Set gradient owner', exact: true }).click();
  await page.getByRole('button', { name: 'Color picker', exact: true }).click();
  await page.getByText('Один цвет', { exact: true }).click();
  await expect(page.getByLabel('Color css', { exact: true })).toHaveText('rgb(255,0,0)');
  await page.getByText('Градиент', { exact: true }).click();

  await expect(page.getByLabel('Color css', { exact: true }))
    .toHaveText('linear-gradient(90deg, rgb(255,0,0) 0%, rgb(0,0,255) 100%)');
});

test('ColorPicker preserves controlled owner values until completion and supports rejection', async ({ page }) => {
  await page.getByLabel('Freeze color owner', { exact: true }).check();
  await page.getByRole('button', { name: 'Color picker', exact: true }).click();
  await page.getByRole('slider', { name: 'Hue', exact: true }).press('Home');

  await expect(page.getByRole('button', { name: 'Color picker', exact: true })).toContainText('#1677FF');
  await expect(page.getByLabel('Hex color', { exact: true })).toHaveValue('1677ff');
});

test('ColorPicker edits palette saturation and brightness with keyboard without form submission', async ({ page }) => {
  await page.getByRole('button', { name: 'Color picker', exact: true }).click();
  await page.getByRole('button', { name: 'Saturation and brightness', exact: true }).press('ArrowLeft');

  await expect(page.getByLabel('Color css', { exact: true })).not.toHaveText('');
  await expect(page.getByLabel('Color events', { exact: true })).toContainText('complete:');
  await expect(page.getByLabel('Color submissions', { exact: true })).toHaveText('0');
});

test('ColorPicker disables through ConfigProvider and honors custom trigger and panel snippets', async ({ page }) => {
  await page.getByLabel('Disable all components', { exact: true }).check();
  await expect(page.getByRole('button', { name: 'Color picker', exact: true })).toBeDisabled();
  await page.getByLabel('Disable all components', { exact: true }).uncheck();
  await page.getByLabel('Custom color trigger', { exact: true }).check();
  await page.getByLabel('Custom color panel', { exact: true }).check();
  await page.getByRole('button', { name: 'Custom color button', exact: true }).click();

  await expect(page.getByText('Custom picker panel', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Hex color', { exact: true })).toHaveValue('1677ff');
});

test('ColorPicker moves its popup into a custom container and removes it on unmount', async ({ page }) => {
  await page.getByLabel('Color portal', { exact: true }).check();
  await page.getByRole('button', { name: 'Color picker', exact: true }).click();
  await expect(page.locator('#color-portal [role=dialog]')).toBeVisible();
  await page.getByLabel('Mount color', { exact: true })
    .evaluate((input: HTMLInputElement) => input.click());

  await expect(page.locator('#color-portal [role=dialog]')).toHaveCount(0);
});

test('InputNumber formatter parses displayed percentages and preserves numeric form values', async ({ page }) => {
  const input = page.getByRole('spinbutton', { name: 'Formatted number', exact: true });
  await expect(input).toHaveValue('50%');
  await input.fill('75%');
  await input.press('Enter');

  await expect(input).toHaveValue('75%');
  await expect(page.getByLabel('Formatted number value', { exact: true })).toHaveText('75');
  expect(await page.locator('form').evaluate((form: HTMLFormElement) =>
    new FormData(form).get('formatted-number'))).toBe('75');
  await input.press('ArrowUp');
  await expect(input).toHaveValue('76%');
});

test('ColorPicker initializes a cleared black owner through the hue control', async ({ page }) => {
  await page.getByRole('button', { name: 'Clear color owner', exact: true }).click();
  await page.getByRole('button', { name: 'Color picker', exact: true }).click();
  await page.getByRole('slider', { name: 'Hue', exact: true }).press('Home');
  await expect(page.getByLabel('Color css', { exact: true })).toHaveText('');
  await page.getByRole('slider', { name: 'Hue', exact: true }).press('ArrowRight');

  await expect(page.getByLabel('Color css', { exact: true })).toHaveText('rgb(255,4,0)');
});

test('ColorPicker allows its format dropdown to extend beyond a panel without presets', async ({ page }) => {
  await page.getByLabel('Color presets', { exact: true }).uncheck();
  await page.getByRole('button', { name: 'Color picker', exact: true }).click();
  await page.getByRole('combobox', { name: 'Color format', exact: true }).click();
  await page.getByRole('option', { name: 'RGB', exact: true }).click();

  await expect(page.getByLabel('Color r', { exact: true })).toHaveValue('22');
});

test('ColorPicker restores a controlled zero-valued RGB field after an empty draft loses focus', async ({ page }) => {
  await page.getByRole('button', { name: 'Set gradient owner', exact: true }).click();
  await page.getByRole('button', { name: 'Color picker', exact: true }).click();
  await page.getByRole('combobox', { name: 'Color format', exact: true }).click();
  await page.getByRole('option', { name: 'RGB', exact: true }).click();
  const input = page.getByLabel('Color g', { exact: true });
  await input.fill('');
  await input.press('Tab');

  await expect(input).toHaveValue('0');
});

test('ColorPicker keeps palette modes and numeric editors out of the native form data', async ({ page }) => {
  await page.getByRole('button', { name: 'Color picker', exact: true }).click();
  const fields = await page.locator('form').evaluate((form: HTMLFormElement) =>
    [...new FormData(form)]);

  expect(fields).toEqual([['formatted-number', '50']]);
  expect(await page.locator('[role=dialog]').evaluate(popup => popup.closest('form'))).toBeNull();
});

test('ColorPicker keeps focus when a controlled owner rejects closing its popup', async ({ page }) => {
  await page.getByLabel('Controlled color popup', { exact: true }).check();
  await page.getByLabel('Color popup owner', { exact: true }).check();
  await page.getByLabel('Freeze color popup', { exact: true })
    .evaluate((input: HTMLInputElement) => input.click());
  const input = page.getByLabel('Hex color', { exact: true });
  await input.focus();
  await input.press('Escape');

  await expect(page.getByRole('dialog', { name: 'Color picker' })).toBeVisible();
  await expect(input).toBeFocused();
});

test('ColorPicker resets a rejected popup request when its controlled prop is removed', async ({ page }) => {
  await page.getByLabel('Controlled color popup', { exact: true }).check();
  await page.getByLabel('Freeze color popup', { exact: true }).check();
  await page.getByRole('button', { name: 'Color picker', exact: true }).click();
  await page.getByLabel('Controlled color popup', { exact: true }).uncheck();

  await expect(page.getByRole('dialog', { name: 'Color picker' })).toHaveCount(0);
});

test('ColorPicker keeps format controlled and restores HEX after that prop is removed', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Fixed color format', exact: true }).selectOption('rgb');
  await page.getByRole('button', { name: 'Color picker', exact: true }).click();
  await page.getByRole('combobox', { name: 'Color format', exact: true }).click();
  await page.getByRole('option', { name: 'HSB', exact: true }).click();
  await expect(page.getByLabel('Color r', { exact: true })).toBeVisible();
  await expect(page.getByRole('combobox', { name: 'Color format', exact: true })).toHaveValue('RGB');
  await page.keyboard.press('Escape');
  await page.getByRole('combobox', { name: 'Fixed color format', exact: true }).selectOption({ label: 'Auto' });
  await page.getByRole('button', { name: 'Color picker', exact: true }).click();
  await expect(page.getByLabel('Hex color', { exact: true })).toHaveValue('1677ff');
});

test('ColorPicker gives repeated Picker snippets independent palette geometry', async ({ page }) => {
  await page.getByLabel('Custom color panel', { exact: true }).check();
  await page.getByLabel('Repeat color pickers', { exact: true }).check();
  await page.getByRole('button', { name: 'Color picker', exact: true }).click();
  const palettes = page.locator('.ant-color-picker-select');
  await expect(palettes).toHaveCount(2);
  const box = (await palettes.first().boundingBox())!;
  await page.mouse.click(box.x + box.width * .25, box.y + box.height * .5);

  await expect(page.getByLabel('Color css', { exact: true })).toHaveText('rgb(96,109,128)');
});

test('ColorPicker applies preset defaults only on creation and resets them after remount', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'Color picker', exact: true });
  await trigger.click();
  await expect(page.getByRole('button', { name: 'Colors', exact: true })).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await page.getByLabel('Collapsed color defaults', { exact: true }).check();
  await trigger.click();
  await expect(page.getByRole('button', { name: 'Colors', exact: true })).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await page.getByLabel('Color presets', { exact: true }).uncheck();
  await page.getByLabel('Color presets', { exact: true }).check();
  await trigger.click();
  await expect(page.getByRole('button', { name: 'Colors', exact: true })).toHaveAttribute('aria-expanded', 'false');
});

test('ColorPicker restores the mode derived from a rejected controlled gradient array', async ({ page }) => {
  await page.getByRole('button', { name: 'Set gradient owner', exact: true }).click();
  await page.getByLabel('Freeze color owner', { exact: true }).check();
  await page.getByRole('button', { name: 'Color picker', exact: true }).click();
  await page.getByText('Один цвет', { exact: true }).click();

  await expect(page.getByRole('radio', { name: 'Градиент', exact: true })).toBeChecked();
  await expect(page.locator('.ant-color-picker-gradient-slider input')).toHaveCount(2);
});

test('ColorPicker publishes palette movement before completing on pointer release', async ({ page }) => {
  await page.getByRole('button', { name: 'Color picker', exact: true }).click();
  const box = (await page.locator('.ant-color-picker-select').boundingBox())!;
  await page.mouse.move(box.x + box.width * .25, box.y + box.height * .5);
  await page.mouse.down();

  await expect(page.getByLabel('Color css', { exact: true })).toHaveText('rgb(96,109,128)');
  await expect(page.getByLabel('Color events', { exact: true })).not.toContainText('complete:');
  await page.mouse.up();
  await expect(page.getByLabel('Color events', { exact: true }))
    .toContainText('complete:rgb(96,109,128)');
});

test('ColorPicker preserves source keyboard gradient deletion including one remaining stop', async ({ page }) => {
  await page.getByRole('button', { name: 'Set gradient owner', exact: true }).click();
  await page.getByRole('button', { name: 'Color picker', exact: true }).click();
  await page.locator('.ant-color-picker-gradient-slider input').first().press('Delete');

  await expect(page.getByLabel('Color css', { exact: true }))
    .toHaveText('linear-gradient(90deg, rgb(0,0,255) 100%)');
  await expect(page.locator('.ant-color-picker-gradient-slider input')).toHaveCount(1);
  await page.locator('.ant-color-picker-gradient-slider input').first().press('Backspace');
  await expect(page.getByRole('button', { name: 'Color picker', exact: true })).toContainText('Прозрачный');
});

test('ColorPicker keeps controlled display during drag and accepts a completion-only update', async ({ page }) => {
  await page.getByLabel('Complete color only', { exact: true }).check();
  await page.getByRole('button', { name: 'Color picker', exact: true }).click();
  const box = (await page.locator('.ant-color-picker-select').boundingBox())!;
  await page.mouse.move(box.x + box.width * .25, box.y + box.height * .5);
  await page.mouse.down();

  await expect(page.getByRole('button', { name: 'Color picker', exact: true })).toContainText('#1677FF');
  await page.mouse.up();
  await expect(page.getByRole('button', { name: 'Color picker', exact: true })).toContainText('#606D80');
});

test('ColorPicker preserves default/uncontrolled changes independently of the owner', async ({ page }) => {
  await page.getByLabel('Controlled color', { exact: true }).uncheck();
  await page.getByRole('button', { name: 'Color picker', exact: true }).click();
  await page.getByRole('button', { name: 'rgb(255,0,0)', exact: true }).click();

  await expect(page.getByRole('button', { name: 'Color picker', exact: true })).toContainText('#FF0000');
});

test('ColorPicker removes alpha controls and enforces source opacity on the next change', async ({ page }) => {
  await page.getByRole('button', { name: 'Set alpha owner', exact: true }).click();
  await page.getByLabel('Disable color alpha', { exact: true }).check();
  await page.getByRole('button', { name: 'Color picker', exact: true }).click();
  await expect(page.getByRole('slider', { name: 'Alpha', exact: true })).toHaveCount(0);
  await expect(page.getByRole('spinbutton', { name: 'Color alpha', exact: true })).toHaveCount(0);
  await page.getByLabel('Hex color', { exact: true }).fill('00ff0080');

  await expect(page.getByLabel('Color css', { exact: true })).toHaveText('rgb(0,255,0)');
});

test('ColorPicker keeps hover entry and leave delays and does not open from a touch pointer', async ({ page }) => {
  await page.getByLabel('Hover color trigger', { exact: true }).check();
  const trigger = page.getByRole('button', { name: 'Color picker', exact: true });
  await trigger.hover();
  await expect(page.getByRole('dialog', { name: 'Color picker' })).toBeVisible();
  await page.mouse.move(1100, 680);
  await expect(page.getByRole('dialog', { name: 'Color picker' })).toHaveCount(0);
  await trigger.dispatchEvent('pointerenter', { pointerType: 'touch' });
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
});

test('ColorPicker keeps drafts while hidden and discards them when destroyOnHidden is enabled', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'Color picker', exact: true });
  await trigger.click();
  await page.getByLabel('Hex color', { exact: true }).fill('ff');
  await page.keyboard.press('Escape');
  await trigger.click();
  await expect(page.getByLabel('Hex color', { exact: true })).toHaveValue('ff');
  await page.keyboard.press('Escape');
  await page.getByLabel('Destroy color popup', { exact: true }).check();
  await trigger.click();
  await page.getByLabel('Hex color', { exact: true }).fill('ab');
  await page.keyboard.press('Escape');
  await trigger.click();
  await expect(page.getByLabel('Hex color', { exact: true })).toHaveValue('1677ff');
});

test('ColorPicker removes a focused numeric popup field without stale callbacks or an orphaned portal', async ({ page }) => {
  await page.getByLabel('Color portal', { exact: true }).check();
  await page.getByRole('button', { name: 'Color picker', exact: true }).click();
  await page.getByLabel('Color alpha', { exact: true }).fill('70%');
  await page.getByLabel('Mount color', { exact: true })
    .evaluate((input: HTMLInputElement) => input.click());

  await expect(page.locator('#color-portal [role=dialog]')).toHaveCount(0);
});

for (const placement of ['top', 'bottom', 'left', 'right', 'topLeft', 'topRight',
  'bottomLeft', 'bottomRight', 'leftTop', 'leftBottom', 'rightTop', 'rightBottom']) {
  test(`ColorPicker supports ${placement} placement without viewport overflow`, async ({ page }) => {
    await page.getByRole('combobox', { name: 'Color placement', exact: true }).selectOption(placement);
    await page.getByRole('button', { name: 'Color picker', exact: true }).click();
    const popup = page.getByRole('dialog', { name: 'Color picker' });

    await expect(popup).toBeVisible();
    const bounds = (await popup.boundingBox())!;
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.y).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(1280);
    expect(bounds.y + bounds.height).toBeLessThanOrEqual(720);
  });
}

test.describe('mobile ColorPicker', () => {
  test.use({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
  test('uses real palette touch and releases a cancelled gesture on unmount', async ({ page }) => {
    await page.getByRole('button', { name: 'Color picker', exact: true }).tap();
    const box = (await page.locator('.ant-color-picker-select').boundingBox())!;
    const cdp = await page.context().newCDPSession(page);
    try {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [
        { x: box.x + box.width * .25, y: box.y + box.height * .5 }
      ] });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [
        { x: box.x + box.width * .5, y: box.y + box.height * .25 }
      ] });
      await expect(page.getByLabel('Color events', { exact: true })).not.toContainText('complete:');
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
      await page.getByLabel('Mount color', { exact: true })
        .evaluate((input: HTMLInputElement) => input.click());
      await expect(page.locator('.ant-color-picker-select')).toHaveCount(0);
    } finally {
      await cdp.detach();
    }
  });
});
