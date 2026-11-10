import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-tree-select-labels-reference.json' with { type: 'json' };
import type { TreeLabelAction, TreeLabelSample } from './fixtures/tree-select-label-cases';
import { readTreeLabels } from './tree-select-label-metrics';

const input = (page: Page) => page.getByRole('combobox', { name: 'Renderer selection', exact: true });
async function mount(page: Page, id: string) {
  await page.goto('/?fixture=tree-select-labels');
  await page.getByLabel('Renderer sample').selectOption(id);
}
async function act(page: Page, sample: Pick<TreeLabelSample, 'id' | 'checkable' | 'strict'>, action: TreeLabelAction) {
  if (action.kind === 'open') await input(page).click();
  else if (action.kind === 'key') await input(page).press(action.value);
  else if (action.kind === 'choose') {
    await page.locator(`.ant-select-dropdown [role="treeitem"][id$="-${action.value}"]`)
      .locator(sample.checkable || sample.strict ? '[data-ant-tree-checkbox]' : '[data-ant-tree-content]')
      .click({ force: true });
  } else if (action.kind === 'clear') {
    await page.getByRole('button', { name: 'Очистить', exact: true }).click();
  } else {
    const name = action.kind === 'update-data' ? 'Update renderer data'
      : action.kind === 'remove-data' ? 'Remove renderer data'
        : action.kind === 'update-renderer' ? 'Update title renderer'
          : action.kind === 'remove-renderer' ? 'Remove title renderer' : 'Update renderer and data';
    await page.getByRole('button', { name, exact: true }).dispatchEvent('click');
  }
}

for (const entry of reference.cases) {
  test(`TreeSelect renders Source callback and omitted labels for ${entry.sample.id}`, async ({ page }) => {
    await mount(page, entry.sample.id);
    const read = () => page.evaluate(readTreeLabels);
    await expect.poll(read).toEqual(entry.initial);
    for (const step of entry.steps) {
      await act(page, entry.sample, step.action as TreeLabelAction);
      await expect.poll(read, { message: JSON.stringify(step.action) }).toEqual(step.view);
    }
  });
}

for (const [id, counterpartId] of [
  ['stale-renderer', 'fresh-renderer-counterpart'], ['removed-renderer', 'plain-counterpart']
] as const) {
  test(`TreeSelect follows the current title renderer after ${id}`, async ({ page }) => {
    const source = reference.observations.find(entry => entry.sample.id === id)!;
    const counterpart = reference.cases.find(entry => entry.sample.id === counterpartId)!;
    expect(source.steps[0].view.omitted).toEqual(source.initial.omitted);
    expect(source.steps.at(-1)!.view.history).not.toEqual(counterpart.steps.at(-1)!.view.history);
    await mount(page, id);
    const read = () => page.evaluate(readTreeLabels);
    await expect.poll(read).toEqual(source.initial);
    await input(page).focus();
    const editor = await input(page).elementHandle();

    await act(page, source.sample, source.steps[0].action as TreeLabelAction);

    await expect.poll(read).toEqual(counterpart.initial);
    await expect(input(page)).toBeFocused();
    expect(await editor!.evaluate(node => node.isConnected)).toBe(true);
    for (const step of counterpart.steps) {
      await act(page, counterpart.sample, step.action as TreeLabelAction);
      await expect.poll(read).toEqual(step.view);
    }
  });
}

for (const id of ['multiple', 'one-visible']) {
  test(`TreeSelect returned snippets mount lazily after control unmount for ${id}`, async ({ page }) => {
    await mount(page, id);
    await page.getByLabel('Interactive renderer').check();
    const lifecycle = async () => JSON.parse(await page.locator('[data-tree-label-lifecycle]').innerText());
    await expect.poll(lifecycle).toEqual(['mount:header:0', 'mount:header:1']);
    const alpha = page.getByRole('textbox', { name: 'header label draft 0', exact: true });
    await alpha.fill('Keep visible draft');
    await input(page).press('Backspace');
    await expect(alpha).toHaveValue('Keep visible draft');
    await expect.poll(lifecycle).toEqual(['mount:header:0', 'mount:header:1', 'destroy:header:1']);
    await expect(page.locator('[data-tree-label-batch]')).toHaveCount(0);

    await page.getByRole('button', { name: 'Unmount renderer selection', exact: true }).click();
    await expect(page.locator('[data-tree-label-refs]')).toHaveText('false:false');
    await expect(page.locator('[data-tree-label-head]')).toHaveCount(0);
    await page.getByRole('button', { name: 'Toggle returned labels', exact: true }).click();
    const returned = page.locator('[data-tree-label-batch]');
    await expect(returned.locator('[data-render-label]')).toHaveAttribute('data-render-context', 'callback');
    await expect(returned.locator('[data-render-label]')).toContainText('Old|callback|Alphabet');
    await returned.getByRole('button', { name: 'Count 0', exact: true }).click();
    await expect(returned.getByRole('button', { name: 'Count 1', exact: true })).toBeVisible();
    await expect(page.locator('[data-tree-label-head="callback:0"]')).toHaveCount(1);
    await expect.poll(lifecycle).toEqual(['mount:header:0', 'mount:header:1', 'destroy:header:1',
      'destroy:header:0', 'mount:callback:0']);
    await page.getByRole('button', { name: 'Toggle returned labels', exact: true }).click();
    await expect(page.locator('[data-tree-label-head]')).toHaveCount(0);
    await expect.poll(async () => (await lifecycle()).at(-1)).toBe('destroy:callback:0');
  });
}
