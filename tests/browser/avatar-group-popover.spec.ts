import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-avatar-group-popover-reference.json' with { type: 'json' };
import { snapshotAvatarGroupPopover } from './avatar-group-popover-metrics';
import type { AvatarGroupPopoverCase } from './fixtures/avatar-group-popover-presets';

async function select(page: Page, name: string) {
  await page.goto('/?fixture=avatar-group-popover');
  await page.getByRole('combobox', { name: 'Group Popover reference', exact: true })
    .selectOption(name);
  await expect(page.locator('#avatar-group-popover-surface')).toBeVisible();
}

const trigger = (page: Page) => page.locator('.ant-avatar-group-more');
const popup = (page: Page) => page.locator('.ant-avatar-group-popover:popover-open');
const draft = (page: Page) => page.getByRole('textbox', { name: 'Owner popup draft', exact: true });
const change = (page: Page) => page.getByRole('button', { name: 'Change group popup props' })
  .dispatchEvent('click');

for (const sample of reference.cases as AvatarGroupPopoverCase[]) {
  test(`AvatarGroup Popover settings match source for ${sample.name}`, async ({ page }) => {
    await select(page, sample.name);
    await page.clock.install();
    const snapshot = () => page.evaluate(snapshotAvatarGroupPopover);
    await page.clock.runFor(1000);

    await expect.poll(snapshot).toEqual(sample.initial);
    if (sample.patch) {
      await change(page);
      await page.clock.runFor(1000);

      await expect.poll(snapshot).toEqual(sample.changed);

      await change(page);
      await page.clock.runFor(1000);

      await expect.poll(snapshot).toEqual(sample.restored);
    }
    await trigger(page).click();
    await page.clock.runFor(1000);

    await expect.poll(snapshot).toEqual(sample.opened);

    const input = draft(page);
    const original = await input.count() && await input.isVisible()
      ? await input.elementHandle() : null;
    if (original) await input.fill('Owner draft');

    await trigger(page).click();
    await page.clock.runFor(1000);

    await expect.poll(snapshot).toEqual(sample.closed);

    await trigger(page).click();
    await page.clock.runFor(1000);

    await expect.poll(snapshot).toEqual(sample.reopened);
    if (sample.retained !== null) {
      expect(await input.evaluate((node, old) => node === old, original)).toBe(sample.retained);
    }
  });
}

test('AvatarGroup custom content replaces hidden members and accepts native popup ARIA', async ({ page }) => {
  await select(page, 'editor');
  await trigger(page).click();

  await expect(popup(page)).toHaveAccessibleName('Owner popup heading');
  await expect(draft(page)).toBeFocused();
  await expect(popup(page).locator('.ant-avatar-group-list')).toHaveCount(0);
  await expect(popup(page).getByRole('button', { name: 'Owner action' })).toBeVisible();

  await page.keyboard.press('Escape');

  await expect(trigger(page)).toBeFocused();
  await expect(draft(page)).toHaveCount(0);
});

test('AvatarGroup forwards native popup ARIA and wrapper class/style without replacing content', async ({ page }) => {
  await select(page, 'editor');
  await trigger(page).click();
  await draft(page).fill('Accessible draft');
  const original = await draft(page).elementHandle();

  await page.getByLabel('Native group popup options', { exact: true }).dispatchEvent('click');

  await expect(popup(page)).toHaveAccessibleName('Owner accessible popup');
  await expect(popup(page)).toHaveAccessibleDescription('Owner popup help');
  await expect(popup(page)).toHaveAttribute('aria-busy', 'true');
  await expect(popup(page)).toHaveClass(/ant-avatar-group-popover/);
  await expect(popup(page)).toHaveClass(/case-extra/);
  await expect(page.locator('.ant-popover-trigger')).toHaveClass(/case-wrapper/);
  await expect(page.locator('.ant-popover-trigger')).toHaveCSS('color', 'rgb(1, 2, 3)');
  await expect(draft(page)).toHaveValue('Accessible draft');
  await expect(draft(page)).toBeFocused();
  expect(await draft(page).evaluate((node, old) => node === old, original)).toBe(true);
});

test('AvatarGroup rejected controlled closes preserve owner input, focus and popup', async ({ page }) => {
  await select(page, 'controlled-reject-close');
  await draft(page).fill('Rejected close');
  const original = await draft(page).elementHandle();

  await page.keyboard.press('Escape');

  await expect(popup(page)).toBeVisible();
  await expect(draft(page)).toBeFocused();
  await expect(draft(page)).toHaveValue('Rejected close');
  await expect(page.getByRole('status', { name: 'Group popup events' })).toHaveText('[false]');
  expect(await draft(page).evaluate((node, old) => node === old, original)).toBe(true);
});

test('AvatarGroup external open changes leave callbacks silent and return focus on close', async ({ page }) => {
  await select(page, 'reactive-open');
  await change(page);

  await expect(popup(page)).toBeVisible();
  await expect(page.getByRole('status', { name: 'Group popup events' })).toHaveText('[]');

  await draft(page).focus();
  await change(page);

  await expect(popup(page)).toHaveCount(0);
  await expect(trigger(page)).toBeFocused();
  await expect(page.getByRole('status', { name: 'Group popup events' })).toHaveText('[]');
});

for (const name of [
  'local-container', 'legacy-container', 'provider-container', 'local-container-priority'
]) {
  test(`AvatarGroup container lifecycle preserves caller state for ${name}`, async ({ page }) => {
    await select(page, name);
    await expect(page.getByRole('status', { name: 'Group popup containers' })).toHaveText('[]');
    await trigger(page).click();
    await draft(page).fill('Portal draft');
    const original = await draft(page).elementHandle();
    const container = await popup(page).evaluateHandle(node => node.parentElement);

    await page.getByRole('button', { name: 'Refresh group popup getter' }).dispatchEvent('click');

    await expect(draft(page)).toHaveValue('Portal draft');
    await expect(draft(page)).toBeFocused();
    expect(await draft(page).evaluate((node, old) => node === old, original)).toBe(true);
    expect(await popup(page).evaluate((node, old) => node.parentElement === old, container)).toBe(true);

    await page.getByLabel('Alternate group popup container', { exact: true }).dispatchEvent('click');

    await expect(page.locator('#group-popup-alternate .ant-avatar-group-popover')).toBeVisible();
    await expect(draft(page)).toHaveValue('Portal draft');
    await expect(draft(page)).toBeFocused();
    expect(await draft(page).evaluate((node, old) => node === old, original)).toBe(true);
    await expect(page.getByRole('status', { name: 'Group popup containers' })).toContainText('BUTTON');

    await page.getByLabel('Mount group popup', { exact: true }).dispatchEvent('click');

    await expect(page.locator('.ant-avatar-group-popover')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'After group popup', exact: true })).toBeFocused();
  });
}

test('AvatarGroup portal unmount preserves an explicit outside focus choice', async ({ page }) => {
  await select(page, 'local-container');
  await trigger(page).click();
  await draft(page).focus();
  const outside = page.getByRole('button', { name: 'Before group popup', exact: true });

  await outside.focus();
  await page.getByLabel('Mount group popup', { exact: true }).dispatchEvent('click');

  await expect(page.locator('.ant-avatar-group-popover')).toHaveCount(0);
  await expect(outside).toBeFocused();
});

test('Popover preserves its eager content and retained state by default', async ({ page }) => {
  await select(page, 'editor');
  await page.getByLabel('Standalone group popup', { exact: true }).check();
  const input = page.locator('input[aria-label="Owner popup draft"]');
  // У standalone Popover default сохраняет содержимое; у Group default удаляет.
  await expect(input).toHaveCount(1);
  await trigger(page).click();
  await draft(page).fill('Retained standalone draft');
  await page.keyboard.press('Escape');

  await expect(input).toHaveValue('Retained standalone draft');
});

for (const name of ['destroy-editor', 'legacy-destroy-true']) {
  test(`Popover destroys its own snippets after close for ${name}`, async ({ page }) => {
    await select(page, name);
    await page.getByLabel('Standalone group popup', { exact: true }).check();
    await expect(draft(page)).toHaveCount(0);
    await trigger(page).click();
    await draft(page).fill('Disposable standalone draft');
    const original = await draft(page).elementHandle();

    await page.keyboard.press('Escape');

    await expect(draft(page)).toHaveCount(0);
    await expect(trigger(page)).toBeFocused();

    await trigger(page).click();

    await expect(draft(page)).toHaveValue('Draft');
    expect(await draft(page).evaluate((node, old) => node === old, original)).toBe(false);
  });
}
