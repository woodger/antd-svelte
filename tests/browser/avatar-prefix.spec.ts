import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-avatar-prefix-reference.json' with { type: 'json' };
import { snapshotAvatarPrefix } from './avatar-prefix-metrics';
import type { AvatarApiCase } from './fixtures/avatar-api-presets';

async function select(page: Page, name: string) {
  await page.goto('/?fixture=avatar-prefix');
  await page.getByRole('combobox', { name: 'Avatar prefix reference', exact: true })
    .selectOption(name);
  await expect(page.locator('#avatar-api-surface')).toBeVisible();
}

for (const sample of reference.cases as AvatarApiCase[]) {
  test(`Avatar prefixes match source for ${sample.name}`, async ({ page }) => {
    await select(page, sample.name);
    const host = page.locator('#avatar-api-surface');
    const snapshot = (changed = false) => host.evaluate(snapshotAvatarPrefix, {
      ...sample, ...(changed ? sample.patch : {})
    });
    const root = await host.locator(':scope > span, :scope > div').first().elementHandle();

    await expect.poll(() => snapshot()).toEqual(sample.snapshot);
    if (sample.patch) {
      await page.getByRole('button', { name: 'Change Avatar prefix props' }).dispatchEvent('click');

      await expect.poll(() => snapshot(true)).toEqual(sample.changed);
      expect(await host.evaluate((node, old) => node.firstElementChild === old, root)).toBe(true);

      await page.getByRole('button', { name: 'Change Avatar prefix props' }).dispatchEvent('click');

      await expect.poll(() => snapshot()).toEqual(sample.restored);
    }
  });
}

for (const name of ['reactive-text', 'reactive-snippet']) {
  test(`Avatar prefix updates preserve focus and caller state for ${name}`, async ({ page }) => {
    await select(page, name);
    const root = page.locator('#avatar-api-surface > span');
    const target = name === 'reactive-snippet'
      ? root.getByRole('textbox', { name: 'Caller Avatar draft' }) : root;
    if (name === 'reactive-snippet') await target.fill('Owner draft');
    else await target.focus();
    const original = await target.elementHandle();
    await page.getByRole('button', { name: 'Change Avatar prefix props' }).dispatchEvent('click');

    await expect(target).toBeFocused();
    expect(await target.evaluate((node, old) => node === old, original)).toBe(true);
    if (name === 'reactive-snippet') await expect(target).toHaveValue('Owner draft');
  });
}

test('Avatar prefix updates preserve image DOM and failed image state', async ({ page }) => {
  await select(page, 'reactive-image');
  const root = page.locator('#avatar-api-surface > span');
  const image = root.locator('img');
  const previous = await image.elementHandle();
  await page.getByRole('button', { name: 'Change Avatar prefix props' }).dispatchEvent('click');

  expect(await image.evaluate((node, old) => node === old, previous)).toBe(true);

  await image.dispatchEvent('error');
  await page.getByRole('button', { name: 'Change Avatar prefix props' }).dispatchEvent('click');

  await expect(image).toHaveCount(0);
  await expect(root).toHaveText('ABC');
  await expect(page.getByRole('status', { name: 'Avatar API events' })).toHaveText('["error"]');
});

test('Avatar custom CSS does not reset neighboring default component tokens', async ({ page }) => {
  await select(page, 'reactive-text');
  const neighbor = page.locator('[data-avatar-prefix-neighbor]');

  await expect(neighbor).toHaveCSS('font-size', '23px');
  await expect(neighbor).toHaveCSS('width', '44px');

  await page.getByRole('button', { name: 'Change Avatar prefix props' }).dispatchEvent('click');

  await expect(neighbor).toHaveCSS('font-size', '23px');
  await expect(neighbor).toHaveCSS('width', '44px');
  await expect(page.locator('head [data-ant-svelte-theme="avatar-prefix:next-avatar"]'))
    .toHaveCount(1);

  await page.getByRole('button', { name: 'Toggle prefix Avatar' }).click();

  await expect(page.locator('head [data-ant-svelte-theme="avatar-prefix:next-avatar"]'))
    .toHaveCount(0);
  await expect(page.locator('head [data-ant-svelte-theme="avatar-prefix:sibling-avatar"]'))
    .toHaveCount(1);
  await expect(neighbor).toHaveCSS('font-size', '23px');
});

test('AvatarGroup prefix updates retain open popup content', async ({ page }) => {
  await select(page, 'reactive-group');
  await page.locator('.ant-avatar-group-more').click();
  const popup = page.locator('.ant-popover');
  const hidden = popup.locator('.ant-avatar-group-list .ant-avatar');
  await expect(hidden).toBeVisible();
  const previous = await hidden.elementHandle();

  await page.getByRole('button', { name: 'Change Avatar prefix props' }).dispatchEvent('click');

  await expect(popup).toHaveClass(/next-avatar-group-popover/);
  await expect(hidden).toBeVisible();
  expect(await hidden.evaluate((node, old) => node === old, previous)).toBe(true);
  await expect(page.locator('[data-member="alpha"]')).toHaveClass(/ant-avatar-circle/);
  await expect(page.locator('[data-member="alpha"]')).not.toHaveClass(/next-avatar-circle/);
});

test('Avatar text fitting remains attached while its prefix changes', async ({ page }) => {
  await select(page, 'reactive-text');
  const text = page.locator('[data-ant-avatar-string]').first();
  await expect(text).not.toHaveCSS('transform', 'none');
  const before = await text.evaluate(node => getComputedStyle(node).transform);
  const previous = await text.elementHandle();

  await page.getByRole('button', { name: 'Change Avatar prefix props' }).dispatchEvent('click');

  await expect(text).toHaveClass(/next-avatar-string/);
  await expect(text).toHaveCSS('transform', before);
  expect(await text.evaluate((node, old) => node === old, previous)).toBe(true);
});
