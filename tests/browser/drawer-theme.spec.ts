import { test, expect } from './test';
import reference from './fixtures/ant-design-drawer-theme-reference.json' with { type: 'json' };
import { snapshotDrawerTheme } from './drawer-theme-metrics';

test.use({ viewport: reference.viewport });
test.beforeEach(async ({ page }) => { await page.goto('/?fixture=drawer-theme'); });

for (const sample of reference.cases) {
  for (const [scope, expected] of Object.entries(sample.scopes)) {
    test(`Drawer ${scope} theme matches source panel and footer for ${sample.name}`,
      async ({ page }) => {
        await page.getByLabel('Drawer theme preset', { exact: true }).selectOption(sample.name);
        await page.getByLabel('Drawer theme scope', { exact: true }).selectOption(scope);
        const input = page.getByRole('textbox', { name: 'Drawer draft', exact: true });
        await expect(input).toBeVisible();
        await page.mouse.move(20, 1100);
        await input.focus();

        await expect.poll(() => page.evaluate(snapshotDrawerTheme)).toEqual(expected);
      });
  }

  for (const [mode, expected] of Object.entries(sample.modes)) {
    test(`Drawer ${mode} theme matches source panel and footer for ${sample.name}`,
      async ({ page }) => {
        await page.getByLabel('Drawer theme preset', { exact: true }).selectOption(sample.name);
        await page.getByLabel('Drawer theme mode', { exact: true }).selectOption(mode);
        const input = page.getByRole('textbox', { name: 'Drawer draft', exact: true });
        await expect(input).toBeVisible();
        await page.mouse.move(20, 1100);
        await input.focus();
        if (mode === 'close-hover') await page.locator('.ant-drawer-close').hover();

        await expect.poll(() => page.evaluate(snapshotDrawerTheme)).toEqual(expected);
      });
  }
}

test('Drawer token updates preserve native modality, content, selection and focus',
  async ({ page }) => {
    const input = page.getByRole('textbox', { name: 'Drawer draft', exact: true });
    const dialog = page.getByRole('dialog', { name: 'Drawer title', exact: true });
    await input.fill('Retained draft');
    await input.evaluate(node => (node as HTMLInputElement).setSelectionRange(1, 5, 'backward'));
    const originalInput = await input.elementHandle();
    const originalDialog = await dialog.elementHandle();
    const originalSection = await page.locator('.ant-drawer-section').elementHandle();

    await page.getByRole('button', { name: 'Update Drawer tokens', exact: true })
      .dispatchEvent('click');

    await expect(page.locator('.ant-drawer-footer')).toHaveCSS('padding', '19px 31px');
    await expect(input).toHaveValue('Retained draft');
    await expect(input).toBeFocused();
    expect(await input.evaluate((node, old) => node === old, originalInput)).toBe(true);
    expect(await dialog.evaluate((node, old) => node === old, originalDialog)).toBe(true);
    expect(await page.locator('.ant-drawer-section').evaluate((node, old) => node === old,
      originalSection)).toBe(true);
    expect(await dialog.evaluate(node => node.matches(':modal'))).toBe(true);
    expect(await input.evaluate(node => {
      const field = node as HTMLInputElement;
      return [field.selectionStart, field.selectionEnd, field.selectionDirection];
    })).toEqual([1, 5, 'backward']);
    expect(await page.getByRole('form', { name: 'Drawer theme form' }).evaluate(node =>
      new FormData(node as HTMLFormElement).get('draft'))).toBe('Retained draft');
    await expect(page.getByLabel('Drawer theme events', { exact: true })).toHaveText('[]');
  });

test('Drawer inheritance reset preserves its current editor and isolates footer tokens',
  async ({ page }) => {
    await page.getByLabel('Drawer theme scope', { exact: true }).selectOption('nested');
    const input = page.getByRole('textbox', { name: 'Drawer draft', exact: true });
    await input.fill('Nested draft');
    const original = await input.elementHandle();
    await expect(page.locator('.ant-drawer-footer')).toHaveCSS('padding', '13px 27px');

    await page.getByLabel('Inherit Drawer theme', { exact: true }).dispatchEvent('click');

    await expect(page.locator('.ant-drawer-footer')).toHaveCSS('padding', '8px 16px');
    await expect(page.locator('.ant-drawer-title')).toHaveCSS('color', 'rgba(0, 0, 0, 0.88)');
    await expect(input).toHaveValue('Nested draft');
    await expect(input).toBeFocused();
    expect(await input.evaluate((node, old) => node === old, original)).toBe(true);
    expect(await page.getByRole('dialog').evaluate(node => node.matches(':modal'))).toBe(true);
    await expect(page.getByLabel('Drawer theme events', { exact: true })).toHaveText('[]');

    await page.getByRole('button', { name: 'Save', exact: true }).click();

    await expect(page.getByLabel('Drawer theme events', { exact: true })).toHaveText('["save"]');
    await expect(page.getByRole('dialog')).toBeVisible();
  });

test('Drawer portal synchronization preserves local variables and focus after theme updates',
  async ({ page }) => {
    await page.getByLabel('Drawer theme preset', { exact: true }).selectOption('custom-css-prefix');
    await page.getByLabel('Drawer theme scope', { exact: true }).selectOption('variable');
    await page.getByLabel('Drawer theme mode', { exact: true }).selectOption('portal');
    const dialog = page.getByRole('dialog');
    const input = page.getByRole('textbox', { name: 'Drawer draft', exact: true });
    await input.fill('Portal draft');
    const original = await input.elementHandle();
    expect(await dialog.evaluate(node => node.parentElement === document.body)).toBe(true);
    await expect(page.locator('.ant-drawer-footer')).toHaveCSS('padding', '17px 27px');

    await page.getByRole('button', { name: 'Update Drawer tokens', exact: true })
      .dispatchEvent('click');

    await expect(page.locator('.ant-drawer-footer')).toHaveCSS('padding', '17px 31px');
    await expect(page.locator('.ant-drawer-title')).toHaveCSS('color', 'rgb(114, 46, 209)');
    await expect(input).toHaveValue('Portal draft');
    await expect(input).toBeFocused();
    expect(await input.evaluate((node, old) => node === old, original)).toBe(true);
    expect(await dialog.evaluate(node => node.matches(':modal'))).toBe(true);
    await expect(page.getByLabel('Drawer theme events', { exact: true })).toHaveText('[]');
  });

test('Drawer returns to legacy styling, keeps its draft on reopen and releases modality on unmount',
  async ({ page }) => {
    const input = page.getByRole('textbox', { name: 'Drawer draft', exact: true });
    await input.fill('Legacy draft');
    const original = await input.elementHandle();

    await page.getByLabel('Apply source Drawer theme', { exact: true }).dispatchEvent('click');

    await expect(page.locator('.ant-drawer-footer')).toHaveCSS('padding', '8px 16px');
    await expect(input).toHaveValue('Legacy draft');
    await expect(input).toBeFocused();
    expect(await input.evaluate((node, old) => node === old, original)).toBe(true);
    expect(await page.getByRole('dialog').evaluate(node =>
      (node as HTMLElement).style.getPropertyValue('--ant-drawer-footer-padding-block'))).toBe('');

    await input.press('Escape');

    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByLabel('Drawer theme events', { exact: true })).toHaveText('["close"]');

    await page.getByRole('button', { name: 'Open themed Drawer', exact: true }).click();

    await expect(input).toHaveValue('Legacy draft');
    expect(await input.evaluate((node, old) => node === old, original)).toBe(true);

    await page.getByLabel('Mount themed Drawer', { exact: true }).dispatchEvent('click');

    await expect(page.locator('.ant-drawer')).toHaveCount(0);
    expect(await original!.evaluate(node => node.isConnected)).toBe(false);
    expect(await page.evaluate(() => document.querySelector(':modal') === null)).toBe(true);
    await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden');
  });
