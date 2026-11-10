import type { Page } from '@playwright/test';
import { test, expect } from './test';

const host = (page: Page) => page.locator('[data-tree-virtual-host]');
const holder = (page: Page) => host(page).locator('.ant-tree-list-holder');
const inner = (page: Page) => host(page).locator('.ant-tree-list-holder-inner');
const button = (page: Page, name: string) => page.getByRole('button', { name, exact: true });

async function sample(page: Page, name: string) {
  await page.goto('/?fixture=tree-virtual');
  await page.getByRole('combobox', { name: 'Tree virtual sample', exact: true })
    .selectOption({ label: name });
  await expect(page.locator('[data-tree-virtual-ref]')).toHaveText('DIV');
}

async function activeTitle(page: Page) {
  return page.getByRole('tree', { name: 'Virtual tree', exact: true }).evaluate(tree => {
    const id = tree.getAttribute('aria-activedescendant');
    return id ? document.getElementById(id)?.querySelector('.ant-tree-title')?.textContent : null;
  });
}

test('Tree inherits global virtual=false when the local prop is undefined', async ({ page }) => {
  await sample(page, 'global-undefined-observation');

  await expect(page.getByRole('treeitem')).toHaveCount(64);
  await expect(holder(page)).toHaveCSS('overflow-y', 'auto');
  await expect(host(page).locator('.ant-tree-list-scrollbar')).toHaveCount(0);
});

test('Tree keeps zero horizontal offset when scrollWidth is smaller than the viewport', async ({ page }) => {
  await sample(page, 'undersized-width-observation');

  await expect(inner(page)).toHaveCSS('margin-left', '0px');
  await expect(host(page).locator('.ant-tree-list-scrollbar-horizontal')).toHaveCount(0);
  await holder(page).dispatchEvent('wheel', { deltaX: 100, deltaY: 0 });
  await expect(inner(page)).toHaveCSS('margin-left', '0px');
});

test('Tree refreshes the estimate without cloning data or losing DOM, selection and draft', async ({ page }) => {
  await sample(page, 'stale-height-observation');
  const tree = page.getByRole('tree', { name: 'Virtual tree', exact: true });
  const before = await tree.elementHandle();
  const row = page.getByRole('treeitem', { name: 'Item 0', exact: true });
  await row.getByRole('button', { name: 'Item 0', exact: true }).click();
  const selectedId = await row.getAttribute('id');
  const editor = page.getByRole('textbox', { name: 'Virtual tree editor', exact: true });
  await editor.fill('Unsaved draft');
  await editor.evaluate(node => {
    if (!(node instanceof HTMLInputElement)) throw Error('Expected input');
    node.setSelectionRange(2, 7);
  });
  await expect(holder(page).locator(':scope > div')).toHaveCSS('height', '1942px');

  await button(page, 'Update virtual tree').evaluate(node => {
    if (!(node instanceof HTMLButtonElement)) throw Error('Expected button');
    node.click();
  });

  await expect(holder(page).locator(':scope > div')).toHaveCSS('height', '2406px');
  await expect(row).toHaveAttribute('aria-selected', 'true');
  await expect(row).toHaveAttribute('id', selectedId!);
  expect(await before!.evaluate(node => node === document.querySelector('[role="tree"]'))).toBe(true);
  await expect(editor).toBeFocused();
  await expect(editor).toHaveValue('Unsaved draft');
  expect(await editor.evaluate(node => {
    if (!(node instanceof HTMLInputElement)) throw Error('Expected input');
    return [node.selectionStart, node.selectionEnd];
  })).toEqual([2, 7]);
});

test('Tree clears a virtualized-away active descendant and restores it on keyboard navigation', async ({ page }) => {
  await sample(page, 'active-missing-observation');
  const tree = page.getByRole('tree', { name: 'Virtual tree', exact: true });
  await tree.press('End');
  await expect.poll(() => activeTitle(page)).toBe('Item 63');

  await page.getByRole('combobox', { name: 'Tree virtual action', exact: true }).selectOption('1');
  await button(page, 'Scroll virtual tree').click();

  await expect(tree).not.toHaveAttribute('aria-activedescendant');
  await tree.press('ArrowUp');
  await expect.poll(() => activeTitle(page)).toBe('Item 62');
  await expect(tree).toBeFocused();
});

test('Tree keeps key zero as the active node when focusing a virtual viewport', async ({ page }) => {
  await sample(page, 'zero-focus-observation');
  await page.getByRole('tree', { name: 'Virtual tree', exact: true }).focus();

  await expect.poll(() => activeTitle(page)).toBe('Item 0');
});

for (const rtl of [false, true]) {
  test(`Tree scrolls horizontal wheel and Shift+wheel in ${rtl ? 'RTL' : 'LTR'}`, async ({ page }) => {
    await sample(page, rtl ? 'horizontal-rtl-observation' : 'horizontal');
    const margin = rtl ? 'margin-right' : 'margin-left';
    const thumb = host(page).locator('.ant-tree-list-scrollbar-horizontal .ant-tree-list-scrollbar-thumb');
    await expect(thumb).toHaveCSS(rtl ? 'right' : 'left', '0px');
    await expect(host(page).locator('.ant-tree-list-scrollbar-vertical'))
      .toHaveCSS(rtl ? 'left' : 'right', '0px');

    await holder(page).dispatchEvent('wheel', { deltaX: rtl ? -120 : 120, deltaY: 0 });

    await expect(inner(page)).toHaveCSS(margin, '-120px');
    await page.evaluate(() => new Promise<void>(resolve => {
      requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    }));
    await holder(page).dispatchEvent('wheel', { deltaX: 0, deltaY: rtl ? -60 : 60, shiftKey: true });

    await expect(inner(page)).toHaveCSS(margin, '-180px');
    await expect(thumb).toHaveCSS(rtl ? 'right' : 'left', '72px');
  });

  test(`Tree drags its horizontal scrollbar in ${rtl ? 'RTL' : 'LTR'}`, async ({ page }) => {
    await sample(page, rtl ? 'horizontal-rtl-observation' : 'horizontal');
    const thumb = host(page).locator('.ant-tree-list-scrollbar-horizontal .ant-tree-list-scrollbar-thumb');
    const box = await thumb.boundingBox();
    if (!box) throw Error('Missing horizontal thumb');
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + (rtl ? -84 : 84), y);

    await expect(inner(page)).toHaveCSS(rtl ? 'margin-right' : 'margin-left', '-210px');
    await page.mouse.up();
    await expect(holder(page)).toHaveCSS('pointer-events', 'auto');
  });

  test(`Tree handles horizontal touch and cancels inertia on unmount in ${rtl ? 'RTL' : 'LTR'}`, async ({ page }) => {
    await page.clock.install();
    await sample(page, rtl ? 'horizontal-rtl-observation' : 'horizontal');

    const prevented = await holder(page).evaluate((node, rtl) => {
      const touch = (x: number) => new Touch({
        identifier: 1, target: node, pageX: x, clientX: x, pageY: 50, clientY: 50
      });
      node.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, touches: [touch(200)] }));
      const event = new TouchEvent('touchmove', {
        bubbles: true, cancelable: true, touches: [touch(rtl ? 240 : 160)]
      });
      node.dispatchEvent(event);
      node.dispatchEvent(new TouchEvent('touchend', { bubbles: true, touches: [] }));
      return event.defaultPrevented;
    }, rtl);

    expect(prevented).toBe(true);
    await expect(inner(page)).toHaveCSS(rtl ? 'margin-right' : 'margin-left', '-40px');
    await page.getByRole('checkbox', { name: 'Mount virtual tree', exact: true }).uncheck();
    const calls = await page.locator('[data-tree-virtual-scroll-events]').textContent();
    await page.clock.runFor(4000);
    await expect(page.locator('[data-tree-virtual-scroll-events]')).toHaveText(calls!);
    await expect(host(page).locator('[role="tree"]')).toHaveCount(0);
  });
}

test('Tree scrolls real wheel input and reports native holder events', async ({ page }) => {
  await sample(page, 'virtual');
  await holder(page).hover();
  await page.mouse.wheel(0, 280);

  await expect.poll(() => holder(page).evaluate(node => node.scrollTop)).toBe(280);
  await expect(page.locator('[data-tree-virtual-scroll-events]')).toHaveText('[280]');
  await expect(page.getByRole('treeitem').first()).toHaveAttribute('aria-posinset', '10');
  await expect(page.getByRole('treeitem').first()).toHaveAttribute('aria-setsize', '64');
});

test('Tree drags its vertical scrollbar and restores the holder after release', async ({ page }) => {
  await sample(page, 'virtual');
  const thumb = host(page).locator('.ant-tree-list-scrollbar-vertical .ant-tree-list-scrollbar-thumb');
  const box = await thumb.boundingBox();
  if (!box) throw Error('Missing vertical thumb');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + 46);

  await expect.poll(() => holder(page).evaluate(node => node.scrollTop)).toBe(840);
  await page.mouse.up();
  await expect(holder(page)).toHaveCSS('pointer-events', 'auto');
});

test('Tree cancels an older measured alignment when a later scroll request wins', async ({ page }) => {
  await sample(page, 'virtual');
  await button(page, 'Scroll latest virtual tree').click();

  await expect.poll(() => holder(page).evaluate(node => node.scrollTop)).toBe(0);
  await expect(page.getByRole('treeitem').first()).toContainText('Item 0');
  await expect(page.locator('[data-tree-virtual-offset-calls]')).toHaveText('["superseded"]');
});

test('Tree responds to height, width and controlled active updates while keeping the root ref', async ({ page }) => {
  await sample(page, 'live-viewport');
  const before = await page.getByRole('tree', { name: 'Virtual tree', exact: true }).elementHandle();
  await button(page, 'Scroll virtual tree').click();
  await expect(inner(page)).toHaveCSS('margin-left', '-420px');

  await button(page, 'Update virtual tree').click();

  await expect(holder(page)).toHaveCSS('max-height', '56px');
  await expect(inner(page)).toHaveCSS('margin-left', '-140px');
  await expect.poll(() => activeTitle(page)).toBe('Item 40');
  await expect(page.getByRole('treeitem')).toHaveCount(5);
  expect(await before!.evaluate(node => node === document.querySelector('[role="tree"]'))).toBe(true);
  await expect(page.locator('[data-tree-virtual-ref]')).toHaveText('DIV');
});

test('Tree only starts lazy loads for mounted rows and ignores pending results after unmount', async ({ page }) => {
  await page.clock.install();
  await sample(page, 'lazy-window');
  const calls = page.locator('[data-tree-virtual-load-calls]');
  await expect(calls).toHaveText('["first",1,2,3,4,5]');

  await button(page, 'Scroll virtual tree').click();

  await expect(calls).toContainText('40');
  const before = await calls.textContent();
  await page.getByRole('checkbox', { name: 'Mount virtual tree', exact: true }).uncheck();
  await expect(page.locator('[data-tree-virtual-ref]')).toHaveText('none');
  const scrolls = await page.locator('[data-tree-virtual-scroll-events]').textContent();
  await button(page, 'Resolve virtual loads').click();
  await button(page, 'Use saved virtual ref').click();
  await page.clock.runFor(4000);

  await expect(calls).toHaveText(before!);
  await expect(page.locator('[data-tree-virtual-load-events]')).toHaveText('[]');
  await expect(page.locator('[data-tree-virtual-scroll-events]')).toHaveText(scrolls!);
  await expect(host(page).locator('[role="tree"]')).toHaveCount(0);
});
