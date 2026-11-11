import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-form-feedback-control-reference.json' with { type: 'json' };
import { feedbackControlSamples } from './fixtures/form-feedback-control-cases';
import type { FeedbackAction } from './fixtures/form-feedback-cases';
import { readFormFeedbackControl } from './form-feedback-control-metrics';

async function mount(page: Page, id: string) {
  await page.goto('/?fixture=form-feedback-control');
  await page.getByRole('combobox', { name: 'Form feedback control sample', exact: true }).selectOption(id);
  if (id === 'input-mentions-popup') {
    await page.getByLabel('Feedback mentions trigger', { exact: true }).pressSequentially('@a');
  }
  await expect(page.locator('[data-feedback-control] input:not([type="hidden"]), [data-feedback-control] textarea').first()).toBeVisible();
  await page.mouse.move(0, 0);
}
async function apply(page: Page, action: FeedbackAction, index: number) {
  if (action === 'focus') await page.getByLabel('Feedback field', { exact: true }).focus();
  else if (action === 'outside') await page.getByRole('button', { name: 'Outside feedback', exact: true }).click();
  else if (action === 'clear') await page.locator('[data-feedback-control]').getByRole('button').first().click();
  else {
    await page.getByRole('combobox', { name: 'Feedback action', exact: true }).selectOption(String(index));
    await page.getByRole('button', { name: 'Apply feedback action', exact: true }).dispatchEvent('click');
  }
}
for (const entry of reference.cases) {
  test(`Form feedback consumers match Source for ${entry.id}`, async ({ page }) => {
    await mount(page, entry.id);
    const read = () => page.evaluate(readFormFeedbackControl);
    await expect.poll(read).toEqual(entry.initial);
    let previous = entry.steps.length ? await page.getByLabel('Feedback field', { exact: true }).elementHandle() : null;
    for (const [index, step] of entry.steps.entries()) {
      await apply(page, step.action as FeedbackAction, index);
      // SpaceCompact retains its existing focus recovery after a child is replaced.
      // The raw Source capture keeps focus=false for these InputSearch transitions.
      const expected = entry.id === 'search-live' && step.action === 'toggle-feedback'
        ? { ...step.view, focused: true } : step.view;
      await expect.poll(read, { message: step.action }).toEqual(expected);
      const editor = page.getByLabel('Feedback field', { exact: true });
      expect(await editor.evaluate((node, original) => node === original, previous), step.action).toBe(step.sameInput);
      previous = await editor.elementHandle();
    }
  });
}
for (const control of ['input', 'textarea', 'number', 'select', 'password', 'search']) {
  test(`Form feedback keeps the ${control} editor while its icon and status change`, async ({ page }) => {
    const id = `${control}-${control === 'password' || control === 'search' ? 'live' : 'live-feedback'}`;
    await mount(page, id);
    const editor = page.getByLabel('Feedback field', { exact: true });
    const original = await editor.elementHandle();
    const sample = feedbackControlSamples.find(sample => sample.id === id)!;
    // Input/TextArea may change their root when hasFeedback changes, as in Source.
    for (const [index, action] of sample.actions!.entries()) {
      if (action === 'toggle-feedback') break;
      await apply(page, action, index);
      expect(await editor.evaluate((node, previous) => node === previous, original)).toBe(true);
      await expect(editor).toBeFocused();
    }
  });
}
