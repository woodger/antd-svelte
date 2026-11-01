import { test, expect } from './test';

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=control-theme');
  await expect(page.getByRole('heading', { name: 'Source control tokens', exact: true })).toBeVisible();
});

test('Button consumes its own aliases, font weight and icon gap', async ({ page }) => {
  await expect(page.locator('#themed-primary')).toHaveCSS('background-color', 'rgb(255, 0, 0)');
  await expect(page.locator('#themed-primary')).toHaveCSS('font-weight', '600');
  await expect(page.locator('#themed-icon-gap')).toHaveCSS('column-gap', '3px');
  await expect(page.locator('#outside-control-primary')).toHaveCSS('background-color', 'rgb(22, 119, 255)');
});

test('Input tokens reach plain, affix, grouped and TextArea controls', async ({ page }) => {
  for (const id of ['themed-input', 'themed-affix', 'themed-group', 'themed-textarea',
    'themed-wrapped-textarea']) {
    await expect(page.locator('#' + id)).toHaveCSS('font-size', '17px');
    const paddingRoot = id === 'themed-affix'
      ? page.locator('#' + id).locator('..') : page.locator('#' + id);
    await expect(paddingRoot).toHaveCSS('padding-left', '5px');
  }
  await page.getByLabel('Themed plain input', { exact: true }).focus();
  await expect(page.locator('#themed-input')).toHaveCSS('border-color', 'rgb(0, 185, 107)');
});

test('Input tokens reach Password, Search and OTP composition', async ({ page }) => {
  await expect(page.locator('#themed-password')).toHaveCSS('font-size', '17px');
  await expect(page.locator('#themed-search')).toHaveCSS('font-size', '17px');
  await expect(page.locator('.ant-otp input')).toHaveCount(3);
  for (const input of await page.locator('.ant-otp input').all()) {
    await expect(input).toHaveCSS('font-size', '17px');
  }
  await expect(page.locator('#themed-search').locator('xpath=ancestor::*[contains(@class,"ant-input-search")]')
    .first().getByRole('button')).toHaveCSS('background-color', 'rgb(255, 0, 0)');
});

test('InputNumber consumes dimensions and persistent handles from its component tokens', async ({ page }) => {
  const root = page.getByLabel('Themed number', { exact: true }).locator('xpath=ancestor::div[contains(@class,"ant-input-number")][1]');
  await expect(root).toHaveCSS('width', '170px');
  await expect(page.getByLabel('Themed number', { exact: true })).toHaveCSS('font-size', '17px');
  await expect(root.locator('.ant-input-number-actions')).toHaveCSS('width', '22px');
  await root.hover();
  await expect(root.locator('.ant-input-number-actions')).toHaveCSS('width', '36px');

  await page.getByLabel('Handle token width', { exact: true }).fill('48');
  await root.hover();

  await expect(root.locator('.ant-input-number-actions')).toHaveCSS('width', '48px');
});

test('source token updates retain focus and do not replace a native input', async ({ page }) => {
  const input = page.getByLabel('Themed plain input', { exact: true });
  await input.fill('Edited text');
  const element = await input.elementHandle();

  await page.getByLabel('Input token font', { exact: true }).evaluate(element => {
    const input = element as HTMLInputElement;
    input.value = '19';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });

  await expect(input).toHaveCSS('font-size', '19px');
  expect(await input.evaluate((node, previous) => node === previous, element)).toBe(true);
  await expect(input).toHaveValue('Edited text');
  await expect(input).toBeFocused();
});

test('component aliases reset on a nested component root', async ({ page }) => {
  await expect(page.locator('#themed-addon')).toHaveCSS('color', 'rgb(160, 17, 187)');
  await expect(page.locator('#themed-nesting-parent')).toHaveCSS('color', 'rgb(160, 17, 187)');
  await expect(page.locator('#themed-nested-button')).toHaveCSS('color', 'rgba(0, 0, 0, 0.88)');
  expect(await page.locator('#themed-nested-button').evaluate(element =>
    getComputedStyle(element).getPropertyValue('--ant-color-text').trim()
  )).toBe('rgba(0,0,0,0.88)');
});

test('local theme inheritance resets aliases and prepared component variables', async ({ page }) => {
  await expect(page.locator('#inherited-control-input')).toHaveCSS('font-size', '17px');
  await expect(page.locator('#reset-control-input')).toHaveCSS('font-size', '17px');

  await page.getByLabel('Inherit child controls', { exact: true }).uncheck();

  await expect(page.locator('#reset-control-input')).toHaveCSS('font-size', '14px');
  await page.locator('#reset-control-input').focus();
  await expect(page.locator('#reset-control-input')).toHaveCSS('border-color', 'rgb(22, 119, 255)');
});

test('custom prefixes and hash=false keep source styles on every control root', async ({ page }) => {
  await page.getByLabel('Custom control CSS prefix', { exact: true }).check();
  await page.getByLabel('Hash themed controls', { exact: true }).uncheck();

  await expect(page.locator('#themed-primary')).toHaveCSS('background-color', 'rgb(255, 0, 0)');
  await expect(page.locator('#themed-input')).toHaveCSS('font-size', '17px');
  await expect(page.locator('#themed-primary')).toHaveClass(/control-source-scope/);
  await expect(page.locator('#themed-primary')).not.toHaveClass(/css-dev-only/);
});

test('plain style retains priority over prepared tokens and semantic style', async ({ page }) => {
  await expect(page.locator('#themed-style-priority')).toHaveCSS('font-size', '23px');
});

test('source style scopes update across algorithms and disappear with their provider', async ({ page }) => {
  const style = page.locator('head style[data-ant-svelte-theme="control-source-scope"]');
  await expect(style).toHaveCount(1);
  await page.getByLabel('Dark compact controls', { exact: true }).check();
  await expect(page.locator('#themed-input')).toHaveCSS('background-color', 'rgb(20, 20, 20)');
  await expect(page.locator('#themed-primary')).toHaveCSS('background-color', 'rgb(220, 3, 3)');

  await page.getByLabel('Mount themed controls', { exact: true }).uncheck();

  await expect(style).toHaveCount(0);
  await expect(page.locator('#outside-control-primary')).toHaveCSS('background-color', 'rgb(22, 119, 255)');
});

test('removing source settings restores native CSS without stale component variables', async ({ page }) => {
  await page.getByLabel('Apply source control tokens', { exact: true }).uncheck();

  await expect(page.locator('#themed-primary')).toHaveCSS('background-color', 'rgb(22, 119, 255)');
  await expect(page.locator('#themed-input')).toHaveCSS('font-size', '14px');
  await expect(page.locator('head style[data-ant-svelte-theme="control-source-scope"]')).toHaveCount(0);
});
