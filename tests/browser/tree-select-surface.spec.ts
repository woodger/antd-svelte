import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-tree-select-surface-reference.json' with { type: 'json' };
import type { TreeSelectSurfaceAction } from './fixtures/tree-select-surface-cases';
import { readTreeSelectSurface } from './tree-select-surface-metrics';

const editor = (page: Page) => page.getByRole('combobox', { name: 'Surface selection', exact: true });
const draft = (page: Page) => page.getByRole('textbox', { name: 'Popup draft', exact: true });

async function mount(page: Page, id: string) {
  await page.goto('/?fixture=tree-select-surface');
  await page.getByLabel('Surface sample').selectOption(id);
}

async function act(page: Page, action: TreeSelectSurfaceAction) {
  const prefix = await page.locator('[data-tree-select-surface]').getAttribute('data-surface-prefix');
  const clear = page.locator(`[class~="${prefix}-clear"]`);
  if (action === 'focus') await editor(page).focus();
  else if (action === 'open') await editor(page).click();
  else if (action === 'outside') await page.getByRole('button', { name: 'Outside selection' }).click();
  else if (action === 'search' || action === 'reset-search') await editor(page).fill(action === 'search' ? 'b' : '');
  else if (action === 'remove') await page.locator('.ant-select-selection-item-remove').first().click();
  else if (action === 'clear') await clear.click();
  else if (action === 'clear-key') await clear.press('Enter');
  else if (action === 'choose') await page.locator(`[class~="${prefix}-dropdown"]`).getByText('Beta', { exact: true }).click();
  else if (action === 'draft') await draft(page).fill('Keep popup draft');
  else if (action === 'popup-background') await page.locator('[data-surface-popup]').click({ position: { x: 3, y: 3 } });
  else if (action === 'enter' || action === 'escape') await editor(page).press(action === 'enter' ? 'Enter' : 'Escape');
  else if (action === 'toggle-menu') await page.getByRole('button', { name: 'Toggle menu' }).click();
}

for (const entry of reference.cases) {
  test(`TreeSelect renders Source control slots and popup for ${entry.id}`, async ({ page }) => {
    await mount(page, entry.id);
    const read = () => page.evaluate(readTreeSelectSurface);
    await expect.poll(read).toEqual(entry.initial);
    for (const { action, view } of entry.steps) {
      await act(page, action as TreeSelectSurfaceAction);
      if (entry.id === 'popup-empty' && action === 'escape') {
        expect(view.open).toBe(true);
        await expect.poll(read).toEqual({ ...view, open: false,
          popup: { ...view.popup, visible: false }, events: [...view.events, ['open', false]] });
      } else {
        await expect.poll(read, { message: action }).toEqual(view);
      }
      if (entry.id === 'popup-replace' && view.open) {
        const originMounted = view.popup?.tree ?? false;
        await expect.poll(() => editor(page).evaluate(input => {
          const references = ['aria-controls', 'aria-activedescendant'];
          return references.map(attribute => {
            const id = input.getAttribute(attribute);
            return id ? Boolean(input.ownerDocument.getElementById(id)) : null;
          });
        })).toEqual(originMounted ? [true, true] : [null, null]);
      }
    }
    await page.getByRole('button', { name: 'Unmount selection' }).dispatchEvent('click');
    await expect(page.locator('[data-surface-lifecycle]')).toHaveText(JSON.stringify(entry.unmount));
    await expect(page.locator('[data-surface-target] [popover]')).toHaveCount(0);
  });
}

test('TreeSelect custom popup isolates the FormItem and keeps an interactive portalled draft', async ({ page }) => {
  await mount(page, 'popup-wrap');
  await expect(editor(page)).toHaveAttribute('aria-invalid', 'true');
  await editor(page).click();
  await draft(page).click();
  await expect(draft(page)).toBeFocused();
  await expect(draft(page)).not.toHaveAttribute('aria-invalid', /.+/);
  await expect(draft(page)).not.toHaveAttribute('name', /.+/);
  await expect(page.locator('[data-surface-popup]')).toHaveAttribute('data-surface-field-status', '');
  const originalDraft = await draft(page).elementHandle();
  expect(await draft(page).getAttribute('id')).not.toBe(await editor(page).getAttribute('id'));
  await draft(page).fill('Unsaved draft');
  await page.getByRole('button', { name: 'Outside selection' }).click();
  await expect(draft(page)).toHaveCount(0);
  await editor(page).click();
  await expect(draft(page)).toHaveValue('Unsaved draft');
  expect(await draft(page).evaluate((node, original) => node === original, originalDraft)).toBe(true);
  expect(await page.getByRole('form', { name: 'Surface form' }).evaluate((form: HTMLFormElement) =>
    new FormData(form).getAll('selection'))).toEqual(['a']);
  await draft(page).press('Escape');
  await expect(editor(page)).toBeFocused();
  await expect(editor(page)).toHaveAttribute('aria-expanded', 'false');
});
