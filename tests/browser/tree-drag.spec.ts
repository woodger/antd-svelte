import { test, expect } from './test';
import reference from './fixtures/ant-design-tree-drag-reference.json' with { type: 'json' };
import { treeDragSamples } from './fixtures/tree-drag-cases';
import { readTreeDrag, treeDragView } from './tree-drag-metrics';
import { treeDragAction } from './tree-drag-test';

for (const entry of reference.cases) {
  test(`Tree drag/drop matches Source for ${entry.sample.id}`, async ({ page }) => {
    const index = treeDragSamples.findIndex(sample => sample.id === entry.sample.id);
    const sample = treeDragSamples[index];
    const prefix = sample.localPrefix ?? `${sample.prefix ?? 'ant'}-tree`;
    await page.clock.install({ time: new Date('2026-11-10T12:00:00Z') });
    await page.goto('/?fixture=tree-drag');
    await page.getByRole('combobox', { name: 'Tree drag sample', exact: true }).selectOption(String(index));
    await expect(page.getByRole('tree', { name: 'Draggable tree', exact: true })).toBeVisible();
    await expect.poll(() => page.evaluate(readTreeDrag, prefix)).toEqual(entry.initial.nodes);

    let eventCount = 0;
    for (const [stepIndex, step] of entry.steps.entries()) {
      const prevented = await treeDragAction(page, sample.actions[stepIndex], prefix);
      if ('defaultPrevented' in step) expect(prevented).toBe(step.defaultPrevented);
      await expect.poll(async () => treeDragView(await page.evaluate(readTreeDrag, prefix)))
        .toEqual(step.result.view);
      const events = JSON.parse(await page.locator('[data-tree-drag-events]').textContent() ?? '[]');
      expect(events.slice(eventCount)).toEqual(step.result.events);
      eventCount = events.length;
      await expect(page.locator('[data-tree-drag-original]')).toHaveText('true');
      await expect(page.locator('[data-tree-drag-native]')).toHaveText('true');
    }
  });
}
