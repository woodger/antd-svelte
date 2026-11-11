import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-tree-select-token-reference.json' with { type: 'json' };
import type { TreeSelectTokenAction } from './fixtures/tree-select-token-cases';
import { readTreeSelectTokens } from './tree-select-token-metrics';

async function act(page: Page, action: TreeSelectTokenAction) {
  const input = page.getByRole('combobox', { name: 'Token tree', exact: true });
  if (action.type === 'open') await input.click();
  else if (action.type === 'focus') await input.focus();
  else if (action.type === 'fill') await input.fill(action.text!);
  else if (action.type === 'outside') await page.getByRole('button', { name: 'Outside token tree', exact: true }).click();
  else if (action.type === 'composition-start') await input.dispatchEvent('compositionstart', { data: '' });
  else if (action.type === 'composition-end') await input.dispatchEvent('compositionend', { data: '' });
  else if (action.type === 'paste') await input.evaluate((node, text) => {
    const data = new DataTransfer();
    data.setData('text', text!);
    node.dispatchEvent(new ClipboardEvent('paste', { clipboardData: data, bubbles: true }));
  }, action.text);
}
for (const entry of reference.cases) {
  test(`TreeSelect token search follows Source for ${entry.id}`, async ({ page }) => {
    await page.goto('/?fixture=tree-select-token');
    await page.getByRole('combobox', { name: 'TreeSelect token sample', exact: true }).selectOption(entry.id);
    await expect(page.locator('[data-tree-select-token-refs]')).toHaveAttribute('data-tree-select-token-refs', 'true');
    const read = () => page.evaluate(readTreeSelectTokens);
    // Native closed single controls display the selected label; Source uses an
    // overlay plus its fixed query input. The owner still retains "Alpha".
    const closedQueryBoundary = entry.id === 'initial-open-close-on-search';
    if (closedQueryBoundary) expect(entry.initial.search).toBe('Alpha');
    await expect.poll(read).toEqual(closedQueryBoundary ? { ...entry.initial, search: '' } : entry.initial);
    const input = page.getByRole('combobox', { name: 'Token tree', exact: true });
    const original = await input.elementHandle();
    for (const step of entry.steps) {
      await act(page, step.action as TreeSelectTokenAction);
      await expect.poll(read, { message: step.action.type }).toEqual(step.view);
      expect(await input.evaluate((node, old) => node === old, original)).toBe(step.sameInput);
    }
  });
}

async function lifecycle(page: Page) {
  await page.goto('/?fixture=tree-select-token');
  await page.getByRole('combobox', { name: 'TreeSelect token sample', exact: true }).selectOption('native-lifecycle');
  await expect(page.locator('[data-token-lifecycle-refs]')).toHaveAttribute('data-token-lifecycle-refs', 'true');
}

test('TreeSelect token processing preserves native paste and composition callbacks', async ({ page }) => {
  await lifecycle(page);
  const input = page.getByRole('combobox', { name: 'Token lifecycle', exact: true });
  await input.click();
  await input.evaluate(node => {
    const data = new DataTransfer();
    data.setData('text', 'Alpha,Beta');
    node.dispatchEvent(new ClipboardEvent('paste', { clipboardData: data, bubbles: true }));
  });
  await input.dispatchEvent('compositionstart', { data: '' });
  await input.fill('Alpha,Beta');
  await expect(input).toHaveAttribute('aria-expanded', 'true');
  await input.dispatchEvent('compositionend', { data: '' });
  await expect(input).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('[data-token-native-events]')).toHaveText(JSON.stringify([
    ['paste', 'INPUT', 'Alpha,Beta'], ['compositionstart', 'INPUT', null], ['compositionend', 'INPUT', null]
  ]));
});

test('TreeSelect single cleanup tracks raw open changes without rerunning for search, mode or splitter props', async ({ page }) => {
  await lifecycle(page);
  const splits = page.locator('[data-token-splits]');
  await expect(splits).toHaveText('[["original",""]]');
  await page.getByRole('button', { name: 'Update token search', exact: true }).click();
  await page.getByRole('button', { name: 'Toggle token mode', exact: true }).click();
  await page.getByRole('button', { name: 'Replace token splitter', exact: true }).click();
  await page.getByRole('button', { name: 'Toggle token mode', exact: true }).click();
  await expect(splits).toHaveText('[["original",""]]');
  await page.getByRole('combobox', { name: 'Token lifecycle', exact: true }).click();
  await page.getByRole('button', { name: 'Outside token lifecycle', exact: true }).click();
  await expect(splits).toHaveText('[["original",""],["alternate",""]]');
});

test('TreeSelect reset and unmount cancel a pending split close and release the replaced refs', async ({ page }) => {
  await lifecycle(page);
  const input = page.getByRole('combobox', { name: 'Token lifecycle', exact: true });
  const original = await input.elementHandle();
  await page.getByRole('button', { name: 'Set token selection', exact: true }).click();
  await expect(page.locator('[data-token-model]')).toHaveText('"a"');
  async function splitAndClick(selector: string) {
    await input.click();
    await input.evaluate((node, selector) => {
      (node as HTMLInputElement).value = 'Alpha,Beta';
      node.dispatchEvent(new Event('input', { bubbles: true }));
      document.querySelector<HTMLButtonElement>(selector)!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }, selector);
    await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  }
  await splitAndClick('[data-token-reset]');
  await expect(page.locator('[data-token-lifecycle-refs]')).toHaveAttribute('data-token-lifecycle-refs', 'true');
  expect(await input.evaluate((node, old) => node === old, original)).toBe(false);
  await expect(page.locator('[data-token-model]')).toHaveText('null');
  await expect(page.locator('[data-token-lifecycle-events]')).toHaveText('[["open",true]]');
  await splitAndClick('[data-token-unmount]');
  await expect(page.locator('[data-token-lifecycle-refs]')).toHaveAttribute('data-token-lifecycle-refs', 'false');
  await expect(input).toHaveCount(0);
  await expect(page.locator('[popover]')).toHaveCount(0);
  await expect(page.locator('[data-token-lifecycle-events]')).toHaveText('[["open",true],["open",true]]');
});
