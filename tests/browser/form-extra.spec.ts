import { test, expect } from './test';
import type { Page } from '@playwright/test';
import { formExtraMetrics } from './form-extra-metrics';
import reference from './fixtures/ant-design-form-extra-reference.json' with { type: 'json' };

async function act(page: Page, name: string) {
  await page.getByRole('button', { name, exact: true }).evaluate(
    (button: HTMLButtonElement) => { button.click(); }
  );
}

test('Form extra matches source presence, content, styling and ARIA through scalar, array and rich cases', async ({ page }) => {
  await page.goto('/?fixture=form-extra');
  for (const sample of reference.cases) {
    await act(page, `Extra ${sample.id}`);
    await expect.poll(() => page.evaluate(formExtraMetrics)).toEqual(sample);
  }
});

test('Form extra coexists with errors and warnings without hiding the permanent explanation', async ({ page }) => {
  await page.goto('/?fixture=form-extra');
  await act(page, 'Extra with-messages');
  const input = page.getByLabel('Name', { exact: true });
  await expect(input).toHaveAccessibleDescription('Error Warning Persistent extra');
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('[id$="_extra"]')).toHaveText('Persistent extra');
  await act(page, 'Extra messages-without-extra');
  await expect(input).toHaveAccessibleDescription('Error Warning');
  await expect(page.locator('[id$="_extra"]')).toHaveCount(0);
});

test('Form extra changes its snippet and ARIA references without replacing input or selection', async ({ page }) => {
  await page.goto('/?fixture=form-extra');
  await act(page, 'Extra rich');
  const input = page.getByLabel('Name', { exact: true });
  await input.focus();
  await input.evaluate((element: HTMLInputElement) => { element.setSelectionRange(1, 3); });
  const original = await input.elementHandle();
  await act(page, 'Update extra snippet');
  await expect(page.getByRole('link', { name: 'Updated extra', exact: true })).toHaveAttribute('href', '#more');
  await expect(input).toHaveAccessibleDescription('Updated extra');
  await act(page, 'Toggle external description');
  await expect(input).toHaveAccessibleDescription('External description Updated extra');
  await act(page, 'Extra false');
  await expect(input).toHaveAccessibleDescription('External description');

  await expect(input).toBeFocused();
  await expect(input).toHaveValue('Anna');
  expect(await input.evaluate((element, old) => element === old, original)).toBe(true);
  expect(await input.evaluate((element: HTMLInputElement) =>
    [element.selectionStart, element.selectionEnd]
  )).toEqual([1, 3]);
});
