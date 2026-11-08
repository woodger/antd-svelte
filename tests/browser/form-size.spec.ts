import { test, expect } from './test';
import { formSizeMetrics } from './form-size-metrics';
import reference from './fixtures/ant-design-form-size-reference.json' with { type: 'json' };

for (const { sample, metrics } of reference.cases) {
  test(`Form size matches source labels, controls and inheritance for ${sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=form-size');
    await page.getByRole('combobox', { name: 'Form size sample', exact: true }).selectOption(sample.id);
    await expect.poll(() => page.evaluate(formSizeMetrics)).toEqual(metrics);
  });
}

test('Form size updates preserve its control, selection, value, metadata and native form association', async ({ page }) => {
  await page.goto('/?fixture=form-size');
  const input = page.getByRole('textbox', { name: 'Name', exact: true });
  await input.fill('Draft name');
  await page.getByRole('button', { name: 'Seed size metadata', exact: true }).evaluate(
    (button: HTMLButtonElement) => { button.click(); }
  );
  await input.focus();
  await input.evaluate((element: HTMLInputElement) => { element.setSelectionRange(1, 4); });
  const original = await input.elementHandle();
  const metadata = await page.getByRole('status', { name: 'Size metadata', exact: true }).textContent();

  for (const id of ['local-small', 'local-large', 'local-medium', 'global-small', 'default']) {
    await page.getByRole('combobox', { name: 'Form size sample', exact: true }).evaluate(
      (element: HTMLSelectElement, value) => {
        element.value = value;
        element.dispatchEvent(new Event('change', { bubbles: true }));
      }, id
    );
    await expect.poll(() => page.evaluate(formSizeMetrics))
      .toEqual(reference.cases.find(({ sample }) => sample.id === id)!.metrics);
    await expect(input).toBeFocused();
    await expect(input).toHaveValue('Draft name');
    await expect(input).toHaveAccessibleDescription('Stored error Stored note');
    await expect(page.getByRole('status', { name: 'Size metadata', exact: true })).toHaveText(metadata!);
    expect(await input.evaluate((element, old) => element === old, original)).toBe(true);
    expect(await input.evaluate((element: HTMLInputElement) =>
      [element.selectionStart, element.selectionEnd]
    )).toEqual([1, 4]);
    expect(await input.evaluate((element: HTMLInputElement) =>
      new FormData(element.form!).get('name')
    )).toBe('Draft name');
  }
});
