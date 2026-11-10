import { test, expect } from './test';
import reference from './fixtures/ant-design-tree-drag-reference.json' with { type: 'json' };
import { readTreeDrag } from './tree-drag-metrics';
import { mountTreeDrag, treeDragAction, treeDragEvents } from './tree-drag-test';

test('Tree rejects a drop when allowDrop changes after dragenter', async ({ page }) => {
  const source = reference.observations.find(entry => entry.sample.id === 'stale-allow-observation')!;
  expect(source.steps.some(step => step.result.events.some(event => event.type === 'drop'))).toBe(true);
  await mountTreeDrag(page, source.sample.id);
  await treeDragAction(page, { kind: 'dragstart', key: 'c' });
  await treeDragAction(page, { kind: 'dragenter', key: 'b', x: 160 });
  await expect(page.locator('.ant-tree-drop-indicator')).toHaveCount(1);
  await treeDragAction(page, { kind: 'allow', value: false });
  await treeDragAction(page, { kind: 'dragover', key: 'b', x: 160 });
  await expect(page.locator('.ant-tree-drop-indicator')).toHaveCount(0);
  await treeDragAction(page, { kind: 'drop', key: 'b', x: 160 });
  await treeDragAction(page, { kind: 'dragend', key: 'c' });

  expect((await treeDragEvents(page)).map(event => event.type))
    .toEqual(['dragstart', 'dragenter', 'dragend']);
});

test('Tree revalidates allowDrop at drop without requiring another dragover', async ({ page }) => {
  await mountTreeDrag(page, 'stale-allow-observation');
  await treeDragAction(page, { kind: 'dragstart', key: 'c' });
  await treeDragAction(page, { kind: 'dragenter', key: 'b', x: 160 });
  await treeDragAction(page, { kind: 'allow', value: false });
  await treeDragAction(page, { kind: 'drop', key: 'b', x: 160 });
  await treeDragAction(page, { kind: 'dragend', key: 'c' });

  expect((await treeDragEvents(page)).filter(event => event.type === 'drop')).toEqual([]);
  await expect(page.locator('.ant-tree-drop-indicator')).toHaveCount(0);
});

test('Tree ends a virtualized-away source through the window with a valid node', async ({ page }) => {
  const source = reference.observations.find(entry => entry.sample.id === 'window-end-observation')!;
  expect(source.errors).toEqual(["Cannot destructure property 'data' of 'props' as it is null."]);
  await mountTreeDrag(page, source.sample.id);
  await treeDragAction(page, { kind: 'dragstart', key: 'v0' });
  await treeDragAction(page, { kind: 'scroll', key: 'v30' });
  await expect(page.locator('[data-tree-drag-key="v0"]')).toHaveCount(0);
  await treeDragAction(page, { kind: 'windowend' });

  expect(await treeDragEvents(page)).toMatchObject([
    { type: 'dragstart', node: { key: 'v0' } }, { type: 'dragend', node: { key: 'v0' } }
  ]);
  await expect(page.locator('.dragging, .ant-tree-drop-indicator')).toHaveCount(0);
  await treeDragAction(page, { kind: 'windowend' });
  expect(await treeDragEvents(page)).toHaveLength(2);
});

test('Tree cancels delayed expand and retained DOM events after unmount', async ({ page }) => {
  const source = reference.observations.find(entry => entry.sample.id === 'unmount-timer-observation')!;
  expect(source.steps.at(-1)!.result.events.map(event => event.type)).toContain('expand');
  await mountTreeDrag(page, source.sample.id);
  await treeDragAction(page, { kind: 'dragstart', key: 'c' });
  await treeDragAction(page, { kind: 'dragenter', key: 'b', x: 160 });
  const retained = await page.locator('[data-tree-drag-key="c"]').evaluateHandle(
    element => element.closest('[role="treeitem"]')!
  );
  await treeDragAction(page, { kind: 'unmount' });
  await expect(page.locator('[data-tree-drag-ref]')).toHaveText('none');
  await page.clock.runFor(1200);
  await retained.evaluate(element => {
    for (const type of ['dragstart', 'dragenter', 'dragover', 'dragleave', 'drop', 'dragend'])
      element.dispatchEvent(new DragEvent(type, { bubbles: true, cancelable: true }));
  });
  await treeDragAction(page, { kind: 'windowend' });

  expect((await treeDragEvents(page)).map(event => event.type)).toEqual(['dragstart', 'dragenter']);
  await retained.dispose();
});

test('Tree keeps a zero parent as the drop container', async ({ page }) => {
  await mountTreeDrag(page, 'zero-container-observation');
  await treeDragAction(page, { kind: 'dragstart', key: 'c' });
  await treeDragAction(page, { kind: 'dragenter', key: 'z1', x: 100 });
  const zero = (await page.evaluate(readTreeDrag, 'ant-tree')).find(node => node.key === '0');

  expect(zero?.container).toBe(true);
  await treeDragAction(page, { kind: 'drop', key: 'z1', x: 100 });
  await treeDragAction(page, { kind: 'dragend', key: 'c' });
  expect((await treeDragEvents(page)).find(event => event.type === 'drop'))
    .toMatchObject({ node: { key: 'z1' }, dropToGap: true });
});

for (const id of ['inside-collapsed', 'hidden-handle']) {
  test(`Tree starts a real mouse drag from ${id === 'hidden-handle' ? 'the native title button' : 'the handle'}`, async ({ page }) => {
    await mountTreeDrag(page, id);
    const source = page.getByRole('treeitem', { name: 'Gamma', exact: true });
    const target = page.getByRole('treeitem', { name: 'Beta', exact: true });

    await source.dragTo(target, {
      sourcePosition: { x: id === 'hidden-handle' ? 80 : 12, y: 12 },
      targetPosition: { x: 120, y: 18 }
    });

    const events = await treeDragEvents(page);
    expect(events.find(event => event.type === 'dragstart')).toMatchObject({ node: { key: 'c' } });
    expect(events.find(event => event.type === 'drop'))
      .toMatchObject({ node: { key: 'b' }, dragNode: { key: 'c' }, dropToGap: false });
    expect(events.at(-1)).toMatchObject({ type: 'dragend', node: { key: 'c' } });
    await expect(page.locator('.dragging, .ant-tree-drop-indicator')).toHaveCount(0);
    await expect(page.getByRole('tree', { name: 'Draggable tree', exact: true })).toBeFocused();
  });
}

for (const control of ['Toggle draggable', 'Remove drag source']) {
  test(`Tree cancels its session when the owner applies ${control}`, async ({ page }) => {
    await mountTreeDrag(page, 'delayed-expand');
    await treeDragAction(page, { kind: 'dragstart', key: 'c' });
    await treeDragAction(page, { kind: 'dragenter', key: 'b', x: 160 });
    await page.getByRole('button', { name: control, exact: true }).click();
    await page.clock.runFor(1200);
    await treeDragAction(page, { kind: 'windowend' });

    expect((await treeDragEvents(page)).map(event => event.type)).toEqual(['dragstart', 'dragenter']);
    await expect(page.locator('.dragging, .ant-tree-drop-indicator')).toHaveCount(0);
  });
}

test('Tree releases a drag cancelled by onDragStart', async ({ page }) => {
  await mountTreeDrag(page, 'inside-collapsed');
  await page.getByRole('button', { name: 'Cancel drag start', exact: true }).click();
  expect(await treeDragAction(page, { kind: 'dragstart', key: 'c' })).toBe(true);
  await treeDragAction(page, { kind: 'windowend' });

  expect((await treeDragEvents(page)).map(event => event.type)).toEqual(['dragstart']);
  await expect(page.locator('.dragging, .ant-tree-drop-indicator, .ant-tree-node-selected'))
    .toHaveCount(0);
});

test('Tree drops after its source has left the virtual window', async ({ page }) => {
  await mountTreeDrag(page, 'virtual');
  await treeDragAction(page, { kind: 'dragstart', key: 'v0' });
  await treeDragAction(page, { kind: 'scroll', key: 'v30' });
  await expect(page.locator('[data-tree-drag-key="v0"]')).toHaveCount(0);
  await treeDragAction(page, { kind: 'dragenter', key: 'v30', x: 160 });
  await treeDragAction(page, { kind: 'dragover', key: 'v30', x: 160 });
  await treeDragAction(page, { kind: 'drop', key: 'v30', x: 160 });
  await treeDragAction(page, { kind: 'windowend' });

  expect((await treeDragEvents(page)).filter(event => event.type === 'drop' || event.type === 'dragend'))
    .toMatchObject([{ type: 'drop', node: { key: 'v30' }, dragNode: { key: 'v0' } },
      { type: 'dragend', node: { key: 'v0' } }]);
  await expect(page.locator('.dragging, .ant-tree-drop-indicator')).toHaveCount(0);
});

test('Tree updates drag handles and indicator direction without replacing nodes or refs', async ({ page }) => {
  const raw = reference.observations.find(entry => entry.sample.id === 'prefix-cache-observation')!;
  expect(raw.steps.find(step => step.action.kind === 'prefix')?.result.view.handles).toEqual([]);
  await mountTreeDrag(page, 'prefix-cache-observation');
  const root = await page.locator('[data-ant-tree-root]').elementHandle();
  const row = await page.getByRole('treeitem', { name: 'Gamma', exact: true }).elementHandle();
  await treeDragAction(page, { kind: 'dragstart', key: 'c' }, 'branch');
  await treeDragAction(page, { kind: 'dragenter', key: 'b', x: 160 }, 'branch');
  await treeDragAction(page, { kind: 'prefix', value: 'fresh-tree' }, 'branch');
  await expect(page.locator('.fresh-tree-draggable-icon')).toHaveCount(9);
  await expect(page.locator('.branch-draggable-icon')).toHaveCount(0);
  expect(await root!.evaluate(element => element === document.querySelector('[data-ant-tree-root]')))
    .toBe(true);
  expect(await row!.evaluate(element => element === document.querySelector('.dragging'))).toBe(true);
  await expect(page.locator('[data-tree-drag-ref]')).toHaveText('DIV');
  await page.getByRole('button', { name: 'Toggle drag direction', exact: true }).click();
  await expect(page.locator('.fresh-tree-drop-indicator')).toHaveCSS('right', '28px');
  await expect(page.locator('.fresh-tree-drop-indicator')).toHaveCSS('left', '0px');
  await treeDragAction(page, { kind: 'dragend', key: 'c' }, 'fresh-tree');

  await page.getByRole('button', { name: 'Change drag indent', exact: true }).click();
  await treeDragAction(page, { kind: 'dragstart', key: 'c' }, 'fresh-tree');
  await treeDragAction(page, { kind: 'dragenter', key: 'b', x: 40 }, 'fresh-tree');
  await expect(page.locator('.fresh-tree-drop-indicator')).toHaveCSS('right', '40px');
  await treeDragAction(page, { kind: 'dragend', key: 'c' }, 'fresh-tree');
});

test('Tree retains selection, checks and keyboard focus across a real drag', async ({ page }) => {
  await mountTreeDrag(page, 'native-check-focus');
  const tree = page.getByRole('tree', { name: 'Draggable tree', exact: true });
  const source = page.getByRole('treeitem', { name: 'Gamma', exact: true });
  const target = page.getByRole('treeitem', { name: 'Beta', exact: true });
  await tree.focus();
  const active = await tree.getAttribute('aria-activedescendant');
  await source.locator('.ant-tree-draggable-icon').dragTo(target, { targetPosition: { x: 120, y: 18 } });

  await expect(source).toHaveAttribute('aria-selected', 'true');
  await expect(source).toHaveAttribute('aria-checked', 'true');
  await expect(tree).toBeFocused();
  await expect(tree).toHaveAttribute('aria-activedescendant', active!);
  await source.getByRole('checkbox').click();
  await expect(source).toHaveAttribute('aria-checked', 'false');
  await tree.press('ArrowUp');
  await tree.press(' ');
  await expect(target).toHaveAttribute('aria-checked', 'true');
  await expect(source).toHaveAttribute('aria-selected', 'true');
});

test('Tree leaves data reordering to onDrop while retaining the moved DOM node', async ({ page }) => {
  await mountTreeDrag(page, 'before-first');
  await page.getByRole('button', { name: 'Reorder dropped roots', exact: true }).click();
  const row = await page.getByRole('treeitem', { name: 'Gamma', exact: true }).elementHandle();
  await treeDragAction(page, { kind: 'dragstart', key: 'c' });
  await treeDragAction(page, { kind: 'dragenter', key: 'a', x: 100, y: 0.2 });
  await treeDragAction(page, { kind: 'drop', key: 'a', x: 100, y: 0.2 });
  await treeDragAction(page, { kind: 'dragend', key: 'c' });

  expect((await page.evaluate(readTreeDrag, 'ant-tree')).map(node => node.key).slice(0, 3))
    .toEqual(['c', 'a', 'a1']);
  expect(await row!.evaluate(element => element === document.querySelector('[role="treeitem"]')))
    .toBe(true);
  expect((await treeDragEvents(page)).at(-1)).toMatchObject({ type: 'dragend', node: { key: 'c' } });
});

for (const id of ['inside-collapsed', 'prefix']) {
  test(`Tree renders Source drag feedback for ${id}`, async ({ page }) => {
    await mountTreeDrag(page, id);
    const prefix = id === 'prefix' ? 'branch' : 'ant-tree';
    await treeDragAction(page, { kind: 'dragstart', key: 'c' }, prefix);
    const feedback = await page.locator('.dragging').evaluate(element => {
      const style = getComputedStyle(element, '::after');
      return { opacity: style.opacity, pointerEvents: style.pointerEvents, border: style.borderTopWidth };
    });

    expect(feedback).toEqual({ opacity: '1', pointerEvents: 'none', border: '1px' });
    await treeDragAction(page, { kind: 'dragend', key: 'c' }, prefix);
  });
}

test('Tree drag callbacks preserve generic raw data, bigint keys and canonical event flags', async ({ page }) => {
  await page.goto('/?fixture=tree-drag-generic');
  await treeDragAction(page, { kind: 'dragstart', key: 'moving' });
  await treeDragAction(page, { kind: 'dragenter', key: '2', x: 100 });
  await treeDragAction(page, { kind: 'dragover', key: '2', x: 100 });
  await treeDragAction(page, { kind: 'drop', key: '2', x: 100 });
  await treeDragAction(page, { kind: 'dragend', key: 'moving' });
  const events = JSON.parse(await page.locator('[data-tree-drag-generic-events]').textContent() ?? '[]');

  expect(events).toMatchObject([
    { type: 'dragstart', node: { key: 'moving', keyType: 'string', payload: 3, expanded: false } },
    { type: 'dragenter', node: { key: '2', keyType: 'bigint', payload: 2, over: false } },
    { type: 'dragover', node: { key: '2', keyType: 'bigint', bottom: true } },
    { type: 'drop', node: { key: '2', keyType: 'bigint', bottom: true },
      dragNode: { key: 'moving' }, keys: ['string:moving'], position: 1, gap: true },
    { type: 'dragend', node: { key: 'moving', expanded: false } }
  ]);
  await expect(page.locator('[data-tree-drag-generic-valid]')).toHaveText('true');
});

test('Tree includes generic collapsed descendants and preserves the pre-collapse drag snapshot', async ({ page }) => {
  await page.goto('/?fixture=tree-drag-generic');
  await treeDragAction(page, { kind: 'dragstart', key: 0 });
  await expect(page.locator('[data-tree-drag-key="2"]')).toHaveCount(0);
  await treeDragAction(page, { kind: 'dragenter', key: 'moving', x: 160 });
  await treeDragAction(page, { kind: 'drop', key: 'moving', x: 160 });
  await treeDragAction(page, { kind: 'dragend', key: 0 });
  const events = JSON.parse(await page.locator('[data-tree-drag-generic-events]').textContent() ?? '[]');

  expect(events[2]).toMatchObject({ type: 'drop', dragNode: { key: '0', keyType: 'number', expanded: true },
    keys: ['number:0', 'bigint:2'], position: 1, gap: false });
  expect(events.at(-1)).toMatchObject({ type: 'dragend', node: { key: '0', expanded: false } });
  await expect(page.locator('[data-tree-drag-generic-valid]')).toHaveText('true');
});

test('Tree forbids a descendant added after dragstart', async ({ page }) => {
  const raw = reference.observations.find(entry => entry.sample.id === 'late-descendant-observation')!;
  expect(raw.steps.some(step => step.result.events.some(event => event.type === 'drop'))).toBe(true);
  await mountTreeDrag(page, raw.sample.id);
  await treeDragAction(page, { kind: 'dragstart', key: 'a' });
  await treeDragAction(page, { kind: 'append-child' });
  await expect(page.locator('[data-tree-drag-key="late"]')).toHaveCount(1);
  await treeDragAction(page, { kind: 'dragenter', key: 'late', x: 160 });
  await treeDragAction(page, { kind: 'dragover', key: 'late', x: 160 });
  await treeDragAction(page, { kind: 'drop', key: 'late', x: 160 });
  await treeDragAction(page, { kind: 'dragend', key: 'a' });

  expect((await treeDragEvents(page)).map(event => event.type)).toEqual(['dragstart', 'dragend']);
  await expect(page.locator('.dragging, .ant-tree-drop-indicator')).toHaveCount(0);
});

test('Tree completes a real drag after scrolling its source out of the virtual window', async ({ page }) => {
  await mountTreeDrag(page, 'virtual');
  const handle = await page.getByRole('treeitem', { name: 'Virtual 0', exact: true })
    .locator('.ant-tree-draggable-icon').boundingBox();
  if (!handle) throw new Error('Source handle has no box');
  await page.mouse.move(handle.x + 12, handle.y + 12);
  await page.mouse.down();
  try {
    await page.mouse.move(handle.x + 22, handle.y + 16, { steps: 5 });
    await expect(page.locator('.dragging')).toHaveCount(1);
    await page.getByRole('button', { name: 'Scroll drag tree', exact: true }).dispatchEvent('click');
    await expect(page.locator('[data-tree-drag-key="v0"]')).toHaveCount(0);
    const target = page.getByRole('treeitem', { name: 'Virtual 30', exact: true });
    await expect(target).toBeVisible();
    const box = await target.boundingBox();
    if (!box) throw new Error('Drop target has no box');
    await page.mouse.move(box.x + 120, box.y + 18, { steps: 5 });
    await page.mouse.up();
  } finally {
    await page.mouse.up();
  }

  const events = await treeDragEvents(page);
  expect(events.find(event => event.type === 'drop'))
    .toMatchObject({ node: { key: 'v30' }, dragNode: { key: 'v0' } });
  expect(events.at(-1)).toMatchObject({ type: 'dragend', node: { key: 'v0' } });
  await expect(page.locator('.dragging, .ant-tree-drop-indicator')).toHaveCount(0);
});

for (const id of ['inside-collapsed', 'custom-handle']) {
  test(`Tree keeps keyboard focus at the root after clicking the ${id} handle`, async ({ page }) => {
    await mountTreeDrag(page, id);
    const source = page.getByRole('treeitem', { name: 'Gamma', exact: true });
    await source.locator('.ant-tree-draggable-icon').click();

    await expect(page.getByRole('tree', { name: 'Draggable tree', exact: true })).toBeFocused();
    await expect(source).toHaveAttribute('aria-selected', 'false');
    expect(await treeDragEvents(page)).toEqual([]);
  });
}

test('Tree preserves an opaque handle control and its native keyboard focus', async ({ page }) => {
  await mountTreeDrag(page, 'native-handle-control');
  const action = page.getByRole('treeitem', { name: 'Gamma', exact: true })
    .getByRole('button', { name: 'Handle action', exact: true });
  await action.click();

  await expect(action).toBeFocused();
  await expect(page.locator('[data-tree-drag-handle-actions]')).toHaveText('1');
  await action.press('Enter');
  await expect(page.locator('[data-tree-drag-handle-actions]')).toHaveText('2');
  expect(await treeDragEvents(page)).toEqual([]);
});

test('Tree routes keyboard navigation from a focused draggable row through its root', async ({ page }) => {
  await mountTreeDrag(page, 'inside-collapsed');
  const row = page.getByRole('treeitem', { name: 'Gamma', exact: true });
  const tree = page.getByRole('tree', { name: 'Draggable tree', exact: true });
  const target = page.getByRole('treeitem', { name: 'Beta', exact: true });
  await row.focus();
  await row.press('ArrowUp');

  await expect(tree).toBeFocused();
  await expect(tree).toHaveAttribute('aria-activedescendant', await target.getAttribute('id') ?? '');
  await tree.press('Enter');
  await expect(page.getByRole('treeitem', { name: 'Beta one', exact: true })).toBeVisible();
});
