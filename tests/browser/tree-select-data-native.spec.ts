import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-tree-select-data-reference.json' with { type: 'json' };
import { readTreeSelectData } from './tree-select-data-metrics';

async function mount(page: Page, id: string) {
  await page.goto('/?fixture=tree-select-data');
  await page.getByLabel('TreeSelect data case').selectOption(id);
}
const control = (page: Page) => page.getByRole('combobox', { name: 'Data selection' });
const meta = async (page: Page) => JSON.parse(await page.locator('[data-tree-select-data-meta]').innerText());
const events = async (page: Page) => JSON.parse(await page.locator('[data-tree-select-data-events]').innerText());

test('TreeSelect simple mode keeps its input children array while preserving Source hierarchy', async ({ page }) => {
  const observation = reference.observations.find(sample => sample.id === 'simple-input-mutation')!;
  expect(observation.initial.inputMutated).toBe(true);
  await mount(page, observation.id);
  await control(page).click();

  await expect.poll(() => page.evaluate(readTreeSelectData, { treePrefix: 'ant-tree' }))
    .toEqual(observation.steps[0].view);
  expect((await meta(page)).inputMutated).toBe(false);
});

test('TreeSelect raw renderer receives original payload instead of a labeled value', async ({ page }) => {
  const observation = reference.observations.find(sample => sample.id === 'raw-renderer-data')!;
  expect(observation.initial.rendererData).toBe(false);
  await mount(page, observation.id);
  await expect(page.locator('.single-snippet')).toHaveText('41:Alpha');
  await control(page).click();

  await expect.poll(() => page.evaluate(readTreeSelectData, { treePrefix: 'ant-tree' }))
    .toEqual(observation.steps[0].view);
  expect((await meta(page)).rendererData).toBe(true);
});

test('TreeSelect keeps native refs and active row identity while its schema updates', async ({ page }) => {
  await mount(page, 'schema-update');
  await control(page).click();
  const input = await control(page).elementHandle();
  const root = await page.locator('[data-ant-tree-choice-control]').elementHandle();
  const row = await page.getByRole('treeitem', { name: 'Alpha', exact: true }).elementHandle();
  await page.getByRole('button', { name: 'Update schema', exact: true }).dispatchEvent('click');

  expect(await input!.evaluate(node => node.isConnected)).toBe(true);
  expect(await root!.evaluate(node => node.isConnected)).toBe(true);
  expect(await row!.evaluate(node => node.isConnected)).toBe(true);
  await expect(control(page)).toBeFocused();
  const active = await control(page).getAttribute('aria-activedescendant');
  expect(active).toBe(await row!.getAttribute('id'));
  await control(page).press('ArrowDown');
  await control(page).press('Enter');
  expect((await events(page)).at(-1)).toMatchObject({ type: 'select', value: 2 });
});

test('TreeSelect alias selection submits native raw values and retains an outside draft', async ({ page }) => {
  await page.goto('/?fixture=tree-select-data-generic');
  const input = page.getByRole('combobox', { name: 'Generic data', exact: true });
  await input.click();
  await page.getByRole('tree', { name: 'Generic data', exact: true })
    .getByRole('treeitem', { name: '2:Beta', exact: true })
    .locator('[data-ant-tree-content]').click();

  expect(JSON.parse(await page.locator('[data-tree-select-generic-events]').innerText()))
    .toEqual([{ value: 2, owner: 'beta', raw: 'raw', originalState: 'payload', shared: true,
      payload: { kind: 'leaf', rank: 2 } }]);
  await expect(page.locator('input[type="hidden"][name="generic"]')).toHaveValue('2');
  await expect(page.locator('.single-snippet')).toHaveText('2:Beta');
  const draft = page.getByRole('textbox', { name: 'Outside data draft' });
  await draft.fill('retained');
  await page.getByRole('button', { name: 'Refresh data schema', exact: true }).dispatchEvent('click');
  await expect(draft).toHaveValue('retained');
  await expect(draft).toBeFocused();
  await expect(page.locator('[data-tree-select-generic-refs]')).toHaveText('true:true');
});

test('TreeSelect generic renderer updates selected labels from a new data reference', async ({ page }) => {
  await page.goto('/?fixture=tree-select-data-generic');
  await expect(page.locator('.single-snippet')).toHaveText('1:Alpha');
  await page.getByRole('button', { name: 'Update generic labels', exact: true }).dispatchEvent('click');

  await expect(page.locator('.single-snippet')).toHaveText('1:Alpha updated');
});

test('TreeSelect lazy aliases expose canonical state and original user props without normalized fields', async ({ page }) => {
  await page.goto('/?fixture=tree-select-data-generic');
  const input = page.getByRole('combobox', { name: 'Generic lazy data', exact: true });
  await input.click();
  await input.press('ArrowRight');

  expect(JSON.parse(await page.locator('[data-tree-select-generic-loads]').innerText())).toEqual([
    { key: 0, canonical: false, owner: 'parent', raw: 'raw', payload: { kind: 'branch', total: 2 },
      shared: true, titlePresent: false }
  ]);
  await page.getByRole('button', { name: 'Resolve generic load', exact: true }).dispatchEvent('click');
  await expect(page.locator('[data-tree-select-generic-completed]')).toHaveText('1');
  await expect(page.getByRole('tree', { name: 'Generic lazy data', exact: true })
    .getByRole('treeitem', { name: 'Alpha', exact: true })).toBeVisible();
  await expect(input).toBeFocused();
});

test('TreeSelect ignores a deferred alias load completion after its control unmounts', async ({ page }) => {
  await page.clock.install();
  await page.goto('/?fixture=tree-select-data-generic');
  const input = page.getByRole('combobox', { name: 'Generic lazy data', exact: true });
  await input.click();
  await input.press('ArrowRight');
  await page.getByRole('button', { name: 'Unmount generic load', exact: true }).dispatchEvent('click');
  await page.getByRole('button', { name: 'Resolve generic load', exact: true }).dispatchEvent('click');
  await page.clock.runFor(1500);

  await expect(input).toHaveCount(0);
  await expect(page.locator('[data-tree-select-generic-completed]')).toHaveText('0');
});
