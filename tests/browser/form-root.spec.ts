import { test, expect } from './test';
import reference from './fixtures/ant-design-form-root-reference.json' with { type: 'json' };
import { formRootMetrics } from './form-root-metrics';

for (const { sample, metrics } of reference.cases) {
  test(`Form root classes and styles match source config priority for ${sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=form-root');
    await page.getByRole('combobox', { name: 'Form root sample', exact: true }).selectOption(sample.id);
    await expect.poll(() => page.evaluate(formRootMetrics)).toEqual(metrics);
  });
}

test('Form root styles update without replacing its input, value, focus, selection or metadata', async ({ page }) => {
  await page.goto('/?fixture=form-root');
  const input = page.getByRole('textbox', { name: 'Name', exact: true });
  await input.fill('Draft name');
  await page.getByRole('button', { name: 'Seed root metadata', exact: true }).evaluate(
    (button: HTMLButtonElement) => { button.click(); }
  );
  await input.focus();
  await input.evaluate((element: HTMLInputElement) => { element.setSelectionRange(1, 4); });
  const original = await input.elementHandle();
  const metadata = await page.getByRole('status', { name: 'Root metadata', exact: true }).textContent();

  for (const id of ['config-root', 'local-over-config', 'field-root', 'field-css-vars', 'config-reset']) {
    await page.getByRole('combobox', { name: 'Form root sample', exact: true }).evaluate(
      (element: HTMLSelectElement, value) => {
        element.value = value;
        element.dispatchEvent(new Event('change', { bubbles: true }));
      }, id
    );
    await expect(input).toBeFocused();
    await expect(input).toHaveValue('Draft name');
    await expect(input).toHaveAccessibleDescription('Stored error Stored note');
    await expect(page.getByRole('status', { name: 'Root metadata', exact: true })).toHaveText(metadata!);
    expect(await input.evaluate((element, old) => element === old, original)).toBe(true);
    expect(await input.evaluate((element: HTMLInputElement) =>
      [element.selectionStart, element.selectionEnd]
    )).toEqual([1, 4]);
  }
});
