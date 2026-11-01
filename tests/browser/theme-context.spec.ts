import { test, expect } from './test';

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=theme-context');
  await expect(page.getByRole('heading', { name: 'ConfigProvider source tokens', exact: true }))
    .toBeVisible();
});

test('ConfigProvider applies global source colors and metrics before any interaction', async ({ page }) => {
  await expect(page.getByLabel('context-root-consumer primary', { exact: true })).toHaveText('#189cff');
  await expect(page.locator('#context-root-consumer-button'))
    .toHaveCSS('background-color', 'rgb(24, 156, 255)');
  await expect(page.locator('#context-root-consumer-button')).toHaveCSS('font-size', '15px');
  await expect(page.locator('#context-root-consumer-button')).toHaveCSS('height', '40px');
  await expect(page.locator('#context-root-consumer-card .ant-card-body')).toHaveCSS('padding', '24px');
  await expect(page.getByLabel('context-root-consumer css primary', { exact: true }))
    .toHaveText('var(--ant-color-primary)');
});

test('useToken and descendant CSS update together after changing the seed', async ({ page }) => {
  await page.getByLabel('Context primary', { exact: true }).fill('#00b96b');
  await page.getByLabel('Context font', { exact: true }).fill('16');
  await page.getByLabel('Context height', { exact: true }).fill('44');

  await expect(page.getByLabel('context-root-consumer primary', { exact: true })).toHaveText('#00b96b');
  await expect(page.getByLabel('context-inherited primary', { exact: true })).toHaveText('#00b96b');
  await expect(page.locator('#context-inherited-button')).toHaveCSS('background-color', 'rgb(0, 185, 107)');
  await expect(page.locator('#context-root-consumer-button')).toHaveCSS('font-size', '16px');
  await expect(page.locator('#context-root-consumer-button')).toHaveCSS('height', '44px');
  await expect(page.getByLabel('context-outside primary', { exact: true })).toHaveText('#1677ff');
  await expect(page.getByLabel('context-child primary', { exact: true })).toHaveText('#f5222d');
});

test('source algorithms control dark colors and compact metrics reactively', async ({ page }) => {
  await page.getByLabel('Context algorithm', { exact: true }).selectOption('dark-compact');

  await expect(page.getByLabel('context-root-consumer font', { exact: true })).toHaveText('12');
  await expect(page.getByLabel('context-root-consumer height', { exact: true })).toHaveText('36');
  await expect(page.locator('#context-root-consumer-button')).toHaveCSS('font-size', '12px');
  await expect(page.locator('#context-root-consumer-button')).toHaveCSS('height', '36px');
  await expect(page.locator('#context-root-consumer-card'))
    .toHaveCSS('background-color', 'rgb(20, 20, 20)');
  await expect(page.locator('#context-root-consumer-card .ant-card-body')).toHaveCSS('padding', '16px');

  await page.getByLabel('Context algorithm', { exact: true }).selectOption('default');

  await expect(page.locator('#context-root-consumer-card'))
    .toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(page.locator('#context-root-consumer-button')).toHaveCSS('height', '40px');
});

test('inherit=false resets parent algorithms, colors and component records', async ({ page }) => {
  await page.getByLabel('Context algorithm', { exact: true }).selectOption('dark');
  await page.getByLabel('Child inherits source tokens', { exact: true }).uncheck();

  await expect(page.getByLabel('context-reset primary', { exact: true })).toHaveText('#1677ff');
  await expect(page.getByLabel('context-reset font', { exact: true })).toHaveText('18');
  await expect(page.getByLabel('context-reset height', { exact: true })).toHaveText('32');
  await expect(page.getByLabel('context-reset component primary', { exact: true })).toBeEmpty();
  await expect(page.locator('#context-reset-card')).toHaveCSS('background-color', 'rgb(255, 255, 255)');

  await page.getByLabel('Child inherits source tokens', { exact: true }).check();

  await expect(page.getByLabel('context-reset component primary', { exact: true })).not.toBeEmpty();
  await expect(page.locator('#context-reset-card')).toHaveCSS('background-color', 'rgb(20, 20, 20)');
});

test('hashed and CSS prefix settings update without leaking into sibling scopes', async ({ page }) => {
  const rootHash = page.getByLabel('context-root-consumer hash', { exact: true });
  await expect(rootHash).toHaveText(/css-dev-only-do-not-override-/);

  await page.getByLabel('Context hash enabled', { exact: true }).uncheck();
  await page.getByLabel('Custom CSS prefix', { exact: true }).check();

  await expect(rootHash).toBeEmpty();
  await expect(page.getByLabel('context-root-consumer css primary', { exact: true }))
    .toHaveText('var(--custom-color-primary)');
  await expect(page.locator('#context-root-consumer-button'))
    .toHaveCSS('background-color', 'rgb(24, 156, 255)');
  await expect(page.getByLabel('context-outside css primary', { exact: true }))
    .toHaveText('var(--ant-color-primary)');
});

test('component algorithms recalculate only their own token record', async ({ page }) => {
  await expect(page.getByLabel('context-root-consumer component primary', { exact: true }))
    .toHaveText('#00b96b');

  await page.getByLabel('Component algorithm enabled', { exact: true }).uncheck();

  await expect(page.getByLabel('context-root-consumer component primary', { exact: true }))
    .toHaveText('#00B96B');
  await expect(page.getByLabel('context-root-consumer primary', { exact: true })).toHaveText('#189cff');
});

for (const [prefix, variable] of [
  ['MyScope2', '--my-scope-2-color-primary'],
  ['ANT', '--ant-color-primary'],
  ['', '--color-primary']
]) {
  test(`CSS prefix ${prefix || '(empty)'} keeps computed component colors`, async ({ page }) => {
    await page.getByLabel('CSS prefix value', { exact: true }).fill(prefix);
    await page.getByLabel('Custom CSS prefix', { exact: true }).check();

    await expect(page.getByLabel('context-root-consumer css primary', { exact: true }))
      .toHaveText(`var(${variable})`);
    await expect(page.locator('#context-root-consumer-button'))
      .toHaveCSS('background-color', 'rgb(24, 156, 255)');
    await expect(page.locator('#context-root-consumer-button')).toHaveCSS('font-size', '15px');
  });
}

test('explicit inline CSS overrides provider declarations without changing useToken values', async ({ page }) => {
  await expect(page.getByLabel('context-inline primary', { exact: true })).toHaveText('#123456');
  await expect(page.locator('#context-inline-button')).toHaveCSS('background-color', 'rgb(171, 205, 239)');
});

test('removing a source theme restores inherited defaults and removes generated declarations', async ({ page }) => {
  await page.getByLabel('Source context enabled', { exact: true }).uncheck();

  await expect(page.getByLabel('context-root-consumer primary', { exact: true })).toHaveText('#1677ff');
  await expect(page.locator('.source-context-provider')).not.toHaveAttribute('style');
  await expect(page.locator('#context-root-consumer-button')).toHaveCSS('height', '32px');
  await expect(page.locator('#context-root-consumer-button'))
    .toHaveCSS('background-color', 'rgb(22, 119, 255)');
});

test('native mode and density keep their existing CSS behavior alongside source token consumers', async ({ page }) => {
  await expect(page.locator('#context-native-button')).toHaveCSS('height', '28px');
  await expect(page.getByLabel('context-native primary', { exact: true })).toHaveText('#642ab5');

  await page.getByLabel('Native compact enabled', { exact: true }).uncheck();

  await expect(page.locator('#context-native-button')).toHaveCSS('height', '32px');
  await expect(page.getByLabel('context-native font', { exact: true })).toHaveText('14');
});

test('source variables survive a ColorPicker popup portal', async ({ page }) => {
  await page.getByLabel('Context algorithm', { exact: true }).selectOption('dark');
  await page.getByRole('button', { name: 'Context color picker', exact: true }).click();

  const popup = page.getByRole('dialog', { name: 'Color picker', exact: true });
  await expect(popup).toBeVisible();
  await expect(popup.locator('.ant-popover-container')).toHaveCSS('background-color', 'rgb(31, 31, 31)');

  await page.getByLabel('Context algorithm', { exact: true }).selectOption('default');

  await expect(popup).toBeVisible();
  await expect(popup.locator('.ant-popover-container')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
});
