import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-form-feedback-picker-reference.json' with { type: 'json' };
import { feedbackPickerSamples, type FeedbackPickerAction } from './fixtures/form-feedback-picker-cases';
import { readFormFeedbackPicker } from './form-feedback-picker-metrics';

async function mount(page: Page, id: string) {
  await page.goto('/?fixture=form-feedback-picker');
  await page.getByRole('combobox', { name: 'Form feedback picker sample', exact: true }).selectOption(id);
  await expect(page.locator('[data-feedback-refs]')).toHaveAttribute('data-feedback-refs', 'true');
  await page.mouse.move(0, 0);
}
async function apply(page: Page, action: FeedbackPickerAction, index: number) {
  if (action === 'focus') await page.locator('[data-feedback-picker-control] input').first().focus();
  else if (action === 'outside') await page.getByRole('button', { name: 'Outside feedback', exact: true }).click();
  else {
    await page.getByRole('combobox', { name: 'Feedback action', exact: true }).selectOption(String(index));
    await page.getByRole('button', { name: 'Apply feedback action', exact: true }).dispatchEvent('click');
  }
}
for (const entry of reference.cases) {
  test(`Form feedback pickers follow Source for ${entry.id}`, async ({ page }) => {
    await mount(page, entry.id);
    const read = () => page.evaluate(readFormFeedbackPicker);
    await expect.poll(read).toEqual(entry.initial);
    const input = page.locator('[data-feedback-picker-control] input').first();
    let previous = await input.elementHandle();
    for (const [index, step] of entry.steps.entries()) {
      await apply(page, step.action as FeedbackPickerAction, index);
      await expect.poll(read, { message: step.action }).toEqual(step.view);
      expect(await input.evaluate((node, old) => node === old, previous), step.action).toBe(step.sameInput);
      previous = await input.elementHandle();
    }
  });
}
for (const picker of ['date', 'range', 'time', 'time-range']) {
  test(`Form feedback keeps ${picker} refs and disposes a pending validation on unmount`, async ({ page }) => {
    await mount(page, `${picker}-async`);
    await apply(page, 'validate', 0);
    await expect(page.locator('[data-form-status-read="control"]')).toContainText('validating');
    await page.getByRole('button', { name: 'Unmount feedback', exact: true }).click();
    await expect(page.locator('[data-feedback-refs]')).toHaveAttribute('data-feedback-refs', 'false');
    await apply(page, 'resolve', 1);
    await expect(page.locator('[data-feedback-picker-control] input')).toHaveCount(0);
    await expect(page.locator('[class*="-item-feedback-icon"]')).toHaveCount(0);
    await expect(page.locator('[popover]')).toHaveCount(0);
  });
}

test('Form feedback capture covers each picker, live updates and supported time suffix overrides', () => {
  expect(reference.cases.map(entry => entry.id)).toEqual(feedbackPickerSamples.map(sample => sample.id));
  for (const picker of ['date', 'range', 'time', 'time-range']) {
    expect(reference.cases.find(entry => entry.id === `${picker}-error`)!.initial.root).toEqual(['has-feedback', 'status-error']);
  }
});
