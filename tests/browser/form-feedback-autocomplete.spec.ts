import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-form-feedback-autocomplete-reference.json' with { type: 'json' };
import clearReference from './fixtures/ant-design-form-feedback-autocomplete-clear-reference.json' with { type: 'json' };
import type { FeedbackAction } from './fixtures/form-feedback-cases';
import { feedbackAutoCompleteSamples } from './fixtures/form-feedback-autocomplete-cases';
import { readFormFeedbackAutoComplete } from './form-feedback-autocomplete-metrics';

async function mount(page: Page, id: string) {
  await page.goto('/?fixture=form-feedback-autocomplete');
  await page.getByRole('combobox', { name: 'Form feedback completion sample', exact: true }).selectOption(id);
  await expect(page.locator('[data-feedback-refs]')).toHaveAttribute('data-feedback-refs', 'true');
  await page.mouse.move(0, 0);
}
async function apply(page: Page, action: FeedbackAction, index: number) {
  const input = page.getByRole('combobox', { name: 'Feedback completion', exact: true });
  if (action === 'focus') await input.focus();
  else if (action === 'open') await input.click();
  else if (action === 'search') await input.fill('Beta');
  else if (action === 'outside') await page.getByRole('button', { name: 'Outside feedback', exact: true }).click();
  else if (action === 'clear') await page.locator('[data-feedback-autocomplete-control]').getByRole('button').first().click();
  else {
    await page.getByRole('combobox', { name: 'Feedback action', exact: true }).selectOption(String(index));
    await page.getByRole('button', { name: 'Apply feedback action', exact: true }).dispatchEvent('click');
  }
}
for (const entry of reference.cases) {
  test(`AutoComplete Form feedback matches Source for ${entry.id}`, async ({ page }) => {
    await mount(page, entry.id);
    const read = () => page.evaluate(readFormFeedbackAutoComplete);
    await expect.poll(read).toEqual(entry.initial);
    const input = page.getByRole('combobox', { name: 'Feedback completion', exact: true });
    let previous = await input.elementHandle();
    for (const [index, step] of entry.steps.entries()) {
      await apply(page, step.action as FeedbackAction, index);
      await expect.poll(read, { message: step.action }).toEqual(step.view);
      expect(await input.evaluate((node, original) => node === original, previous), step.action).toBe(step.sameInput);
      previous = await input.elementHandle();
    }
  });
}
test('AutoComplete preserves focused editors during feedback content and status updates', async ({ page }) => {
  for (const id of ['live-feedback', 'input-live', 'textarea-live']) {
    await mount(page, id);
    const input = page.getByRole('combobox', { name: 'Feedback completion', exact: true });
    const original = await input.elementHandle();
    const sample = feedbackAutoCompleteSamples.find(sample => sample.id === id)!;
    for (const [index, action] of sample.actions!.entries()) {
      if (action === 'toggle-feedback') break;
      await apply(page, action, index);
      expect(await input.evaluate((node, old) => node === old, original)).toBe(true);
      await expect(input).toBeFocused();
    }
  }
});
test('AutoComplete clears both refs and ignores pending feedback completion after unmount', async ({ page }) => {
  await mount(page, 'async-success');
  await apply(page, 'validate', 0);
  await expect(page.locator('[data-form-status-read="control"]')).toContainText('validating');
  await page.getByRole('button', { name: 'Unmount feedback', exact: true }).dispatchEvent('click');
  await expect(page.locator('[data-feedback-refs]')).toHaveAttribute('data-feedback-refs', 'false');
  await apply(page, 'resolve', 1);
  await expect(page.getByRole('combobox', { name: 'Feedback completion', exact: true })).toHaveCount(0);
  await expect(page.locator('[class*="-item-feedback-icon"]')).toHaveCount(0);
});
for (const source of clearReference.cases) {
  test(`AutoComplete preserves Source clear callback order for ${source.mode}`, async ({ page }) => {
    await mount(page, source.mode === 'pointer-controlled' ? 'clear-controlled' : 'clear');
    await apply(page, 'focus', 0);
    await apply(page, 'open', 1);
    if (source.mode.startsWith('pointer')) await apply(page, 'clear', 2);
    else await page.locator('[data-feedback-autocomplete-control]').getByRole('button').dispatchEvent('click');
    await expect(page.locator('[data-feedback-completion-events]')).toHaveText(JSON.stringify(source.events));
    const input = page.getByRole('combobox', { name: 'Feedback completion', exact: true });
    await expect(input).toHaveAttribute('aria-expanded', source.open);
    await expect(input).toHaveValue(source.value);
  });
}
