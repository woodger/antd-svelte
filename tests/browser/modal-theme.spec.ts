import { test, expect } from './test';
import reference from './fixtures/ant-design-modal-theme-reference.json' with { type: 'json' };
import { snapshotModalTheme } from './modal-theme-metrics';

test.use({ viewport: reference.viewport });
test.beforeEach(async ({ page }) => { await page.goto('/?fixture=modal-theme'); });

for (const sample of reference.cases) {
  for (const [scope, expected] of Object.entries(sample.scopes)) {
    test(`Modal ${scope} theme matches source panel and footer for ${sample.name}`,
      async ({ page }) => {
        await page.getByLabel('Modal theme preset', { exact: true }).selectOption(sample.name);
        await page.getByLabel('Modal theme scope', { exact: true }).selectOption(scope);
        const input = page.getByRole('textbox', { name: 'Modal draft', exact: true });
        await expect(input).toBeVisible();
        await page.mouse.move(20, 1100);
        await input.focus();

        await expect.poll(() => page.evaluate(snapshotModalTheme)).toEqual(expected);
      });
  }

  for (const [mode, expected] of Object.entries(sample.modes)) {
    test(`Modal ${mode} theme matches source panel and footer for ${sample.name}`,
      async ({ page }) => {
        await page.getByLabel('Modal theme preset', { exact: true }).selectOption(sample.name);
        await page.getByLabel('Modal theme mode', { exact: true }).selectOption(mode);
        const input = page.getByRole('textbox', { name: 'Modal draft', exact: true });
        await expect(input).toBeVisible();
        await page.mouse.move(20, 1100);
        await input.focus();
        if (mode === 'close-hover') await page.locator('.ant-modal-close').hover();

        await expect.poll(() => page.evaluate(snapshotModalTheme)).toEqual(expected);
      });
  }
}

test('Modal token updates preserve native modality, input selection, focus and footer callbacks',
  async ({ page }) => {
    const input = page.getByRole('textbox', { name: 'Modal draft', exact: true });
    const dialog = page.getByRole('dialog', { name: 'Modal title', exact: true });
    await input.fill('Retained draft');
    await input.evaluate(node => (node as HTMLInputElement).setSelectionRange(1, 5, 'backward'));
    const originalInput = await input.elementHandle();
    const originalDialog = await dialog.elementHandle();
    const originalContainer = await page.locator('.ant-modal-container').elementHandle();

    await page.getByRole('button', { name: 'Update Modal tokens', exact: true })
      .dispatchEvent('click');

    await expect(page.locator('.ant-modal-title')).toHaveCSS('font-size', '26px');
    await expect(page.locator('.ant-modal-container'))
      .toHaveCSS('background-color', 'rgb(230, 255, 251)');
    await expect(input).toHaveValue('Retained draft');
    await expect(input).toBeFocused();
    expect(await input.evaluate((node, old) => node === old, originalInput)).toBe(true);
    expect(await dialog.evaluate((node, old) => node === old, originalDialog)).toBe(true);
    expect(await page.locator('.ant-modal-container').evaluate((node, old) => node === old,
      originalContainer)).toBe(true);
    expect(await dialog.evaluate(node => node.matches(':modal'))).toBe(true);
    expect(await input.evaluate(node => {
      const field = node as HTMLInputElement;
      return [field.selectionStart, field.selectionEnd, field.selectionDirection];
    })).toEqual([1, 5, 'backward']);
    expect(await page.getByRole('form', { name: 'Modal theme form' }).evaluate(node =>
      new FormData(node as HTMLFormElement).get('draft'))).toBe('Retained draft');
    await expect(page.getByLabel('Modal theme events', { exact: true })).toHaveText('[]');

    await page.getByRole('button', { name: 'OK', exact: true }).click();

    await expect(page.getByLabel('Modal theme events', { exact: true })).toHaveText('["ok"]');
    await expect(dialog).toBeVisible();
  });

test('Modal inheritance reset preserves its focused close control and isolates title tokens',
  async ({ page }) => {
    await page.getByLabel('Modal theme scope', { exact: true }).selectOption('nested');
    const input = page.getByRole('textbox', { name: 'Modal draft', exact: true });
    await input.fill('Nested draft');
    const original = await input.elementHandle();
    const close = page.locator('.ant-modal-close');
    await close.focus();
    const originalClose = await close.elementHandle();
    await expect(page.locator('.ant-modal-title')).toHaveCSS('font-size', '23px');

    await page.getByLabel('Inherit Modal theme', { exact: true }).dispatchEvent('click');

    await expect(page.locator('.ant-modal-title')).toHaveCSS('font-size', '16px');
    await expect(page.locator('.ant-modal-container'))
      .toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await expect(input).toHaveValue('Nested draft');
    await expect(close).toBeFocused();
    expect(await input.evaluate((node, old) => node === old, original)).toBe(true);
    expect(await close.evaluate((node, old) => node === old, originalClose)).toBe(true);
    expect(await page.getByRole('dialog').evaluate(node => node.matches(':modal'))).toBe(true);
    await expect(page.getByLabel('Modal theme events', { exact: true })).toHaveText('[]');
  });

test('Modal portal synchronization preserves component aliases, width, draft and focus',
  async ({ page }) => {
    await page.getByLabel('Modal theme preset', { exact: true }).selectOption('custom-css-prefix');
    await page.getByLabel('Modal theme mode', { exact: true }).selectOption('portal');
    const dialog = page.getByRole('dialog');
    const input = page.getByRole('textbox', { name: 'Modal draft', exact: true });
    await input.fill('Portal draft');
    const original = await input.elementHandle();
    expect(await dialog.evaluate(node => node.parentElement === document.body)).toBe(true);
    await expect(page.locator('.ant-modal-title')).toHaveCSS('font-size', '23px');

    await page.getByRole('button', { name: 'Update Modal tokens', exact: true })
      .dispatchEvent('click');

    await expect(page.locator('.ant-modal-title')).toHaveCSS('font-size', '26px');
    await expect(page.locator('.ant-modal-container'))
      .toHaveCSS('background-color', 'rgb(230, 255, 251)');
    await expect(dialog).toHaveCSS('width', '520px');
    await expect(input).toHaveValue('Portal draft');
    await expect(input).toBeFocused();
    expect(await input.evaluate((node, old) => node === old, original)).toBe(true);
    expect(await dialog.evaluate(node => node.matches(':modal'))).toBe(true);
    await expect(page.getByLabel('Modal theme events', { exact: true })).toHaveText('[]');
  });

test('Modal returns to legacy styling, retains its draft on reopen and releases modality on unmount',
  async ({ page }) => {
    const input = page.getByRole('textbox', { name: 'Modal draft', exact: true });
    await input.fill('Legacy draft');
    const original = await input.elementHandle();

    await page.getByLabel('Apply source Modal theme', { exact: true }).dispatchEvent('click');

    await expect(page.locator('.ant-modal-title')).toHaveCSS('font-size', '16px');
    await expect(page.locator('.ant-modal-close-x')).toHaveCount(0);
    await expect(input).toHaveValue('Legacy draft');
    await expect(input).toBeFocused();
    expect(await input.evaluate((node, old) => node === old, original)).toBe(true);
    expect(await page.getByRole('dialog').evaluate(node =>
      (node as HTMLElement).style.getPropertyValue('--ant-modal-title-font-size'))).toBe('');

    await input.press('Escape');

    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByLabel('Modal theme events', { exact: true })).toHaveText('["cancel"]');

    await page.getByRole('button', { name: 'Open themed Modal', exact: true }).click();

    await expect(input).toHaveValue('Legacy draft');
    expect(await input.evaluate((node, old) => node === old, original)).toBe(true);

    await page.getByLabel('Mount themed Modal', { exact: true }).dispatchEvent('click');

    await expect(page.locator('.ant-modal')).toHaveCount(0);
    expect(await original!.evaluate(node => node.isConnected)).toBe(false);
    expect(await page.evaluate(() => document.querySelector(':modal') === null)).toBe(true);
    await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden');
  });
