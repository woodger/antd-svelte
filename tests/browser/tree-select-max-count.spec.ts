import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-tree-select-max-count-reference.json' with { type: 'json' };
import type { TreeSelectMaxCountAction, TreeSelectMaxCountSample } from './fixtures/tree-select-max-count-cases';
import { readTreeSelectData } from './tree-select-data-metrics';

const input = (page: Page) => page.getByRole('combobox', { name: 'Limited tree selection', exact: true });
const root = (page: Page) => page.locator('.ant-select-dropdown [role="treeitem"][id$="-0"]');
const events = async (page: Page) => JSON.parse(
  await page.locator('[data-tree-select-max-count-events]').innerText()
);
const read = async (page: Page) => ({
  view: await page.evaluate(readTreeSelectData, { treePrefix: 'ant-tree' }),
  events: await events(page)
});
const integrity = (page: Page) => page.locator('[data-tree-select-max-count-integrity]');

async function mount(page: Page, id: string) {
  await page.goto('/?fixture=tree-select-max-count');
  const index = [...reference.cases, ...reference.observations]
    .findIndex(entry => entry.sample.id === id);
  await page.getByLabel('TreeSelect limit case').selectOption(String(index));
}

async function perform(page: Page, action: TreeSelectMaxCountAction, sample: TreeSelectMaxCountSample) {
  if (action.kind === 'open') await input(page).click();
  else if (action.kind === 'choose' || action.kind === 'title') {
    const row = page.locator(`.ant-select-dropdown [role="treeitem"][id$="-${action.value}"]`);
    const selector = action.kind !== 'title' && (sample.checkable || sample.strict)
      ? '[data-ant-tree-checkbox]' : '[data-ant-tree-content]';
    // Оба controls проверяют запрет; физический клик по disabled строке не выбирает её.
    await row.locator(selector).click({ force: true });
  } else if (action.kind === 'search') await input(page).fill(action.value);
  else if (action.kind === 'key') await input(page).press(action.value);
  else if (action.kind === 'remove') {
    await page.getByRole('button', { name: `Удалить ${action.label}`, exact: true }).click();
  } else if (action.kind === 'clear') {
    await page.getByRole('button', { name: 'Очистить', exact: true }).click();
  } else {
    await page.getByRole('button', { name: action.kind === 'limit'
      ? 'Update selection limit' : 'Update limited data', exact: true }).dispatchEvent('click');
  }
}

for (const entry of reference.cases) {
  test(`TreeSelect maxCount matches Source for ${entry.sample.id}`, async ({ page }) => {
    await mount(page, entry.sample.id);
    await expect.poll(() => read(page)).toEqual(entry.initial);
    for (const step of entry.steps) {
      await perform(page, step.action as TreeSelectMaxCountAction,
        entry.sample as TreeSelectMaxCountSample);
      await expect.poll(() => read(page), { message: JSON.stringify(step.action) })
        .toEqual({ view: step.view, events: step.events });
      await expect(integrity(page)).toHaveText('{"payloadShared":true,"inputMutated":false}');
    }
  });
}

test('TreeSelect maxCount leaves single mode selectable like its public Source counterpart', async ({ page }) => {
  const observation = reference.observations.find(entry => entry.sample.id === 'single')!;
  const counterpart = reference.cases.find(entry => entry.sample.id === 'single-unlimited')!;
  expect(observation.steps[0].view.nodes.find(node => node.value === '2')!.disabled).toBe(true);
  await mount(page, observation.sample.id);
  await input(page).click();

  await expect.poll(() => read(page))
    .toEqual({ view: counterpart.steps[0].view, events: counterpart.steps[0].events });
  await page.getByRole('treeitem', { name: 'Beta', exact: true })
    .locator('[data-ant-tree-content]').click();
  await expect.poll(() => read(page))
    .toEqual({ view: counterpart.steps[1].view, events: counterpart.steps[1].events });
  await expect(integrity(page)).toHaveText('{"payloadShared":true,"inputMutated":false}');
});

test('TreeSelect refreshes disabled parents for new children while preserving raw payload and DOM', async ({ page }) => {
  const observation = reference.observations.find(entry => entry.sample.id === 'grow')!;
  const counterpart = reference.cases.find(entry => entry.sample.id === 'fresh-wide')!;
  expect(observation.steps[1].view.nodes.find(node => node.value === '0')!.disabled).toBe(false);
  await mount(page, observation.sample.id);
  await input(page).click();
  const row = await root(page).elementHandle();
  const editor = await input(page).elementHandle();
  await page.getByRole('button', { name: 'Update limited data', exact: true }).dispatchEvent('click');

  await expect.poll(() => read(page))
    .toEqual({ view: counterpart.steps[0].view, events: counterpart.steps[0].events });
  expect(await row!.evaluate(node => node.isConnected)).toBe(true);
  expect(await editor!.evaluate(node => node.isConnected)).toBe(true);
  await expect(input(page)).toBeFocused();
  await root(page).locator('[data-ant-tree-checkbox]').click({ force: true });
  expect(await events(page)).toEqual([]);
  await expect(integrity(page)).toHaveText('{"payloadShared":true,"inputMutated":false}');
});

test('TreeSelect limit updates retain refs, active IDs, search selection, form values and outside draft', async ({ page }) => {
  await mount(page, 'increase');
  const outside = page.getByRole('textbox', { name: 'Limited selection outside draft' });
  await outside.fill('Keep draft');
  await input(page).fill('Alpha');
  await expect(page.getByRole('treeitem', { name: 'Alpha', exact: true })).toBeVisible();
  const editor = await input(page).elementHandle();
  const wrapper = await page.locator('[data-ant-tree-choice-control]').elementHandle();
  const row = await root(page).elementHandle();
  const active = await input(page).getAttribute('aria-activedescendant');
  expect(active).toBeTruthy();
  await input(page).evaluate((node: HTMLInputElement) => node.setSelectionRange(1, 4, 'backward'));
  await page.getByRole('button', { name: 'Update selection limit', exact: true }).dispatchEvent('click');

  for (const handle of [editor, wrapper, row]) expect(await handle!.evaluate(node => node.isConnected)).toBe(true);
  await expect(input(page)).toBeFocused();
  await expect(input(page)).toHaveValue('Alpha');
  expect(await input(page).evaluate((node: HTMLInputElement) =>
    [node.selectionStart, node.selectionEnd, node.selectionDirection]))
    .toEqual([1, 4, 'backward']);
  await expect(input(page)).toHaveAttribute('aria-activedescendant', active!);
  await expect(page.locator(`[id="${active}"]`)).toHaveCount(1);
  await expect(page.locator('[data-tree-select-max-count-refs]')).toHaveText('true:true');
  expect(await page.locator('[data-tree-select-max-count-form]').evaluate((form: HTMLFormElement) =>
    new FormData(form).getAll('limited'))).toEqual(['1']);
  await expect(outside).toHaveValue('Keep draft');
  expect(await events(page)).toEqual([]);
});

test('TreeSelect blocks a capped active option and permits it after native tag removal', async ({ page }) => {
  await mount(page, 'keyboard-at-limit');
  await input(page).click();
  await input(page).press('ArrowDown');
  await input(page).press('ArrowDown');
  const beta = page.getByRole('treeitem', { name: 'Beta', exact: true });
  await expect(input(page)).toHaveAttribute('aria-activedescendant', (await beta.getAttribute('id'))!);
  await input(page).press('Enter');

  expect(await events(page)).toEqual([]);
  await input(page).press('Backspace');
  await input(page).press('Enter');
  expect((await events(page)).at(-1)).toMatchObject({ kind: 'select', value: 2,
    node: { disabled: null, payload: { id: 'n2' } } });
  await expect(page.locator('.ant-select-selection-item-content')).toHaveText('Beta');
  await expect(input(page)).toBeFocused();
  await expect(integrity(page)).toHaveText('{"payloadShared":true,"inputMutated":false}');
});
