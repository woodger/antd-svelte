import { test, expect } from './test';
import reference from './fixtures/ant-design-form-rule-formats-reference.json' with { type: 'json' };
import { formRuleFormatsCorrections } from './fixtures/form-rule-formats-cases';

const samples = new Set([
  'email-format-0', 'email-format-4', 'email-empty-required', 'email-format-8',
  'url-format-5', 'url-format-6', 'url-format-7', 'url-format-8', 'url-format-12', 'url-format-13',
  'hex-format-0', 'hex-format-4', 'tel-format-3', 'tel-format-6',
  'enum-zero', 'enum-false', 'enum-strict-number', 'enum-empty-included',
  'pattern-global', 'pattern-invalid', 'pattern-array', 'legacy-string-pattern',
  'legacy-string-pattern-error', 'email-custom-overrides-type'
]);

for (const entry of reference.cases.filter(({ sample }) => samples.has(sample.id))) {
  test(`Form format validation keeps messages, accessibility and strict console checks for ${entry.sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=form-rule-formats');
    await page.getByRole('combobox', { name: 'Rule format sample', exact: true })
      .selectOption(entry.sample.id);
    await page.getByRole('button', { name: 'Validate format field', exact: true }).click();
    const valid = formRuleFormatsCorrections[entry.sample.id] ?? entry.valid;

    await expect(page.getByRole('status', { name: 'Format validation', exact: true }))
      .toHaveText(valid ? 'valid' : 'invalid');
    await expect(page.getByRole('status', { name: 'Format errors', exact: true }))
      .toHaveText(valid ? '[]' : '["Rejected"]');
    if (!valid) await expect(page.getByLabel('Format field', { exact: true }))
      .toHaveAccessibleDescription('Rejected');
  });
}
