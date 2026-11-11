import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-tree-select-virtual-reference.json' with { type: 'json' };
import { treeSelectVirtualSamples } from './fixtures/tree-select-virtual-cases';
import { readTreeSelectVirtual } from './tree-select-virtual-metrics';

const input = (page: Page) => page.getByRole('combobox', { name: 'Virtual tree selection', exact: true });
const holder = (page: Page) => page.locator('[popover]:popover-open .ant-tree-list-holder');
const output = (page: Page) => page.locator('[data-virtual-ref]');

async function mount(page: Page, id: string) {
  await page.goto('/?fixture=tree-select-virtual');
  await page.getByRole('combobox', { name: 'Virtual TreeSelect sample', exact: true }).selectOption(id);
  await expect(output(page)).toHaveAttribute('data-virtual-ref', 'true');
}

async function apply(page: Page, index: number) {
  await page.getByRole('combobox', { name: 'Virtual TreeSelect action', exact: true }).selectOption(String(index));
  await page.getByRole('button', { name: 'Apply virtual TreeSelect action' }).dispatchEvent('click');
}

for (const entry of reference.cases) {
  test(`TreeSelect scrolling and list window follow Source for ${entry.id}`, async ({ page }) => {
    const sample = treeSelectVirtualSamples.find(item => item.id === entry.id)!;
    await mount(page, entry.id);
    const read = () => page.evaluate(readTreeSelectVirtual, 'native');
    await expect.poll(read).toEqual(entry.initial);
    for (const [index, result] of entry.steps.entries()) {
      const action = sample.actions![index];
      if ('key' in action) await input(page).press(action.key);
      else await apply(page, index);
      await expect.poll(read, { message: `action ${index}: ${JSON.stringify(action)}` }).toEqual(result);
    }
    await expect(output(page)).toHaveAttribute('data-virtual-expansions', '0');
    await expect(output(page)).toHaveAttribute('data-virtual-scroll-target', 'true');
  });
}

test('TreeSelect restores the keyboard target after manual scrolling removes its row', async ({ page }) => {
  await mount(page, 'default');
  await input(page).focus();
  await expect.poll(() => input(page).getAttribute('aria-activedescendant')).toBeTruthy();
  await apply(page, 0);
  await expect.poll(() => holder(page).evaluate(element => element.scrollTop)).toBe(56);
  await expect(input(page)).not.toHaveAttribute('aria-activedescendant');
  await expect(output(page)).not.toHaveAttribute('data-virtual-scrolls', '0');
  await expect(output(page)).toHaveAttribute('data-virtual-scroll-target', 'true');

  await input(page).press('ArrowDown');
  await expect.poll(() => input(page).evaluate(element => {
    const id = element.getAttribute('aria-activedescendant');
    return id ? element.ownerDocument.getElementById(id)?.textContent?.trim() : undefined;
  })).toBe('Node 61');
  await expect(input(page)).toBeFocused();
});

test('TreeSelect keeps the visible rows aligned with the retained position after a closed scroll request', async ({ page }) => {
  await mount(page, 'hidden-scroll');
  await apply(page, 0);
  await expect.poll(() => page.evaluate(readTreeSelectVirtual, 'native')).toMatchObject({
    viewport: { top: 280, first: 'Node 9', last: 'Node 14' }
  });
  await apply(page, 1);
  await expect(holder(page)).toHaveCount(0);
  await apply(page, 2);
  await apply(page, 3);
  await expect.poll(() => page.evaluate(readTreeSelectVirtual, 'native')).toMatchObject({
    viewport: { top: 280, first: 'Node 9', last: 'Node 14' }
  });
});

test('TreeSelect explicit undefined inherits the provider virtual setting', async ({ page }) => {
  await mount(page, 'provider-virtual-undefined');
  await expect.poll(() => page.evaluate(readTreeSelectVirtual, 'native')).toMatchObject({
    viewport: { count: 80, height: 84, overflowY: 'auto' }
  });
});

test('TreeSelect scrollTo is safe when the open search has no results', async ({ page }) => {
  await mount(page, 'empty-ref');
  await expect(page.getByRole('listbox')).toBeVisible();
  await apply(page, 0);
  await expect(page.getByRole('listbox')).toBeVisible();
  await expect(output(page)).toHaveAttribute('data-virtual-scrolls', '0');
});

for (const id of ['default', 'custom-popup']) {
  test(`TreeSelect scrollbar drag keeps editor focus in the ${id} popup`, async ({ page }) => {
    await mount(page, id);
    await input(page).focus();
    await apply(page, 0);
    await expect.poll(() => holder(page).evaluate(element => element.scrollTop)).toBe(56);
    const thumb = page.locator('[popover]:popover-open .ant-tree-list-scrollbar-thumb');
    await thumb.hover();
    const box = await thumb.boundingBox();
    expect(box).not.toBeNull();
    const x = box!.x + box!.width / 2;
    const y = box!.y + box!.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x, y + 24, { steps: 4 });
    await page.mouse.up();
    await expect.poll(() => holder(page).evaluate(element => element.scrollTop)).toBeGreaterThan(56);
    await expect(output(page)).toHaveAttribute('data-virtual-scroll-target', 'true');
    await expect(input(page)).toBeFocused();
    if (id === 'custom-popup') {
      const draft = page.getByRole('textbox', { name: 'Virtual popup draft' });
      await draft.fill('Draft');
      await expect(draft).toBeFocused();
    }
  });
}
