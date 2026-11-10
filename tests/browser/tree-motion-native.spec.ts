import type { Page } from '@playwright/test';
import { test, expect } from './test';

async function mount(page: Page, id = 'default', clock = true) {
  if (clock) {
    await page.clock.install({ time: new Date('2026-11-10T12:00:00Z') });
    await page.clock.pauseAt(new Date('2026-11-10T12:00:01Z'));
  }
  await page.goto('/?fixture=tree-motion');
  await page.getByLabel('Tree motion case').selectOption(id);
  if (clock) await page.clock.runFor(32);
}
const row = (page: Page, key = 'a') => page.locator(`[data-tree-motion-key="${key}"]`)
  .locator('xpath=ancestor::*[@role="treeitem"][1]');
const group = (page: Page) => page.locator('[class*="-treenode-motion"]');
const toggle = (page: Page, key = 'a') => row(page, key).locator('[data-ant-tree-switcher]').dispatchEvent('click');
const control = (page: Page, name: string) => page.getByRole('button', { name, exact: true }).dispatchEvent('click');
const events = async (page: Page) => JSON.parse(await page.locator('[data-tree-motion-events]').innerText());
async function active(page: Page) {
  await page.clock.runFor(80);
  await page.evaluate(() => document.getAnimations().forEach(animation => animation.pause()));
}
async function end(page: Page, property = 'height', child = false) {
  await group(page).evaluate((node, { property, child }) => (child ? node.firstElementChild! : node)
    .dispatchEvent(new TransitionEvent('transitionend', { bubbles: true, propertyName: property })),
  { property, child });
  await page.clock.runFor(1);
}

test('Tree completes real collapse CSS transitions and keeps keyboard focus on its root', async ({ page }) => {
  await mount(page, 'default', false);
  await control(page, 'Focus tree');
  const root = page.getByRole('tree');
  await row(page).locator('[data-ant-tree-switcher]').click();

  await expect(group(page)).toHaveCount(1);
  await expect(group(page)).toHaveCount(0);
  await expect(root).toBeFocused();
  await expect(row(page, 'a1')).toBeVisible();
  await root.press('ArrowRight');
  await expect(root).toHaveAttribute('aria-activedescendant', await row(page, 'a1').getAttribute('id') as string);
  await row(page).locator('[data-ant-tree-switcher]').click();
  await expect(group(page)).toHaveCount(0);
  await expect(row(page, 'a1')).toHaveCount(0);
  await expect(root).toBeFocused();
});

test('Tree ignores another expand during motion while selection remains usable', async ({ page }) => {
  await mount(page);
  await toggle(page);
  await toggle(page);
  await row(page, 'b').locator('[data-ant-tree-content]').click();

  expect(await events(page)).toEqual([{ type: 'expand', keys: ['a'], key: 'a', expanded: true }]);
  await expect(row(page, 'b')).toHaveAttribute('aria-selected', 'true');
  await active(page);
  await end(page);
  await toggle(page);
  expect(await events(page)).toHaveLength(2);
});

test('Tree ignores child and opacity end events and completes only its own height transition', async ({ page }) => {
  await mount(page);
  await toggle(page); await active(page);
  await end(page, 'height', true);
  await expect(group(page)).toHaveCount(1);
  await end(page, 'opacity');
  await expect(group(page)).toHaveCount(1);
  await end(page);
  await expect(group(page)).toHaveCount(0);
  await expect(row(page, 'a2')).toBeAttached();
});

test('Tree falls back to its deadline when no CSS height event arrives', async ({ page }) => {
  await mount(page, 'custom-name');
  await toggle(page); await active(page);
  await page.clock.runFor(500);

  await expect(group(page)).toHaveCount(0);
  expect((await events(page)).at(-1)).toMatchObject({ type: 'appear-end', event: 'deadline' });
  await expect(row(page, 'a1')).toBeAttached();
});

for (const id of ['prepare', 'custom-name']) test(`Tree cancels retained ${id} work on unmount`, async ({ page }) => {
  await mount(page, id);
  await toggle(page); await active(page);
  const retained = await group(page).elementHandle();
  const before = await events(page);
  await control(page, 'Unmount tree');
  await expect(page.locator('[data-tree-motion-refs]')).toHaveText('false:false');
  await control(page, 'Resolve prepare');
  await retained!.evaluate(node => node.dispatchEvent(new TransitionEvent('transitionend', {
    bubbles: true, propertyName: 'height'
  })));
  await page.clock.runFor(2000);

  expect(await events(page)).toEqual(before);
  await expect(page.getByRole('tree')).toHaveCount(0);
});

test('Tree discards a pending prepare after new data replaces its transition range', async ({ page }) => {
  await mount(page, 'prepare');
  await toggle(page); await active(page);
  const before = await events(page);
  await control(page, 'Replace data');
  await expect(group(page)).toHaveCount(0);
  await control(page, 'Resolve prepare');
  await page.clock.runFor(2000);

  expect(await events(page)).toEqual(before);
  await expect(row(page, 'a1')).toBeVisible();
});

for (const name of ['Toggle motion', 'Toggle theme motion']) test(`Tree settles active motion after ${name}`, async ({ page }) => {
  await mount(page, 'custom-name');
  const root = await page.getByRole('tree').elementHandle();
  const sibling = await row(page, 'b').elementHandle();
  await toggle(page); await active(page);
  await control(page, name);
  const before = await events(page);
  await page.clock.runFor(2000);

  await expect(group(page)).toHaveCount(0);
  expect(await root!.evaluate(node => node.isConnected)).toBe(true);
  expect(await sibling!.evaluate(node => node.isConnected)).toBe(true);
  expect(await events(page)).toEqual(before);
  await expect(row(page, 'a1')).toBeVisible();
});

test('Tree awaits prepare when the theme disables CSS motion before resolution', async ({ page }) => {
  await mount(page, 'prepare');
  await toggle(page); await active(page);
  await control(page, 'Toggle theme motion');
  await expect(group(page)).toHaveCount(1);
  await control(page, 'Resolve prepare');
  await page.clock.runFor(80);

  await expect(group(page)).toHaveCount(0);
  expect((await events(page)).map((event: { type: string; }) => event.type))
    .toEqual(['expand', 'appear-prepare']);
});

test('Tree respects reduced motion before mount and when the preference changes during a transition', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await mount(page);
  await toggle(page);
  await expect(group(page)).toHaveCount(0);
  await expect(row(page, 'a1')).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await toggle(page); await active(page);
  await expect(group(page)).toHaveCount(1);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(group(page)).toHaveCount(0);
  await expect(row(page, 'a1')).toHaveCount(0);
});

test('Tree updates the root motion namespace and RTL during an active transition', async ({ page }) => {
  await mount(page);
  const root = await page.getByRole('tree').elementHandle();
  const sibling = await row(page, 'b').elementHandle();
  await toggle(page); await active(page);
  await control(page, 'Update prefix');
  await control(page, 'Toggle direction');

  await expect(group(page)).toHaveClass(/fresh-tree-treenode-motion updated-motion-collapse-appear/);
  expect(await group(page).evaluate(node => getComputedStyle(node).transitionDuration)).toBe('0.2s, 0.2s');
  await expect(page.locator('[data-ant-tree-root]')).toHaveAttribute('dir', 'rtl');
  expect(await root!.evaluate(node => node.isConnected)).toBe(true);
  expect(await sibling!.evaluate(node => node.isConnected)).toBe(true);
  await end(page);
  await expect(group(page)).toHaveCount(0);
});

test('Tree lazy resolution updates children without an empty motion group or delayed callbacks', async ({ page }) => {
  await mount(page, 'native-lazy');
  await toggle(page);
  await expect(row(page)).toHaveAttribute('aria-busy', 'true');
  await expect(group(page)).toHaveCount(0);
  await row(page).locator('[data-ant-tree-content]').dispatchEvent('click');
  await control(page, 'Resolve load');
  await expect(row(page)).not.toHaveAttribute('aria-busy', 'true');
  await expect(row(page, 'a1')).toBeVisible();
  await expect(group(page)).toHaveCount(0);
  const before = await events(page);
  await page.clock.runFor(2000);
  expect(await events(page)).toEqual(before);
});

test('Tree dragend clears the collapse group and its old motion deadline', async ({ page }) => {
  await mount(page, 'native-drag');
  await row(page).evaluate(node => node.dispatchEvent(new DragEvent('dragstart', {
    bubbles: true, cancelable: true, clientX: 120, dataTransfer: new DataTransfer()
  })));
  await active(page);
  await expect(group(page)).toHaveCount(1);
  await page.evaluate(() => window.dispatchEvent(new DragEvent('dragend', { bubbles: true })));
  const before = await events(page);
  await page.clock.runFor(2000);

  await expect(group(page)).toHaveCount(0);
  await expect(row(page, 'a1')).toHaveCount(0);
  expect(await events(page)).toEqual(before);
  expect(before.at(-1)).toMatchObject({ type: 'dragend', key: 'a' });
});

test('Tree motion keeps generic aliases, zero/bigint keys and an outside opaque draft', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-11-10T12:00:00Z') });
  await page.clock.pauseAt(new Date('2026-11-10T12:00:01Z'));
  await page.goto('/?fixture=tree-motion-generic');
  const root = await page.getByRole('tree').elementHandle();
  const sibling = await row(page, 'outside').elementHandle();
  const draft = page.getByRole('textbox', { name: 'Outside draft', exact: true });
  await draft.fill('retained draft');
  await toggle(page, '0'); await active(page);

  expect(await group(page).evaluate(node => node.style.height)).toBe('92px');
  await expect(row(page, '2')).toBeAttached();
  await page.getByRole('button', { name: 'Update generic prefix', exact: true }).dispatchEvent('click');
  await end(page);

  await expect(draft).toHaveValue('retained draft');
  await expect(draft).toBeFocused();
  expect(await root!.evaluate(node => node.isConnected)).toBe(true);
  expect(await sibling!.evaluate(node => node.isConnected)).toBe(true);
  expect(JSON.parse(await page.locator('[data-motion-generic-events]').innerText()))
    .toEqual([{ key: 0, payload: 41, raw: true }]);
});

test('Tree does not lock a visible branch when a hidden expanded key changes', async ({ page }) => {
  await mount(page, 'controlled-accept');
  await control(page, 'Expand hidden');
  await expect(group(page)).toHaveCount(0);
  await toggle(page);

  await expect(row(page)).toHaveAttribute('aria-expanded', 'true');
  expect(await events(page)).toEqual([{ type: 'expand', keys: ['a2', 'a'], key: 'a', expanded: true }]);
  await active(page);
  await expect(group(page).locator('[data-tree-motion-key]')).toHaveCount(3);
  await end(page);
});
