import { test, expect } from './test';
import { formRequiredMarkMetrics } from './form-required-mark-metrics';
import reference from './fixtures/ant-design-form-required-mark-reference.json' with { type: 'json' };

for (const { sample, metrics } of reference.cases) {
  test(`Form requiredMark matches source classes, content and locale for ${sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=form-required-mark');
    await page.getByRole('combobox', { name: 'Required mark sample', exact: true }).selectOption(sample.id);
    await expect.poll(() => page.evaluate(formRequiredMarkMetrics)).toEqual(metrics);
  });
}

test('Form mark updates preserve the focused native control, value, selection and field metadata', async ({ page }) => {
  await page.goto('/?fixture=form-required-mark');
  const input = page.getByRole('textbox', { name: 'Required field', exact: true });
  await input.fill('Draft name');
  await page.getByRole('button', { name: 'Seed required mark metadata', exact: true }).evaluate(
    (button: HTMLButtonElement) => { button.click(); }
  );
  await input.focus();
  await input.evaluate((element: HTMLInputElement) => { element.setSelectionRange(1, 4); });
  const original = await input.elementHandle();
  const metadata = await page.getByRole('status', { name: 'Required mark metadata', exact: true }).textContent();

  for (const id of ['hidden', 'optional-en', 'custom', 'nested-reset', 'optional-ru']) {
    await page.getByRole('combobox', { name: 'Required mark sample', exact: true }).evaluate(
      (element: HTMLSelectElement, value) => {
        element.value = value;
        element.dispatchEvent(new Event('change', { bubbles: true }));
      }, id
    );
    await expect.poll(() => page.evaluate(formRequiredMarkMetrics))
      .toEqual(reference.cases.find(({ sample }) => sample.id === id)!.metrics);
    await expect(input).toBeFocused();
    await expect(input).toHaveValue('Draft name');
    await expect(input).toHaveAccessibleDescription('Stored error Stored note');
    await expect(page.getByRole('status', { name: 'Required mark metadata', exact: true }))
      .toHaveText(metadata!);
    expect(await input.evaluate((element, old) => element === old, original)).toBe(true);
    expect(await input.evaluate((element: HTMLInputElement) =>
      [element.selectionStart, element.selectionEnd]
    )).toEqual([1, 4]);
  }
});

for (const id of ['hidden', 'optional-ru', 'custom']) {
  test(`Form ${id} mark keeps native required, validation and form serialization`, async ({ page }) => {
    await page.goto('/?fixture=form-required-mark');
    await page.getByRole('combobox', { name: 'Required mark sample', exact: true }).selectOption(id);
    const input = page.getByRole('textbox', { name: 'Required field', exact: true });
    const optional = page.getByRole('textbox', { name: 'Optional field', exact: true });
    await expect(input).toHaveJSProperty('required', true);
    await expect(optional).toHaveJSProperty('required', false);
    const form = page.locator('[data-required-mark-case] form');
    expect(await form.evaluate((element: HTMLFormElement) => Object.fromEntries(new FormData(element))))
      .toEqual({ required: 'Alpha', optional: 'Beta' });
    await page.locator('[data-required-mark-case] label').first().click();
    await expect(input).toBeFocused();

    await input.fill('');
    await form.evaluate((element: HTMLFormElement) => { element.requestSubmit(); });
    await expect(page.getByRole('status', { name: 'Required mark failures', exact: true })).toHaveText('1');
    await expect(page.getByRole('status', { name: 'Required mark submissions', exact: true })).toHaveText('0');
    await expect(input).toHaveAccessibleDescription('Required field');
    await expect(input).toBeFocused();

    await input.fill('Complete');
    await form.evaluate((element: HTMLFormElement) => { element.requestSubmit(); });
    await expect(page.getByRole('status', { name: 'Required mark submissions', exact: true })).toHaveText('1');
  });
}
