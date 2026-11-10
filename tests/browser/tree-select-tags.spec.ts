import { test, expect } from './test';
import reference from './fixtures/ant-design-tree-select-tags-reference.json' with { type: 'json' };
import { readTreeTags } from './tree-select-tag-metrics';
import type { TreeTagAction } from './fixtures/tree-select-tag-cases';

for (const entry of reference.cases) {
  test(`TreeSelect tag display matches Source for ${entry.sample.id}`, async ({ page }) => {
    const sample = entry.sample;
    const prefix = sample.prefix || 'ant-select';
    await page.goto('/?fixture=tree-select-tags');
    await page.getByLabel('Tree tag sample').selectOption(sample.id);
    const read = async () => ({ view: await page.evaluate(readTreeTags, prefix),
      events: JSON.parse(await page.locator('[data-tree-tag-events]').innerText()) });
    await expect.poll(read).toEqual(entry.initial);
    for (const step of entry.steps) {
      const action = step.action as TreeTagAction;
      const input = page.getByRole('combobox', { name: 'Tree tag values', exact: true });
      if (action.kind === 'open') await input.click();
      else if (action.kind === 'key') await input.press(action.value);
      else if (action.kind === 'search') await input.fill(action.value);
      else if (action.kind === 'remove') {
        await page.getByRole('button', { name: 'Удалить Tail', exact: true }).click();
      } else if (action.kind === 'tag') {
        await page.locator('[data-tree-tag-custom]').filter({
          has: page.locator(`[data-tree-tag-close="${action.value}"]`)
        }).locator('[data-tree-tag-label]').click();
      } else if (action.kind === 'close') {
        await page.getByRole('button', { name: `Close ${action.value}`, exact: true }).click();
      } else if (action.kind === 'clear') {
        await page.getByRole('button', { name: 'Очистить', exact: true }).click();
      } else if (action.kind === 'choose') {
        await page.locator(`.${prefix}-dropdown [role="treeitem"][id$="-${action.value}"]`)
          .locator(sample.checkable || sample.strict ? '[data-ant-tree-checkbox]' : '[data-ant-tree-content]')
          .click({ force: true });
      } else {
        const name = action.kind === 'update-count' ? 'Update tree tag count'
          : action.kind === 'update-length' ? 'Update tree tag length'
            : action.kind === 'update-data' ? 'Update tree tag data'
              : action.kind === 'resize' && action.value === 200 ? 'Narrow tree tags' : 'Widen tree tags';
        await page.getByRole('button', { name, exact: true }).dispatchEvent('click');
      }
      await expect.poll(read, { message: JSON.stringify(action) })
        .toEqual({ view: step.view, events: step.events });
    }
  });
}
