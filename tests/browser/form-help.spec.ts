import { test, expect } from './test';
import { formHelpMetrics } from './form-help-metrics';
import reference from './fixtures/ant-design-form-help-reference.json' with { type: 'json' };

for (const { sample, metrics } of reference.cases) {
  test(`Form help renders source content and accessible descriptions for ${sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=form-help');
    await page.getByRole('combobox', { name: 'Form help sample', exact: true }).selectOption(sample.id);
    const expected = sample.id === 'zero'
      ? reference.cases.find(({ sample }) => sample.id === 'string-zero')!.metrics : metrics;

    await expect.poll(() => page.evaluate(formHelpMetrics)).toEqual(expected);
  });
}

test('Form resetFields remounts stateful help like the source', async ({ page }) => {
  await page.goto('/?fixture=form-help');
  await page.getByRole('combobox', { name: 'Form help sample', exact: true }).selectOption('counter');
  await page.locator('[data-counter="Help"]').evaluate((button: HTMLButtonElement) => {
    button.click();
  });
  await expect.poll(() => page.evaluate(formHelpMetrics)).toEqual(reference.counter.incremented);
  const previous = await page.locator('[data-counter="Help"]').elementHandle();

  await page.getByRole('button', { name: 'Reset help field', exact: true }).evaluate(
    (button: HTMLButtonElement) => { button.click(); }
  );
  await expect.poll(() => page.evaluate(formHelpMetrics)).toEqual(reference.counter.reset);
  expect(await previous!.evaluate((element) => element.isConnected)).toBe(false);
});

for (const { sample } of reference.observations) {
  test(`Form preserves native errors over explicit help for ${sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=form-help');
    await page.getByRole('combobox', { name: 'Form help sample', exact: true }).selectOption(sample.id);

    await expect.poll(() => page.evaluate(formHelpMetrics)).toMatchObject({
      described: true, hasDescription: true, invalid: 'true'
    });
    expect(await page.getByRole('alert').locator('.ant-form-item-explain-error').allTextContents())
      .toEqual(['Required']);
    await expect(page.getByRole('textbox', { name: 'main control', exact: true }))
      .toHaveAccessibleDescription('Required');
  });
}

test('Form rich help updates preserve the focused field, selection and native serialization', async ({ page }) => {
  await page.goto('/?fixture=form-help');
  const input = page.getByRole('textbox', { name: 'main control', exact: true });
  await input.fill('Draft name');
  await input.evaluate((element: HTMLInputElement) => { element.setSelectionRange(1, 4); });
  const previous = await input.elementHandle();

  for (const id of ['text', 'zero', 'array', 'rich', 'false']) {
    await page.getByRole('combobox', { name: 'Form help sample', exact: true }).evaluate(
      (element: HTMLSelectElement, value) => {
        element.value = value;
        element.dispatchEvent(new Event('change', { bubbles: true }));
      }, id
    );
    await expect(input).toBeFocused();
    await expect(input).toHaveValue('Draft name');
    expect(await input.evaluate((element, old) => element === old, previous)).toBe(true);
    expect(await input.evaluate((element: HTMLInputElement) =>
      [element.selectionStart, element.selectionEnd]
    )).toEqual([1, 4]);
    expect(await input.evaluate((element: HTMLInputElement) =>
      new FormData(element.form!).get('name')
    )).toBe('Draft name');
  }
});
