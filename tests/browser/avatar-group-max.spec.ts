import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-avatar-group-max-reference.json' with { type: 'json' };
import { snapshotAvatarGroupMax, snapshotAvatarGroupMaxPopup } from './avatar-group-max-metrics';
import type { AvatarGroupMaxCase } from './fixtures/avatar-group-max-presets';

async function select(page: Page, name: string) {
  await page.goto('/?fixture=avatar-group-max');
  await page.getByRole('combobox', { name: 'AvatarGroup max reference', exact: true })
    .selectOption(name);
  await expect(page.locator('#avatar-group-max-surface')).toBeVisible();
}

const button = (page: Page) => page.locator('.ant-avatar-group-more');
const popup = (page: Page) => page.locator('.ant-avatar-group-popover:popover-open');
const change = (page: Page) => page.getByRole('button', { name: 'Change AvatarGroup max props' })
  .dispatchEvent('click');

for (const sample of reference.cases as AvatarGroupMaxCase[]) {
  test(`AvatarGroup max aliases match source for ${sample.name}`, async ({ page }) => {
    await select(page, sample.name);
    const snapshot = () => page.locator('#avatar-group-max-surface')
      .evaluate(snapshotAvatarGroupMax);

    await expect.poll(snapshot).toEqual(sample.snapshot);
    if (sample.patch) {
      await change(page);

      await expect.poll(snapshot).toEqual(sample.changed);

      await change(page);

      await expect.poll(snapshot).toEqual(sample.restored);
    }

    await page.clock.install();
    if (await button(page).count()) {
      if (sample.probe === 'hover') await button(page).hover();
      else if (sample.probe === 'focus') await button(page).focus();
      else await button(page).click();
    }
    await page.clock.runFor(1000);

    await expect.poll(() => page.evaluate(snapshotAvatarGroupMaxPopup)).toEqual(sample.popup);
  });
}

test('AvatarGroup modern focus trigger suppresses the legacy hover trigger', async ({ page }) => {
  await select(page, 'modern-trigger');
  await page.clock.install();
  await button(page).hover();
  await page.clock.runFor(1000);

  await expect(popup(page)).toHaveCount(0);

  await button(page).focus();

  await expect(popup(page)).toBeVisible();
  await expect(button(page)).toBeFocused();
});

test('AvatarGroup modern trigger array suppresses the legacy focus trigger', async ({ page }) => {
  await select(page, 'modern-trigger-array');
  await page.clock.install();
  await button(page).focus();
  await page.clock.runFor(1000);

  await expect(popup(page)).toHaveCount(0);

  await button(page).hover();
  await page.clock.runFor(1000);

  await expect(popup(page)).toBeVisible();
});

test('AvatarGroup alias updates retain the open popup, focus and hidden avatars', async ({ page }) => {
  await select(page, 'reactive-aliases');
  await button(page).click();
  await expect(popup(page)).toBeFocused();
  const hidden = popup(page).locator('.ant-avatar').first();
  const original = await hidden.elementHandle();
  const originalButton = await button(page).elementHandle();

  await change(page);

  await expect(popup(page)).toBeFocused();
  await expect(popup(page)).toHaveClass(/ant-popover-placement-bottom/);
  await expect(button(page).locator('.ant-avatar')).toHaveCSS('color', 'rgb(25, 35, 45)');
  expect(await hidden.evaluate((node, old) => node === old, original)).toBe(true);
  expect(await button(page).evaluate((node, old) => node === old, originalButton)).toBe(true);

  await page.keyboard.press('Escape');

  await expect(popup(page)).toHaveCount(0);
  await expect(button(page)).toBeFocused();
});

test('AvatarGroup count alias updates remove overflow and recover nearby focus', async ({ page }) => {
  await select(page, 'reactive-limit');
  await button(page).click();
  await expect(popup(page)).toBeFocused();

  await change(page);

  await expect(button(page)).toHaveCount(0);
  await expect(popup(page)).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'After max group', exact: true })).toBeFocused();

  await change(page);

  await expect(button(page)).toHaveAttribute('aria-expanded', 'false');
});
