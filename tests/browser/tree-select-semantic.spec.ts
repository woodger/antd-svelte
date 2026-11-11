import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-tree-select-semantic-reference.json' with { type: 'json' };
import type { TreeSelectSemanticAction } from './fixtures/tree-select-semantic-cases';
import { readTreeSelectSemantics } from './tree-select-semantic-metrics';

const editor = (page: Page) => page.getByRole('combobox', { name: 'Semantic selection', exact: true });
const draft = (page: Page) => page.getByRole('textbox', { name: 'Semantic draft', exact: true });
const popup = (page: Page) => page.locator('[data-semantic-target] [popover]');

async function mount(page: Page, id: string) {
  await page.goto('/?fixture=tree-select-semantic');
  await page.getByLabel('Semantic sample').selectOption(id);
}

async function act(page: Page, action: TreeSelectSemanticAction) {
  if (action === 'open') await editor(page).click();
  else if (action === 'search' || action === 'reset-search') await editor(page).fill(action === 'search' ? 'alpha' : '');
  else if (action === 'expand' || action === 'collapse' || action === 'load') {
    const name = action === 'load' ? 'Lazy' : 'Parent';
    await popup(page).getByRole('treeitem', { name, exact: true }).locator('[data-ant-tree-switcher]').click();
  } else if (action === 'finish-load') await page.getByRole('button', { name: 'Finish semantic load' }).dispatchEvent('click');
  else if (action === 'draft') await draft(page).fill('Keep semantic draft');
  else if (action === 'update') await page.getByRole('button', { name: 'Update semantic styles' }).dispatchEvent('click');
  else if (action === 'outside') await page.getByRole('button', { name: 'Outside semantic selection' }).click();
}

for (const entry of reference.cases) {
  test(`TreeSelect follows Source semantics for ${entry.id}`, async ({ page }) => {
    await mount(page, entry.id);
    const read = () => page.evaluate(readTreeSelectSemantics);
    await expect.poll(read).toEqual(entry.initial);
    const initialPopup = entry.id === 'popup-live' ? await popup(page).elementHandle() : undefined;
    const initialDraft = entry.id === 'popup-live' ? await draft(page).elementHandle() : undefined;
    for (const { action, view } of entry.steps) {
      await act(page, action as TreeSelectSemanticAction);
      await expect.poll(read, { message: action }).toEqual(view);
      if (entry.id === 'popup-live' && action === 'update') {
        expect(await popup(page).evaluate((node, initial) => node === initial, initialPopup)).toBe(true);
        expect(await draft(page).evaluate((node, initial) => node === initial, initialDraft)).toBe(true);
        await expect(draft(page)).toBeFocused();
      }
    }
    if (entry.id === 'single-empty') await expect(editor(page)).toHaveAttribute('placeholder', 'Choose node');
  });
}
