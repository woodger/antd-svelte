import { test, expect } from './test';
import reference from './fixtures/ant-design-divider-theme-reference.json' with { type: 'json' };
import { snapshotDividerTheme } from './divider-theme-metrics';

test.use({ viewport: reference.viewport });

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=divider-theme');
  await expect(page.getByRole('heading', { name: 'Source Divider tokens', exact: true }))
    .toBeVisible();
});

for (const sample of reference.cases) {
  test(`Divider component tokens match the source for ${sample.name}`, async ({ page }) => {
    await page.getByRole('combobox', { name: 'Divider token preset', exact: true })
      .selectOption(sample.name);
    await page.getByLabel('Divider theme RTL', { exact: true }).setChecked(Boolean(sample.rtl));

    await expect.poll(() => page.evaluate(snapshotDividerTheme)).toEqual(sample.metrics);
  });
}

test('Divider token updates preserve DOM and adjacent input focus', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Divider token preset', exact: true })
    .selectOption('own-tokens');
  const root = page.locator('[data-divider-theme="title"] .ant-divider');
  const original = await root.elementHandle();
  const input = page.getByLabel('Divider token neighbor', { exact: true });
  await input.fill('Draft');
  await input.focus();

  await page.getByRole('button', { name: 'Set Divider text padding to thirty', exact: true })
    .dispatchEvent('click');

  await expect(root.locator('.ant-divider-inner-text')).toHaveCSS('padding-inline-start', '30px');
  await expect(input).toBeFocused();
  await expect(input).toHaveValue('Draft');
  expect(await root.evaluate((node, before) => node === before, original)).toBe(true);
  await expect(page.locator('[data-divider-nested] .ant-divider-inner-text'))
    .toHaveCSS('padding-inline-start', '9px');
  await expect(page.locator('[data-divider-sibling] .ant-divider-inner-text'))
    .toHaveCSS('padding-inline-start', '7px');
});

test('Divider component themes isolate nested and sibling tokens and inherit=false', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Divider token preset', exact: true })
    .selectOption('own-tokens');
  const vertical = page.locator('[data-divider-theme="vertical"] .ant-divider');
  const nested = page.locator('[data-divider-nested] .ant-divider-vertical');

  await expect(vertical).toHaveCSS('margin-inline-start', '14px');
  await expect(nested).toHaveCSS('margin-inline-start', '14px');
  await expect(page.locator('[data-divider-outside] .ant-divider-inner-text'))
    .toHaveCSS('padding-inline-start', '16px');
  await expect(page.getByLabel('Divider token neighbor', { exact: true }))
    .toHaveCSS('font-size', '14px');

  await page.getByLabel('Inherit child Divider tokens', { exact: true }).dispatchEvent('click');

  await expect(nested).toHaveCSS('margin-inline-start', '8px');
  await expect(vertical).toHaveCSS('margin-inline-start', '14px');
});

test('Divider component aliases remain local to the separator', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Divider token preset', exact: true })
    .selectOption('component-aliases');

  await expect(page.locator('[data-divider-theme="title"] .ant-divider'))
    .toHaveCSS('font-size', '27px');
  await expect(page.getByLabel('Divider token neighbor', { exact: true }))
    .toHaveCSS('font-size', '14px');
  await expect(page.locator('[data-divider-sibling] .ant-divider'))
    .toHaveCSS('font-size', '16px');
});

test('Divider source variables precede root and content semantic styles', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Divider token preset', exact: true })
    .selectOption('own-tokens');

  await page.getByLabel('Divider theme style priority', { exact: true }).dispatchEvent('click');

  const content = page.locator('[data-divider-theme="title"] .ant-divider-inner-text');
  await expect(content).toHaveCSS('padding-inline-start', '31px');
  await expect(content).toHaveCSS('padding-inline-end', '37px');
});

test('Divider removes source variables and hashes without replacing the separator', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Divider token preset', exact: true })
    .selectOption('custom-prefix');
  const root = page.locator('[data-divider-theme="title"] .ant-divider');
  const original = await root.elementHandle();

  await expect(root).toHaveCSS('--divider-x-divider-text-padding-inline', '24px');
  await expect(root).toHaveClass(/(?:^|\s)css-(?:dev-only-do-not-override-)?[a-z0-9]+(?:\s|$)/);
  await page.getByLabel('Hash themed Dividers', { exact: true }).dispatchEvent('click');
  await expect(root).not.toHaveClass(/(?:^|\s)css-(?:dev-only-do-not-override-)?[a-z0-9]+(?:\s|$)/);

  await page.getByLabel('Apply source Divider tokens', { exact: true }).dispatchEvent('click');

  await expect(root.locator('.ant-divider-inner-text')).toHaveCSS('padding-inline-start', '16px');
  await expect(root).not.toHaveClass(/divider-theme-scope/);
  expect(await root.evaluate((node, before) => node === before, original)).toBe(true);
  await expect(page.locator('style[data-ant-svelte-theme="divider-theme-scope"]')).toHaveCount(0);
});

test('Unmounting themed Dividers removes their source scope and preserves a sibling', async ({ page }) => {
  await page.getByLabel('Mount themed Dividers', { exact: true }).dispatchEvent('click');

  await expect(page.locator('[data-divider-theme]')).toHaveCount(0);
  await expect(page.locator('style[data-ant-svelte-theme="divider-theme-scope"]')).toHaveCount(0);
  await expect(page.locator('style[data-ant-svelte-theme="divider-child-scope"]')).toHaveCount(0);
  await expect(page.locator('[data-divider-sibling] .ant-divider-inner-text'))
    .toHaveCSS('padding-inline-start', '7px');
});
