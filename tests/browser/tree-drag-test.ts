import type { Page } from '@playwright/test';
import type { TreeDragAction } from './fixtures/tree-drag-cases';
import { treeDragSamples, treeDragObservations, treeDragNativeSamples } from './fixtures/tree-drag-cases';

export async function mountTreeDrag(page: Page, id: string) {
  const samples = [...treeDragSamples, ...treeDragObservations, ...treeDragNativeSamples];
  const index = samples.findIndex(sample => sample.id === id);
  if (index < 0) throw new Error(`Unknown drag fixture: ${id}`);
  await page.clock.install({ time: new Date('2026-11-10T12:00:00Z') });
  await page.goto('/?fixture=tree-drag');
  await page.getByRole('combobox', { name: 'Tree drag sample', exact: true }).selectOption(String(index));
}

export async function treeDragEvents(page: Page): Promise<{
  type: string;
  node: { key: string | number; };
  dragNode?: { key: string | number; };
  dropToGap?: boolean;
}[]> {
  return JSON.parse(await page.locator('[data-tree-drag-events]').textContent() ?? '[]');
}

export async function treeDragAction(page: Page, action: TreeDragAction, prefix = 'ant-tree') {
  if (action.kind === 'wait') {
    await page.clock.runFor(action.milliseconds);
  } else if (action.kind === 'allow') {
    await page.getByRole('button', { name: action.value ? 'Allow drag drop' : 'Deny drag drop', exact: true })
      .click();
  } else if (action.kind === 'prefix') {
    await page.getByRole('button', { name: 'Change drag prefix', exact: true }).click();
  } else if (action.kind === 'payload') {
    await page.getByRole('button', { name: 'Update drag payload', exact: true }).click();
  } else if (action.kind === 'append-child') {
    await page.getByRole('button', { name: 'Append drag descendant', exact: true }).click();
  } else if (action.kind === 'unmount') {
    await page.getByRole('button', { name: 'Toggle drag mount', exact: true }).click();
  } else if (action.kind === 'scroll') {
    await page.getByRole('button', { name: 'Scroll drag tree', exact: true }).click();
  } else if (action.kind === 'windowend') {
    await page.evaluate(() => window.dispatchEvent(new DragEvent('dragend', {
      bubbles: true, cancelable: true, dataTransfer: new DataTransfer()
    })));
  } else {
    return page.evaluate(({ action, prefix }) => {
      const root = document.querySelector(`.${prefix}`)!;
      const title = root.querySelector(`[data-tree-drag-key="${action.key}"]`);
      if (!title) throw new Error(`Native row not mounted: ${action.key}`);
      const row = title.closest('[role="treeitem"]')!;
      const target = action.target === 'title' ? title
        : action.target === 'content' ? row.querySelector(`.${prefix}-node-content-wrapper`)!
          : action.target === 'handle' ? row.querySelector(`.${prefix}-draggable-icon`)! : row;
      const rect = target.getBoundingClientRect();
      const event = new DragEvent(action.kind, {
        bubbles: true, cancelable: true, dataTransfer: new DataTransfer(),
        clientX: root.getBoundingClientRect().left + (action.x ?? 100),
        clientY: rect.top + rect.height * (action.y ?? 0.75),
        relatedTarget: action.kind === 'dragleave' ? document.body : null
      });
      target.dispatchEvent(event);
      return event.defaultPrevented;
    }, { action, prefix });
  }
  return undefined;
}
