import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-avatar-api-reference.json' with { type: 'json' };
import { snapshotAvatarApi } from './avatar-api-metrics';
import type { AvatarApiCase } from './fixtures/avatar-api-presets';

async function select(page: Page, name: string) {
  await page.goto('/?fixture=avatar-api');
  await page.getByRole('combobox', { name: 'Avatar API reference', exact: true })
    .selectOption(name);
  await expect(page.locator('#avatar-api-surface .ant-avatar').first()).toBeVisible();
}

for (const sample of reference.cases as AvatarApiCase[]) {
  test(`Avatar config and DOM match source for ${sample.name}`, async ({ page }) => {
    await select(page, sample.name);
    const host = page.locator('#avatar-api-surface');
    const snapshot = () => host.evaluate(snapshotAvatarApi, sample.group ?? false);
    const root = host.locator(sample.group ? '.ant-avatar-group' : '.ant-avatar').first();
    const original = await root.elementHandle();

    await expect.poll(snapshot).toEqual(sample.snapshot);
    await expect(page.getByRole('status', { name: 'Avatar API ref' })).toHaveText(sample.refType);
    if (sample.patch) {
      await page.getByRole('button', { name: 'Change Avatar API props' }).dispatchEvent('click');

      await expect.poll(snapshot).toEqual(sample.changed);
      expect(await root.evaluate((node, old) => node === old, original)).toBe(true);

      await page.getByRole('button', { name: 'Change Avatar API props' }).dispatchEvent('click');

      await expect.poll(snapshot).toEqual(sample.restored);
    }
    const target = sample.group ? host.locator('[data-member="alpha"]') : root;
    await target.evaluate((node: HTMLElement) => node.click());

    await expect(page.getByRole('status', { name: 'Avatar API events' }))
      .toHaveText(JSON.stringify(sample.clickEvents));
  });
}

test('Avatar native click alias has priority and does not add keyboard activation', async ({ page }) => {
  await select(page, 'focusable');
  const root = page.locator('[data-marker="api"]');
  await page.getByLabel('Native Avatar click alias', { exact: true }).check();
  await root.click();

  await expect(page.getByRole('status', { name: 'Avatar API events' }))
    .toHaveText('["onclick:SPAN:api"]');

  await root.focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Space');

  await expect(page.getByRole('status', { name: 'Avatar API events' }))
    .toHaveText('["onclick:SPAN:api","key:Enter","key: "]');
});

test('Avatar preserves owner role, direction and focus while DOM props update', async ({ page }) => {
  await select(page, 'role-and-dir');
  const root = page.locator('[data-marker="api"]');

  await expect(root).toHaveAttribute('role', 'group');
  await expect(root).toHaveAttribute('dir', 'ltr');
  await expect(root).toHaveAttribute('lang', 'en');
  await expect(root).toHaveAttribute('title', 'Owner <Avatar>');

  await select(page, 'reactive-root-attrs');
  await root.focus();
  const previous = await root.elementHandle();
  await page.getByRole('button', { name: 'Change Avatar API props' }).dispatchEvent('click');

  await expect(root).toBeFocused();
  await expect(root).toHaveAttribute('title', 'After <Avatar>');
  await expect(root).toHaveAttribute('dir', 'rtl');
  expect(await root.evaluate((node, old) => node === old, previous)).toBe(true);
});

for (const name of ['focusable', 'group-classes']) {
  test(`Avatar clears its native ref after child unmount for ${name}`, async ({ page }) => {
    await select(page, name);
    await page.getByRole('button', { name: 'Toggle bound Avatar' }).click();

    await expect(page.getByRole('status', { name: 'Avatar API ref' })).toHaveText('empty');
    await expect(page.locator('#avatar-api-surface .ant-avatar')).toHaveCount(0);

    await page.getByRole('button', { name: 'Toggle bound Avatar' }).click();

    await expect(page.getByRole('status', { name: 'Avatar API ref' }))
      .toHaveText(name === 'focusable' ? 'SPAN' : 'DIV');
  });
}

test('Avatar preserves caller Snippet DOM, input state and focus across config updates', async ({ page }) => {
  await select(page, 'reactive-snippet');
  const input = page.getByRole('textbox', { name: 'Caller Avatar draft', exact: true });
  await input.fill('Owner draft');
  const previous = await input.elementHandle();
  await page.getByRole('button', { name: 'Change Avatar API props' }).dispatchEvent('click');

  await expect(input).toHaveValue('Owner draft');
  await expect(input).toBeFocused();
  expect(await input.evaluate((node, old) => node === old, previous)).toBe(true);
});

test('Avatar config updates preserve failed image state and the root ref', async ({ page }) => {
  await select(page, 'reactive-image');
  const root = page.locator('[data-marker="api"]');
  const previous = await root.elementHandle();
  await root.locator('img').dispatchEvent('error');
  await expect(root.locator('img')).toHaveCount(0);

  await page.getByRole('button', { name: 'Change Avatar API props' }).dispatchEvent('click');

  await expect(root.locator('img')).toHaveCount(0);
  await expect(root).toHaveText('ABC');
  await expect(root).toHaveCSS('width', '64px');
  await expect(page.getByRole('status', { name: 'Avatar API events' })).toHaveText('["error"]');
  expect(await root.evaluate((node, old) => node === old, previous)).toBe(true);
});

test('Avatar forwards already prevented native clicks without changing caller cancellation', async ({ page }) => {
  await select(page, 'default');
  await page.locator('[data-marker="api"]').evaluate((node: HTMLElement) => {
    node.addEventListener('click', event => event.preventDefault(), { capture: true, once: true });
    node.click();
  });

  await expect(page.getByRole('status', { name: 'Avatar API events' }))
    .toHaveText('["click:SPAN:api"]');
});

test('AvatarGroup keeps item metadata out of visible and overflow DOM', async ({ page }) => {
  await select(page, 'group-classes');
  const root = page.locator('.ant-avatar-group');
  await expect(root).not.toHaveClass(/case-context/);
  await page.locator('.ant-avatar-group-more').click();
  await expect(page.locator('.ant-avatar-group-list')).toBeVisible();
  const avatars = page.locator('.ant-avatar-group .ant-avatar, .ant-avatar-group-list .ant-avatar');

  expect(await avatars.evaluateAll(nodes => nodes.map(node => ({
    key: node.getAttribute('key'),
    label: node.getAttribute('label'),
    text: node.getAttribute('text'),
    context: node.classList.contains('case-context')
  })))).toEqual(Array.from({ length: 4 }, () => ({
    key: null, label: null, text: null, context: true
  })));
});

test('Avatar config updates reach an already open overflow without replacing its avatars', async ({ page }) => {
  await select(page, 'reactive-group');
  await page.locator('.ant-avatar-group-more').click();
  const hidden = page.locator('.ant-avatar-group-list .ant-avatar');
  await expect(hidden).toBeVisible();
  const previous = await hidden.elementHandle();
  await page.getByRole('button', { name: 'Change Avatar API props' }).dispatchEvent('click');

  await expect(hidden).toHaveCSS('width', '40px');
  await expect(hidden).toHaveClass(/case-new/);
  expect(await hidden.evaluate((node, old) => node === old, previous)).toBe(true);
});
