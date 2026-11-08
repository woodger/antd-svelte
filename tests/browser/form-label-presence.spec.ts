import { test, expect } from './test';
import { formColumnsMetrics } from './form-columns-metrics';
import reference from './fixtures/ant-design-form-label-presence-reference.json' with { type: 'json' };

for (const { sample, metrics } of reference.cases) {
  test(`Form label presence follows source layout and preserves column shorthand for ${sample.id}`, async ({ page }) => {
    await page.setViewportSize({ width: sample.viewport, height: 800 });
    await page.goto('/?fixture=form-label-presence');
    await page.getByRole('combobox', { name: 'Form label presence sample', exact: true })
      .selectOption(sample.id);
    // Числовой shorthand должен совпадать с объектом Col, а не терять span/offset как в source.
    const canonicalId = sample.id.replace(/^numeric-label-/, 'object-label-')
      .replace(/^numeric-wrapper-/, 'object-wrapper-');
    const expected = canonicalId === sample.id ? metrics
      : reference.cases.find(({ sample }) => sample.id === canonicalId)!.metrics;

    await expect.poll(() => page.evaluate(formColumnsMetrics)).toEqual(expected);
  });
}

test('Form label insertion and removal retain the focused input, selection, value and metadata', async ({ page }) => {
  await page.goto('/?fixture=form-label-presence');
  const input = page.getByRole('textbox', { name: 'Control', exact: true });
  await input.fill('Draft name');
  await page.getByRole('button', { name: 'Seed unlabelled metadata', exact: true }).evaluate(
    (button: HTMLButtonElement) => { button.click(); }
  );
  await input.focus();
  await input.evaluate((element: HTMLInputElement) => { element.setSelectionRange(1, 4); });
  const original = await input.elementHandle();
  const metadata = await page.getByRole('status', { name: 'Unlabelled metadata', exact: true }).textContent();

  for (const id of ['space-576-ltr', 'missing-576-ltr', 'empty-576-ltr', 'null-form-576-rtl']) {
    await page.getByRole('combobox', { name: 'Form label presence sample', exact: true }).evaluate(
      (element: HTMLSelectElement, value) => {
        element.value = value;
        element.dispatchEvent(new Event('change', { bubbles: true }));
      }, id
    );
    await expect(input).toBeFocused();
    await expect(input).toHaveValue('Draft name');
    await expect(input).toHaveAccessibleDescription('Stored error Stored note');
    await expect(page.getByRole('status', { name: 'Unlabelled metadata', exact: true })).toHaveText(metadata!);
    expect(await input.evaluate((element, old) => element === old, original)).toBe(true);
    expect(await input.evaluate((element: HTMLInputElement) =>
      [element.selectionStart, element.selectionEnd]
    )).toEqual([1, 4]);
  }
  expect(await page.locator('#form-label-presence-fixture form')
    .evaluate((element: HTMLFormElement) => Object.fromEntries(new FormData(element))))
    .toEqual({ name: 'Draft name' });
});

test('Form unlabelled fields keep native required, model validation and error focus', async ({ page }) => {
  await page.goto('/?fixture=form-label-presence');
  await page.getByRole('button', { name: 'Require unlabelled field', exact: true }).click();
  const input = page.getByRole('textbox', { name: 'Control', exact: true });
  await expect(input).toHaveJSProperty('required', true);
  await expect(page.locator('.columns-root > .ant-form-item-row > .ant-form-item-label')).toHaveCount(0);
  await input.fill('');

  await page.locator('#form-label-presence-fixture form').evaluate((element: HTMLFormElement) => {
    element.requestSubmit();
  });

  await expect(page.getByRole('status', { name: 'Unlabelled failures', exact: true })).toHaveText('1');
  await expect(input).toHaveAccessibleDescription('Required field');
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await expect(input).toBeFocused();
});
