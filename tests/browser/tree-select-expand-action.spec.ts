import type { Locator, Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-tree-select-expand-action-reference.json' with { type: 'json' };
import type { TreeSelectExpandActionSample } from './fixtures/TreeSelectExpandActionScope.svelte';
import { readTreeSelectData } from './tree-select-data-metrics';

const input = (page: Page) => page.getByRole('combobox', { name: 'Title expansion', exact: true });
const row = (page: Page) => page.locator('.ant-select-dropdown [role="treeitem"][id$="-0"]');
const content = (page: Page) => row(page).locator('[data-ant-tree-content]');
const events = async (page: Page) => JSON.parse(
  await page.locator('[data-tree-select-expand-events]').innerText()
);
const read = async (page: Page) => ({
  view: await page.evaluate(readTreeSelectData, { treePrefix: 'ant-tree' }),
  events: await events(page)
});

async function mount(page: Page, id: string) {
  await page.goto('/?fixture=tree-select-expand-action');
  const index = [...reference.cases, ...reference.observations]
    .findIndex(entry => entry.sample.id === id);
  await page.getByLabel('TreeSelect title case').selectOption(String(index));
}

async function perform(page: Page, sample: TreeSelectExpandActionSample) {
  const modifiers = sample.modifier ? [sample.modifier] as ('Control' | 'Meta' | 'Shift')[] : [];
  // Native ARIA disabled сохраняется; физический клик Source всё ещё раскрывает ветку.
  const options = { modifiers, force: Boolean(sample.disabledNode) };
  if (sample.action === 'click') await content(page).click(options);
  else if (sample.action === 'dblclick') await content(page).dblclick(options);
  else if (sample.action === 'double-event') await content(page).dispatchEvent('dblclick', {
    ctrlKey: sample.modifier === 'Control', metaKey: sample.modifier === 'Meta',
    shiftKey: sample.modifier === 'Shift'
  });
  else if (sample.action === 'switcher') await row(page).locator('[data-ant-tree-switcher]').click();
  else if (sample.action === 'checkbox') await row(page).locator('[data-ant-tree-checkbox]').click();
  else await input(page).press(sample.action);
}

for (const entry of reference.cases) {
  test(`TreeSelect title expansion matches Source for ${entry.sample.id}`, async ({ page }) => {
    await mount(page, entry.sample.id);
    await expect.poll(() => read(page)).toEqual(entry.initial);
    for (const step of entry.steps) {
      if (step.action === 'open') await input(page).click();
      else if (step.action === 'search') await input(page).fill(entry.sample.search!);
      else if (step.action === 'update') {
        await page.getByRole('button', { name: 'Enable title expansion', exact: true })
          .dispatchEvent('click');
      } else if (step.action === 'reveal') {
        await page.getByRole('button', { name: 'Resolve title load', exact: true })
          .dispatchEvent('click');
      } else await perform(page, entry.sample);
      await expect.poll(() => read(page), { message: step.action })
        .toEqual({ view: step.view, events: step.events });
    }
  });
}

async function rootIdentity(page: Page, control: Locator) {
  const editor = await control.elementHandle();
  const wrapper = await page.locator('[data-ant-tree-choice-control]').elementHandle();
  const root = await row(page).elementHandle();
  const id = await root!.getAttribute('id');
  const activeId = await control.getAttribute('aria-activedescendant');
  expect(activeId).toBeTruthy();
  return async () => {
    for (const handle of [editor, wrapper, root]) {
      expect(await handle!.evaluate(node => node.isConnected)).toBe(true);
    }
    expect(await root!.getAttribute('id')).toBe(id);
    await expect(control).toHaveAttribute('aria-activedescendant', activeId!);
    await expect(page.locator(`[id="${activeId}"]`)).toHaveCount(1);
    await expect(control).toBeFocused();
    await expect(page.locator('[data-tree-select-expand-refs]')).toHaveText('true:true');
  };
}

test('TreeSelect title expansion preserves refs, row IDs, editor focus and outside draft', async ({ page }) => {
  await mount(page, 'live-action');
  await page.getByRole('textbox', { name: 'Title expansion outside draft' }).fill('Keep draft');
  await input(page).click();
  const verifyIdentity = await rootIdentity(page, input(page));
  await page.getByRole('button', { name: 'Enable title expansion', exact: true }).dispatchEvent('click');
  await content(page).click();

  await expect(page.getByRole('treeitem', { name: 'Child', exact: true })).toBeVisible();
  await verifyIdentity();
  await expect(page.getByRole('textbox', { name: 'Title expansion outside draft' })).toHaveValue('Keep draft');
});

test('TreeSelect title expansion keeps a single pending load while matching Source hierarchy', async ({ page }) => {
  const observation = reference.observations[0];
  expect(observation.steps[1].events.filter(event => event.kind === 'load')).toHaveLength(2);
  await mount(page, observation.sample.id);
  await input(page).click();
  const verifyIdentity = await rootIdentity(page, input(page));
  await content(page).click();

  await expect.poll(() => events(page)).toEqual([
    { kind: 'open', open: true }, { kind: 'expand', keys: [0] },
    { kind: 'load', key: 0, expanded: false }
  ]);
  await page.getByRole('button', { name: 'Resolve title load', exact: true }).dispatchEvent('click');
  await expect.poll(async () => (await read(page)).view).toEqual(observation.steps[2].view);
  await expect.poll(() => events(page)).toEqual([
    { kind: 'open', open: true }, { kind: 'expand', keys: [0] },
    { kind: 'load', key: 0, expanded: false }, { kind: 'loaded', keys: [0] }
  ]);
  await verifyIdentity();
});

test('TreeSelect title load completion stays silent after unmount', async ({ page }) => {
  await page.clock.install();
  await mount(page, 'lazy-click');
  await input(page).click();
  await content(page).click();
  await expect.poll(() => events(page)).toHaveLength(3);
  await page.getByRole('button', { name: 'Unmount title control', exact: true }).dispatchEvent('click');
  await expect(input(page)).toHaveCount(0);
  await page.getByRole('button', { name: 'Resolve title load', exact: true }).dispatchEvent('click');
  await page.clock.runFor(1500);

  expect(await events(page)).toHaveLength(3);
  await expect(page.locator('[data-tree-select-expand-refs]')).toHaveText('false:false');
  await expect(page.locator('.ant-select-dropdown')).toHaveCount(0);
});
