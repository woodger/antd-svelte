import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-form-explanation-reset-reference.json' with { type: 'json' };

async function snapshot(page: Page) {
  return page.locator('[data-counter]').evaluateAll((nodes) => Object.fromEntries(
    nodes.map((node) => [node.getAttribute('data-counter'), node.textContent])
  ));
}

async function act(page: Page, name: string) {
  await page.getByRole('button', { name, exact: true }).evaluate(
    (button: HTMLButtonElement) => { button.click(); }
  );
}

test('Form resetFields remounts the selected label, tooltip and extra states like the source', async ({ page }) => {
  await page.goto('/?fixture=form-explanation-reset');
  await expect.poll(() => snapshot(page)).toEqual(reference.initial);
  for (const id of Object.keys(reference.initial)) {
    await page.locator(`[data-counter="${id}"]`).evaluate((button: HTMLButtonElement) => {
      button.click();
    });
  }
  await expect.poll(() => snapshot(page)).toEqual(reference.incremented);
  const extra = await page.locator('[data-counter="a-extra"]').elementHandle();

  await act(page, 'Reset explanations for a');
  await expect.poll(() => snapshot(page)).toEqual(reference.selected);
  expect(await extra!.evaluate((element) => element.isConnected)).toBe(false);
  await page.locator('[data-counter="a-extra"]').evaluate((button: HTMLButtonElement) => {
    button.click();
  });
  await act(page, 'Reset explanations for a');
  await expect.poll(() => snapshot(page)).toEqual(reference.repeated);
  await act(page, 'Reset all explanations');
  await expect.poll(() => snapshot(page)).toEqual(reference.all);
});

test('Form explanation reset preserves the untouched control, selection and slot DOM', async ({ page }) => {
  await page.goto('/?fixture=form-explanation-reset');
  const first = page.getByRole('textbox', { name: 'a control', exact: true });
  const second = page.getByRole('textbox', { name: 'b control', exact: true });
  await first.fill('Draft a');
  await second.fill('Draft b');
  await second.evaluate((element: HTMLInputElement) => { element.setSelectionRange(1, 4); });
  await page.locator('[data-counter="b-extra"]').evaluate((button: HTMLButtonElement) => {
    button.click();
  });
  const input = await second.elementHandle();
  const extra = await page.locator('[data-counter="b-extra"]').elementHandle();

  await act(page, 'Reset explanations for a');
  await expect(first).toHaveValue('Alpha');
  await expect(second).toHaveValue('Draft b');
  await expect(second).toBeFocused();
  expect(await second.evaluate((element, previous) => element === previous, input)).toBe(true);
  expect(await extra!.evaluate((element) => element.isConnected)).toBe(true);
  await expect(page.locator('[data-counter="b-extra"]')).toHaveText('b-extra: 1');
  expect(await second.evaluate((element: HTMLInputElement) =>
    [element.selectionStart, element.selectionEnd]
  )).toEqual([1, 4]);
});
