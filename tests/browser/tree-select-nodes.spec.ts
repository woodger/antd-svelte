import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-tree-select-nodes-reference.json' with { type: 'json' };
import type { TreeSelectNodesAction, TreeSelectNodesSample } from './fixtures/tree-select-nodes-cases';
import { treeSelectNodesSamples } from './fixtures/tree-select-nodes-cases';
import { readTreeSelectNodes } from './tree-select-nodes-metrics';

const input = (page: Page) => page.getByRole('combobox', { name: 'Declared selection', exact: true });

async function mount(page: Page, id: string) {
  await page.goto('/?fixture=tree-select-nodes');
  await page.getByRole('combobox', { name: 'TreeSelect node sample', exact: true }).selectOption(id);
  await expect(page.locator('[data-node-ref]')).toHaveAttribute('data-node-ref', 'true');
}

async function apply(page: Page, action: TreeSelectNodesAction, index: number, sample: TreeSelectNodesSample) {
  if (action === 'open') await input(page).click();
  else if (action === 'choose-zero' || action === 'choose-beta') {
    const marker = action === 'choose-zero' ? 'zero' : 'beta';
    await page.locator(`[popover]:popover-open [data-node-marker="${marker}"]`)
      .locator(sample.checkable ? '[data-ant-tree-checkbox]' : '[data-ant-tree-content]').click({ force: true });
  } else if (action === 'expand' || action === 'collapse') {
    await page.locator('[popover]:popover-open [data-node-marker="parent"] [data-ant-tree-switcher]').click();
  } else if (action === 'search' || action === 'reset-search') await input(page).fill(action === 'search' ? 'b' : '');
  else {
    await page.getByRole('combobox', { name: 'TreeSelect node action', exact: true }).selectOption(String(index));
    await page.getByRole('button', { name: 'Apply TreeSelect node action' }).dispatchEvent('click');
  }
}

for (const entry of reference.cases) {
  test(`TreeSelect nodes follow Source for ${entry.id}`, async ({ page }) => {
    const sample = treeSelectNodesSamples.find(item => item.id === entry.id)!;
    await mount(page, entry.id);
    const read = () => page.evaluate(readTreeSelectNodes, 'ant-tree');
    await expect.poll(read).toEqual(entry.initial);
    for (const [index, step] of entry.steps.entries()) {
      await apply(page, step.action as TreeSelectNodesAction, index, sample);
      await expect.poll(read, { message: step.action }).toEqual(step.view);
    }
    if (sample.lazy) await expect(page.locator('[data-node-load-calls]')).toHaveAttribute('data-node-load-calls', '1');
    if (sample.data || sample.override) await expect(page.locator('[data-ant-tree-select-declarations]')).toHaveCount(0);
  });
}

test('TreeSelect retains the field, row and focus while keyed declarations change order and labels', async ({ page }) => {
  await mount(page, 'live-order');
  const editor = await input(page).elementHandle();
  const row = page.locator('[popover]:popover-open [data-node-marker="zero"]');
  const element = await row.elementHandle();
  await input(page).focus();
  const sample = treeSelectNodesSamples.find(item => item.id === 'live-order')!;
  for (const [index, action] of sample.actions!.entries()) await apply(page, action, index, sample);
  await expect(row.locator('.ant-tree-title')).toHaveText('Updated Zero');
  expect(await input(page).evaluate((node, previous) => node === previous, editor)).toBe(true);
  expect(await row.evaluate((node, previous) => node === previous, element)).toBe(true);
  await expect(input(page)).toBeFocused();
});

test('TreeSelect starts one pending load for an expanded declaration and publishes one load callback', async ({ page }) => {
  const sample = treeSelectNodesSamples.find(item => item.id === 'lazy')!;
  await mount(page, sample.id);
  await apply(page, 'expand', 0, sample);
  await expect(page.locator('[data-node-load-calls]')).toHaveAttribute('data-node-load-calls', '1');
  await expect(page.locator('[popover]:popover-open [data-node-marker="parent"]')).toHaveAttribute('aria-busy', 'true');
  await apply(page, 'resolve', 1, sample);
  await expect(page.locator('[popover]:popover-open .ant-tree-title'))
    .toHaveText(['Node Parent', 'Node Zero', 'Node Beta', 'Node Disabled', 'Node Tail']);
  const events = await page.locator('[data-node-events]').textContent();
  expect(JSON.parse(events!).filter((event: unknown[]) => event[0] === 'load')).toEqual([['load', ['p']]]);
  await apply(page, 'choose-zero', 2, sample);
  await expect(input(page)).toHaveValue('Node Zero');
  await expect(input(page)).toBeFocused();
});

test('TreeSelect disposes the declaration collector and pending load when the control unmounts', async ({ page }) => {
  const sample = treeSelectNodesSamples.find(item => item.id === 'lazy')!;
  await mount(page, sample.id);
  await apply(page, 'expand', 0, sample);
  await expect(page.locator('[data-node-load-calls]')).toHaveAttribute('data-node-load-calls', '1');
  const events = await page.locator('[data-node-events]').textContent();
  await page.getByRole('button', { name: 'Unmount declared selection' }).dispatchEvent('click');
  await expect(page.locator('[data-node-ref]')).toHaveAttribute('data-node-ref', 'false');
  await expect(page.locator('[data-ant-tree-select-declarations]')).toHaveCount(0);
  await apply(page, 'resolve', 1, sample);
  await expect(page.locator('[data-node-events]')).toHaveText(events!);
  await expect(page.locator('[popover]')).toHaveCount(0);
});
