import { test, expect } from './test';
import { formSemanticMetrics } from './form-semantic-metrics';
import reference from './fixtures/ant-design-form-semantic-reference.json' with { type: 'json' };

for (const { sample, metrics } of reference.cases) {
  test(`Form semantic slots match source layers, callbacks and nested scopes for ${sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=form-semantic');
    await page.getByRole('combobox', { name: 'Form semantic sample', exact: true }).selectOption(sample.id);
    await expect.poll(() => page.evaluate(formSemanticMetrics)).toEqual(metrics);
  });
}

test('Form semantic updates preserve focused controls and all field metadata', async ({ page }) => {
  await page.goto('/?fixture=form-semantic');
  const input = page.locator('[data-semantic-field] input');
  await input.fill('Draft name');
  await page.getByRole('button', { name: 'Seed semantic metadata', exact: true }).evaluate(
    (button: HTMLButtonElement) => { button.click(); }
  );
  await input.focus();
  await input.evaluate((element: HTMLInputElement) => { element.setSelectionRange(1, 4); });
  const original = await input.elementHandle();
  const metadata = await page.getByRole('status', { name: 'Semantic metadata', exact: true }).textContent();

  for (const id of ['context', 'layers', 'callbacks-local', 'callbacks-empty', 'config-reset']) {
    await page.getByRole('combobox', { name: 'Form semantic sample', exact: true }).evaluate(
      (element: HTMLSelectElement, value) => {
        element.value = value;
        element.dispatchEvent(new Event('change', { bubbles: true }));
      }, id
    );
    await expect.poll(() => page.evaluate(formSemanticMetrics))
      .toEqual(reference.cases.find(({ sample }) => sample.id === id)!.metrics);
    await expect(input).toBeFocused();
    await expect(input).toHaveValue('Draft name');
    await expect(input).toHaveAccessibleDescription('Error Warning Extra');
    await expect(page.getByRole('status', { name: 'Semantic metadata', exact: true })).toHaveText(metadata!);
    expect(await input.evaluate((element, old) => element === old, original)).toBe(true);
    expect(await input.evaluate((element: HTMLInputElement) =>
      [element.selectionStart, element.selectionEnd]
    )).toEqual([1, 4]);
  }
});
