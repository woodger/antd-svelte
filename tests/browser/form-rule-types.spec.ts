import { test, expect } from './test';
import reference from './fixtures/ant-design-form-rule-types-reference.json' with { type: 'json' };
import { formRuleTypesCorrections } from './fixtures/form-rule-types-cases';

const samples = new Set([
  'string-string', 'string-integer', 'string-spaces-required', 'string-spaces-whitespace',
  'number-integer', 'number-string', 'number-empty', 'number-symbol', 'number-bigint',
  'integer-integer', 'integer-fraction', 'integer-large-integer',
  'float-fraction', 'float-integer', 'float-large-integer',
  'boolean-true', 'boolean-integer', 'array-array', 'array-string', 'array-empty-array-required',
  'object-object', 'object-array', 'date-string', 'date-date', 'date-symbol', 'date-bigint',
  'regexp-regexp', 'regexp-invalid-regexp', 'method-method', 'method-string',
  'any-empty-required', 'any-ignores-range', 'string-custom-overrides-constraints',
  'number-custom-overrides-type'
]);

for (const entry of reference.cases.filter(({ sample }) => samples.has(sample.id))) {
  test(`Form explicit type keeps validation messages and native accessibility for ${entry.sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=form-rule-types');
    await page.getByRole('combobox', { name: 'Rule type sample', exact: true })
      .selectOption(entry.sample.id);
    await page.getByRole('button', { name: 'Validate typed field', exact: true }).click();
    const valid = formRuleTypesCorrections[entry.sample.id] ?? entry.valid;

    await expect(page.getByRole('status', { name: 'Typed validation', exact: true }))
      .toHaveText(valid ? 'valid' : 'invalid');
    await expect(page.getByRole('status', { name: 'Typed errors', exact: true }))
      .toHaveText(valid ? '[]' : '["Rejected"]');
    const input = page.getByLabel('Typed field', { exact: true });
    if (valid) await expect(input).not.toHaveAttribute('aria-invalid');
    else {
      await expect(input).toHaveAttribute('aria-invalid', 'true');
      await expect(input).toHaveAccessibleDescription('Rejected');
    }
  });
}
