import { test, expect } from './test';
import reference from './fixtures/ant-design-tree-select-data-reference.json' with { type: 'json' };
import { readTreeSelectData } from './tree-select-data-metrics';
import type { TreeSelectDataAction } from './fixtures/tree-select-data-cases';

for (const sample of reference.cases) test(`TreeSelect data matches Source for ${sample.id}`, async ({ page }) => {
  await page.goto('/?fixture=tree-select-data');
  await page.getByLabel('TreeSelect data case').selectOption(sample.id);
  const read = async () => ({
    view: await page.evaluate(readTreeSelectData, { treePrefix: 'ant-tree' }),
    events: JSON.parse(await page.locator('[data-tree-select-data-events]').innerText()),
    ...JSON.parse(await page.locator('[data-tree-select-data-meta]').innerText())
  });
  await expect.poll(read).toEqual(sample.initial);
  for (const step of sample.steps) {
    const action = step.action as TreeSelectDataAction;
    if (action.kind === 'open') await page.getByRole('combobox', { name: 'Data selection' }).click();
    else if (action.kind === 'choose') {
      const row = page.locator(`.ant-select-dropdown [role="treeitem"][id$="-${action.value}"]`);
      await row.locator(/^(check-|strict)/.test(sample.id)
        ? '[data-ant-tree-checkbox]' : '[data-ant-tree-content]').click();
    } else if (action.kind === 'remove') {
      await page.getByRole('button', { name: `Удалить ${action.label}`, exact: true }).click();
    } else if (action.kind === 'search') {
      await page.getByRole('combobox', { name: 'Data selection' }).fill(action.value);
    } else await page.getByRole('button', { name: action.kind === 'update' ? 'Update data'
      : action.kind === 'schema' ? 'Update schema' : 'Nested data', exact: true }).dispatchEvent('click');
    await expect.poll(read, { message: JSON.stringify(action) }).toEqual({
      view: step.view, events: step.events, inputMutated: step.inputMutated,
      filterClone: step.filterClone, rendererData: step.rendererData
    });
  }
});
