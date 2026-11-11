import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-form-feedback-cascader-reference.json' with { type: 'json' };
import type { FeedbackAction } from './fixtures/form-feedback-cases';
import { feedbackCascaderSamples } from './fixtures/form-feedback-cascader-cases';
import { readFormFeedbackCascader } from './form-feedback-cascader-metrics';
const editor = (page: Page) => page.getByRole('combobox', { name: 'Feedback selection', exact: true });
async function mount(page: Page, id: string) {
  await page.goto('/?fixture=form-feedback-cascader');
  await page.getByRole('combobox', { name: 'Cascader feedback sample', exact: true }).selectOption(id);
  await expect(page.locator('[data-feedback-case]')).toHaveAttribute('data-feedback-case', id);
  if (id !== 'custom-trigger' && id !== 'standalone-panel') await expect(page.locator('[data-feedback-ref]')).toHaveAttribute('data-feedback-ref', 'true');
  await page.mouse.move(0, 0);
}
async function apply(page: Page, action: FeedbackAction, index: number) {
  if (action === 'focus') await editor(page).focus();
  else if (action === 'open') await editor(page).click();
  else if (action === 'outside') await page.getByRole('button', { name: 'Outside feedback', exact: true }).click();
  else if (action === 'hover') await page.locator('[data-feedback-control]').hover();
  else if (action === 'search') await editor(page).fill('Beta');
  else if (action === 'clear') await page.locator('[data-feedback-control] button').click();
  else if (action === 'choose-beta') await page.getByText('Beta', { exact: true }).last().click();
  else {
    await page.getByRole('combobox', { name: 'Feedback action', exact: true }).selectOption(String(index));
    await page.getByRole('button', { name: 'Apply feedback action', exact: true }).dispatchEvent('click');
  }
}
for (const entry of reference.cases) {
  test(`Cascader feedback follows Source for ${entry.id}`, async ({ page }) => {
    await mount(page, entry.id);
    const read = () => page.evaluate(readFormFeedbackCascader);
    await expect.poll(read).toEqual(entry.initial);
    for (const [index, step] of entry.steps.entries()) {
      await apply(page, step.action as FeedbackAction, index);
      await expect.poll(read, { message: step.action }).toEqual(step.view);
    }
  });
}

test('Cascader feedback updates status, icons and prefixes without replacing the focused Cascader input', async ({ page }) => {
  for (const id of ['live-feedback', 'live-prefix']) {
    await mount(page, id);
    const input = await editor(page).elementHandle();
    const root = await page.locator('[data-feedback-control] > div').elementHandle();
    const sample = feedbackCascaderSamples.find(sample => sample.id === id)!;
    for (const [index, action] of sample.actions!.entries()) {
      await apply(page, action, index);
      expect(await editor(page).evaluate((node, original) => node === original, input)).toBe(true);
      expect(await page.locator('[data-feedback-control] > div').evaluate((node, original) => node === original, root)).toBe(true);
      if (action !== 'outside') await expect(editor(page)).toBeFocused();
    }
  }
});

test('Cascader feedback clears validation visuals and uses the existing field reset remount', async ({ page }) => {
  await mount(page, 'async-success');
  const input = await editor(page).elementHandle();
  await apply(page, 'validate', 0);
  await expect(page.locator('[data-form-status-read="control"]')).toHaveText(JSON.stringify({ status: 'validating', errors: [], warnings: [] }));
  await apply(page, 'resolve', 1);
  await expect(page.locator('[data-form-status-read="control"]')).toHaveText(JSON.stringify({ status: 'success', errors: [], warnings: [] }));
  expect(await editor(page).evaluate((node, original) => node === original, input)).toBe(true);
  await apply(page, 'reset', 2);
  await expect(page.locator('[data-form-status-read="control"]')).toHaveText(JSON.stringify({ status: '', errors: [], warnings: [] }));
  expect(await editor(page).evaluate((node, original) => node === original, input)).toBe(false);
  await expect(page.locator('[data-feedback-control] [class*="-item-feedback-icon"]')).toHaveCount(0);
});

test('Cascader feedback disposes both refs and ignores a pending validation completion after unmount', async ({ page }) => {
  await mount(page, 'async-success');
  await apply(page, 'validate', 0);
  await page.getByRole('button', { name: 'Unmount feedback', exact: true }).dispatchEvent('click');
  await expect(page.locator('[data-feedback-ref]')).toHaveAttribute('data-feedback-ref', 'false');
  await apply(page, 'resolve', 1);
  await expect(editor(page)).toHaveCount(0);
  await expect(page.locator('[class*="-item-feedback-icon"]')).toHaveCount(0);
  await expect(page.locator('[popover]')).toHaveCount(0);
});
