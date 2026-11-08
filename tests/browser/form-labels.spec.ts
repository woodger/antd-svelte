import { test, expect } from './test';
import { formLabelsMetrics } from './form-labels-metrics';
import reference from './fixtures/ant-design-form-labels-reference.json' with { type: 'json' };

for (const { sample, metrics } of reference.cases) {
  test(`Form label settings match source precedence, colon and wrapping for ${sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=form-labels');
    await page.getByRole('combobox', { name: 'Form labels sample', exact: true }).selectOption(sample.id);
    await expect.poll(() => page.evaluate(formLabelsMetrics)).toEqual(metrics);
  });
}

test('Form label defaults react without replacing the focused input or its value and metadata', async ({ page }) => {
  await page.goto('/?fixture=form-labels');
  const input = page.getByRole('textbox', { name: 'Labelled field', exact: true });
  await input.fill('Draft name');
  await page.getByRole('button', { name: 'Seed label metadata', exact: true }).evaluate(
    (button: HTMLButtonElement) => { button.click(); }
  );
  await input.focus();
  await input.evaluate((element: HTMLInputElement) => { element.setSelectionRange(1, 4); });
  const original = await input.elementHandle();

  for (const id of ['config-inherit-ltr', 'form-priority-ltr', 'item-priority-ltr', 'config-reset-ltr', 'vertical-rtl']) {
    await page.getByRole('combobox', { name: 'Form labels sample', exact: true }).evaluate(
      (element: HTMLSelectElement, value) => {
        element.value = value;
        element.dispatchEvent(new Event('change', { bubbles: true }));
      }, id
    );
    await expect.poll(() => page.evaluate(formLabelsMetrics))
      .toEqual(reference.cases.find(({ sample }) => sample.id === id)!.metrics);
    await expect(input).toBeFocused();
    await expect(input).toHaveValue('Draft name');
    await expect(input).toHaveAccessibleDescription('Stored error Stored note');
    expect(await input.evaluate((element, old) => element === old, original)).toBe(true);
    expect(await input.evaluate((element: HTMLInputElement) =>
      [element.selectionStart, element.selectionEnd]
    )).toEqual([1, 4]);
  }
});

test('Form label punctuation keeps its original title and native click association', async ({ page }) => {
  await page.goto('/?fixture=form-labels');
  await page.getByRole('combobox', { name: 'Form labels sample', exact: true }).selectOption('fullwidth-ltr');
  const label = page.locator('[data-label-case] label');
  await expect(label).toHaveText('Field');
  await expect(label).toHaveAttribute('title', 'Field： ');
  await label.click();
  await expect(page.getByRole('textbox', { name: 'Labelled field', exact: true })).toBeFocused();
});
