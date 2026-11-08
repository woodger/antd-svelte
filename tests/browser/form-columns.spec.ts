import { test, expect } from './test';
import { formColumnsMetrics } from './form-columns-metrics';
import reference from './fixtures/ant-design-form-columns-reference.json' with { type: 'json' };

for (const { sample, metrics } of reference.cases) {
  test(`Form columns match source layout, scope and responsive metrics for ${sample.id}`, async ({ page }) => {
    await page.setViewportSize({ width: sample.viewport, height: 800 });
    await page.goto('/?fixture=form-columns');
    await page.getByRole('combobox', { name: 'Form columns sample', exact: true }).selectOption(sample.id);
    await expect.poll(() => page.evaluate(formColumnsMetrics)).toEqual(metrics);
  });
}

test('Form column updates retain native controls, focused selection, value and metadata', async ({ page }) => {
  await page.setViewportSize({ width: 576, height: 800 });
  await page.goto('/?fixture=form-columns');
  const input = page.getByLabel('Name', { exact: true });
  await input.fill('Draft name');
  await page.getByRole('button', { name: 'Seed columns metadata', exact: true }).evaluate(
    (button: HTMLButtonElement) => { button.click(); }
  );
  await input.focus();
  await input.evaluate((element: HTMLInputElement) => { element.setSelectionRange(1, 4); });
  const original = await input.elementHandle();
  const metadata = await page.getByRole('status', { name: 'Columns metadata', exact: true }).textContent();

  for (const id of [
    'item-priority-576-ltr', 'item-reset-576-rtl', 'vertical-576-ltr',
    'flex-576-rtl', 'styles-576-ltr'
  ]) {
    await page.getByRole('combobox', { name: 'Form columns sample', exact: true }).evaluate(
      (element: HTMLSelectElement, value) => {
        element.value = value;
        element.dispatchEvent(new Event('change', { bubbles: true }));
      }, id
    );
    await expect(input).toBeFocused();
    await expect(input).toHaveValue('Draft name');
    await expect(input).toHaveAccessibleDescription('Stored error Stored note');
    await expect(page.getByRole('status', { name: 'Columns metadata', exact: true })).toHaveText(metadata!);
    expect(await input.evaluate((element, old) => element === old, original)).toBe(true);
    expect(await input.evaluate((element: HTMLInputElement) =>
      [element.selectionStart, element.selectionEnd]
    )).toEqual([1, 4]);
  }
  await expect(page.locator('.columns-root > .ant-form-item-row > .ant-form-item-label'))
    .toHaveClass(/owner-label/);
  await expect(page.locator('.columns-root > .ant-form-item-row > .ant-form-item-control'))
    .toHaveClass(/owner-control/);
  expect(await page.locator('#form-columns-fixture form')
    .evaluate((element: HTMLFormElement) => Object.fromEntries(new FormData(element))))
    .toEqual({ name: 'Draft name' });
});

test('Form column visibility follows Grid span zero and restores its label association', async ({ page }) => {
  await page.goto('/?fixture=form-columns');
  const input = page.getByLabel('Name', { exact: true });
  await page.getByRole('combobox', { name: 'Form columns sample', exact: true })
    .selectOption('zero-576-ltr');
  await expect(page.locator('.columns-root > .ant-form-item-row > .ant-form-item-label')).toBeHidden();
  await expect(input).toHaveValue('Alpha');

  await page.getByRole('combobox', { name: 'Form columns sample', exact: true })
    .selectOption('form-columns-576-ltr');
  await page.locator('.columns-root label').click();

  await expect(input).toBeFocused();
  await expect(input).toHaveValue('Alpha');
});
