import { test, expect } from './test';
import reference from './fixtures/ant-design-skeleton-main-reference.json' with { type: 'json' };
import { snapshotSkeletonMain } from './skeleton-main-metrics';

const frame = '[data-skeleton-main-frame]';
const host = `${frame} > .ant-skeleton-host`;
const placeholder = `${frame} [data-ant-skeleton-main]`;

test.use({ viewport: reference.viewport });
test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=skeleton-main');

  await expect(page.getByRole('heading', { name: 'Source Skeleton main API', exact: true }))
    .toBeVisible();
  expect(await page.evaluate(() => document.compatMode)).toBe(reference.reference.documentMode);
});

for (const sample of reference.cases) {
  test(`Skeleton main matches the source for ${sample.name}`, async ({ page }) => {
    await page.getByRole('combobox', { name: 'Skeleton main case', exact: true })
      .selectOption(sample.name);

    await expect.poll(() => page.evaluate(snapshotSkeletonMain,
      'prefixCls' in sample.props ? sample.props.prefixCls || 'ant-skeleton' : 'ant-skeleton'))
      .toEqual(sample.snapshot);
  });
}

test('Skeleton main preserves its host and placeholder when changing the CSS prefix', async ({ page }) => {
  const originalHost = await page.locator(host).elementHandle();
  const originalPlaceholder = await page.locator(placeholder).elementHandle();
  await page.getByRole('button', { name: 'Change main Skeleton prefix', exact: true }).click();

  await expect(page.locator(placeholder)).toHaveClass(/live-skeleton/);
  expect(await page.locator(host).evaluate((node, previous) => node === previous, originalHost))
    .toBe(true);
  expect(await page.locator(placeholder)
    .evaluate((node, previous) => node === previous, originalPlaceholder)).toBe(true);
  await expect(page.locator(`${placeholder} [data-ant-skeleton-part="title"]`))
    .toHaveCSS('height', '16px');
  await expect(page.getByLabel('Skeleton main native ref', { exact: true })).toHaveText('true');
  await expect(page.getByLabel('Skeleton main object ref', { exact: true })).toHaveText('same');
});

test('Skeleton main updates refs when loading changes and clears them on unmount', async ({ page }) => {
  await expect(page.getByLabel('Skeleton main native ref', { exact: true })).toHaveText('true');
  await expect(page.getByLabel('Skeleton main object ref', { exact: true })).toHaveText('same');
  await page.getByRole('button', { name: 'Ready main Skeleton', exact: true }).click();

  await expect(page.locator(placeholder)).toHaveCount(0);
  await expect(page.getByLabel('Skeleton main native ref', { exact: true })).toHaveText('false');
  await expect(page.getByLabel('Skeleton main object ref', { exact: true })).toHaveText('null');
  await page.getByRole('button', { name: 'Load main Skeleton', exact: true }).click();

  await expect(page.getByLabel('Skeleton main native ref', { exact: true })).toHaveText('true');
  await expect(page.getByLabel('Skeleton main object ref', { exact: true })).toHaveText('same');
  await page.getByRole('button', { name: 'Toggle main Skeleton mount', exact: true }).click();

  await expect(page.locator(host)).toHaveCount(0);
  await expect(page.getByLabel('Skeleton main native ref', { exact: true })).toHaveText('false');
  await expect(page.getByLabel('Skeleton main object ref', { exact: true })).toHaveText('none');
});

test('Skeleton main keeps native focus parking with component config and custom prefixes', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Skeleton main case', exact: true })
    .selectOption('local-avatar');
  const originalHost = await page.locator(host).elementHandle();
  const child = page.getByRole('textbox', { name: 'Skeleton main child', exact: true });
  await page.getByRole('button', { name: 'Ready main Skeleton', exact: true }).click();
  await child.fill('Discard this draft');
  await child.focus();
  await page.getByRole('button', { name: 'Load main Skeleton', exact: true }).dispatchEvent('click');

  await expect(page.locator(host)).toBeFocused();
  await expect(child).toHaveCount(0);
  await expect(page.locator(host).getByRole('status')).toHaveText('Загрузка…');
  await page.getByRole('button', { name: 'Change main Skeleton prefix', exact: true })
    .dispatchEvent('click');
  await page.getByRole('button', { name: 'Ready main Skeleton', exact: true }).dispatchEvent('click');

  await expect(page.locator(host)).toBeFocused();
  expect(await page.locator(host).evaluate((node, previous) => node === previous, originalHost))
    .toBe(true);
  await page.keyboard.press('Tab');

  await expect(child).toBeFocused();
  await expect(child).toHaveValue('Fresh child');
});

test('Skeleton main config does not style adjacent standalone placeholders', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Skeleton main case', exact: true })
    .selectOption('local-avatar');
  const neighbor = page.locator('[data-skeleton-primitive-neighbor] > div');

  await expect(neighbor).not.toHaveClass(/provider-|local-/);
  await expect(neighbor).toHaveCSS('padding-top', '0px');
  await expect(neighbor).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(page.locator(placeholder)).toHaveCSS('padding-top', '7px');
});

test('Skeleton main applies live config, callback props, theme, RTL and locale without replacing nodes', async ({ page }) => {
  const original = await page.locator(placeholder).elementHandle();
  const root = page.locator(placeholder);
  const title = root.locator('[data-ant-skeleton-part="title"]');
  await page.getByRole('button', { name: 'Toggle main Skeleton config', exact: true }).click();

  await expect(root).toHaveCSS('padding-top', '7px');
  await expect(root).toHaveClass(/context-avatar-false context-title-true/);
  await expect(root).toHaveClass(/context-active-undefined/);
  await expect(title).toHaveCSS('height', '11px');
  await page.getByRole('button', { name: 'Activate main Skeleton', exact: true }).click();

  await expect(root).toHaveClass(/context-active-true/);
  await expect(root).toHaveClass(/active-true loading-undefined/);
  await page.getByRole('button', { name: 'Theme main Skeleton', exact: true }).click();

  await expect(root).toHaveCSS('--ant-skeleton-title-height', '20px');
  await expect(title).toHaveCSS('height', '11px');
  await page.getByRole('button', { name: 'RTL main Skeleton', exact: true }).click();
  await page.getByRole('checkbox', { name: 'English locale', exact: true }).check();

  await expect(root).toHaveClass(/ant-skeleton-rtl/);
  await expect(page.locator(host)).toHaveAttribute('dir', 'rtl');
  await expect(page.locator(host).getByRole('status')).toHaveText('Loading…');
  await page.getByRole('button', { name: 'Toggle main Skeleton config', exact: true }).click();

  await expect(root).not.toHaveClass(/provider-|local-root/);
  await expect(root).toHaveCSS('padding-top', '0px');
  await expect(title).toHaveCSS('height', '20px');
  expect(await root.evaluate((node, previous) => node === previous, original)).toBe(true);
});

test('Skeleton main cleans up prefix styles on readiness and unmount', async ({ page }) => {
  const style = page.locator('style[data-ant-svelte-theme="skeleton-main-prefix:live-skeleton"]');
  await page.getByRole('button', { name: 'Change main Skeleton prefix', exact: true }).click();

  await expect(style).toHaveCount(1);
  await page.getByRole('button', { name: 'Ready main Skeleton', exact: true }).click();

  await expect(style).toHaveCount(0);
  await page.getByRole('button', { name: 'Load main Skeleton', exact: true }).click();

  await expect(style).toHaveCount(1);
  await page.getByRole('button', { name: 'Toggle main Skeleton mount', exact: true }).click();

  await expect(style).toHaveCount(0);
});

test('Skeleton main respects reduced motion with a custom prefix', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Skeleton main case', exact: true })
    .selectOption('prefix-custom-skeleton');
  const title = page.locator(`${placeholder} [data-ant-skeleton-part="title"]`);

  await expect(title).not.toHaveCSS('animation-name', 'none');
  await page.emulateMedia({ reducedMotion: 'reduce' });

  await expect(title).toHaveCSS('animation-name', 'none');
});
