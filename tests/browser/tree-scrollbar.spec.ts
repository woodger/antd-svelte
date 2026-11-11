import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-tree-scrollbar-reference.json' with { type: 'json' };
import type { TreeScrollbarAction } from './fixtures/tree-scrollbar-cases';
import { readTreeScrollbar } from './tree-scrollbar-metrics';
const field = (page: Page) => page.getByRole('combobox', { name: 'Scrollbar field', exact: true });
async function mount(page: Page, id: string) {
  await page.clock.install({ time: new Date('2026-11-11T00:00:00Z') });
  await page.goto('/?fixture=tree-scrollbar');
  await page.getByRole('combobox', { name: 'Tree scrollbar sample', exact: true }).selectOption(id);
  await expect(page.locator('[data-tree-scrollbar-ref]')).toHaveAttribute('data-tree-scrollbar-ref', 'true');
  await page.clock.runFor(100);
  await page.waitForTimeout(40);
  await page.clock.runFor(100);
  await page.mouse.move(0, 0);
}
async function apply(page: Page, action: TreeScrollbarAction) {
  const holder = page.locator('.ant-tree-list-holder');
  if (action.startsWith('idle')) {
    await page.mouse.move(0, 0);
    await page.clock.runFor(3200);
  }
  else if (action === 'hover') await holder.hover();
  else if (action === 'wheel') await holder.dispatchEvent('wheel', { deltaY: 120 });
  else if (action === 'keyboard') await field(page).press('ArrowDown');
  else if (action === 'drag') {
    const thumb = page.locator('.ant-tree-list-scrollbar-thumb');
    const rect = await thumb.boundingBox();
    if (!rect) throw Error('Scrollbar thumb missing');
    await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2);
    await page.mouse.down();
    await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2 + 24);
    await page.clock.runFor(32);
    await page.mouse.up();
  } else {
    await page.getByRole('combobox', { name: 'Tree scrollbar action', exact: true }).selectOption(action);
    await page.getByRole('button', { name: 'Apply tree scrollbar action', exact: true }).dispatchEvent('click');
  }
}
for (const entry of reference.cases.filter(entry => entry.id.startsWith('tree-select'))) {
  test(`TreeSelect scrollbar matches the Source inherited no-op for ${entry.id}`, async ({ page }) => {
    await mount(page, entry.id);
    const read = () => page.evaluate(readTreeScrollbar, false);
    await expect.poll(read).toEqual(entry.initial);
    let previous = await field(page).elementHandle();
    for (const step of entry.steps) {
      await apply(page, step.action as TreeScrollbarAction);
      await page.clock.runFor(100);
      await page.waitForTimeout(40);
      await page.clock.runFor(100);
      await expect.poll(read, { message: step.action }).toEqual(step.view);
      expect(await field(page).evaluate((node, original) => node === original, previous), step.action).toBe(step.sameInput);
      previous = await field(page).elementHandle();
    }
  });
}
test('TreeSelect scrollbar releases its popup, ref and hide timer on unmount', async ({ page }) => {
  await mount(page, 'tree-select-false');
  await page.locator('.ant-tree-list-holder').hover();
  await page.clock.runFor(100);
  await expect(page.locator('.ant-tree-list-scrollbar')).toBeVisible();
  await page.getByRole('button', { name: 'Unmount tree scrollbar', exact: true }).click();
  await expect(page.locator('[data-tree-scrollbar-ref]')).toHaveAttribute('data-tree-scrollbar-ref', 'false');
  await page.clock.runFor(3400);
  await expect(page.locator('.ant-tree-list-scrollbar')).toHaveCount(0);
  await expect(field(page)).toHaveCount(0);
  await expect(page.locator('[popover]')).toHaveCount(0);
});
