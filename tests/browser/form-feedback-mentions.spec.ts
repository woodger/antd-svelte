import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-form-feedback-mentions-reference.json' with { type: 'json' };
import type { MentionsFeedbackAction } from './fixtures/form-feedback-mentions-cases';
import { readFormFeedbackMentions } from './form-feedback-mentions-metrics';
const editor = (page: Page) => page.locator('[data-feedback-control] textarea, [data-feedback-control] input:not([type="checkbox"]):not([type="hidden"])').first();
async function apply(page: Page, action: MentionsFeedbackAction, index: number) {
  if (action === 'focus') await editor(page).focus();
  else if (action === 'clear') await page.locator('[data-ant-mentions-clear]').click();
  else if (action === 'type-mention') {
    await editor(page).press('End');
    await editor(page).pressSequentially('@a');
  }
  else if (action === 'choose-mention') await editor(page).press('Enter');
  else if (action === 'search-transfer') await editor(page).fill('Alpha');
  else if (action === 'move-transfer') {
    const root = page.locator('[data-feedback-control]');
    await root.getByText('Alpha', { exact: true }).click();
    await root.locator('[class$="-actions"] button').first().click();
  } else {
    await page.getByRole('combobox', { name: 'Feedback action', exact: true }).selectOption(String(index));
    await page.getByRole('button', { name: 'Apply feedback action', exact: true }).dispatchEvent('click');
  }
}
for (const entry of reference.cases) {
  test(`Mentions/Transfer feedback follows Source for ${entry.id}`, async ({ page }) => {
    await page.goto('/?fixture=form-feedback-mentions');
    await page.getByRole('combobox', { name: 'Form feedback mentions sample', exact: true }).selectOption(entry.id);
    await expect(page.locator('[data-feedback-root-ref]')).toHaveAttribute('data-feedback-root-ref', 'true');
    const read = () => page.evaluate(readFormFeedbackMentions);
    await expect.poll(read).toEqual(entry.initial);
    let previous = entry.steps.length ? await editor(page).elementHandle() : null;
    for (const [index, step] of entry.steps.entries()) {
      await apply(page, step.action as MentionsFeedbackAction, index);
      await expect.poll(read, { message: step.action }).toEqual(step.view);
      expect(await editor(page).evaluate((node, original) => node === original, previous), step.action).toBe(step.sameInput);
      previous = await editor(page).elementHandle();
    }
  });
}
test('Mentions removes its feedback/root ref and ignores validation completion after unmount', async ({ page }) => {
  await page.goto('/?fixture=form-feedback-mentions');
  await page.getByRole('combobox', { name: 'Form feedback mentions sample', exact: true }).selectOption('mentions-async-success');
  await expect(page.locator('[data-feedback-root-ref]')).toHaveAttribute('data-feedback-root-ref', 'true');
  await apply(page, 'validate', 0);
  await expect(page.locator('[data-form-status-read="control"]')).toHaveText(JSON.stringify({ status: 'validating', errors: [], warnings: [] }));
  await page.getByRole('button', { name: 'Unmount feedback', exact: true }).click();
  await expect(page.locator('[data-feedback-root-ref]')).toHaveAttribute('data-feedback-root-ref', 'false');
  await apply(page, 'resolve', 1);
  await expect(page.locator('[data-feedback-control]')).toHaveCount(0);
  await expect(page.locator('[class*="-item-feedback-icon"]')).toHaveCount(0);
});
test('Mentions retains its native DIV and ref while a feedback toggle replaces only its editor', async ({ page }) => {
  await page.goto('/?fixture=form-feedback-mentions');
  await page.getByRole('combobox', { name: 'Form feedback mentions sample', exact: true }).selectOption('mentions-live');
  await expect(page.locator('[data-feedback-root-ref]')).toHaveAttribute('data-feedback-root-ref', 'true');
  const root = page.locator('[data-ant-mentions-root]');
  const original = await root.elementHandle();
  for (const index of [0, 1, 2, 3, 4, 5, 6]) {
    const actions = ['focus', 'error', 'update-icon', 'hide-icon', 'show-icon', 'toggle-feedback', 'toggle-feedback'] as const;
    await apply(page, actions[index], index);
    expect(await root.evaluate((node, previous) => node === previous && node.tagName === 'DIV', original)).toBe(true);
    await expect(page.locator('[data-feedback-root-ref]')).toHaveAttribute('data-feedback-root-ref', 'true');
  }
});
