import { test, expect } from './test';
import reference from './fixtures/ant-design-form-nested-rules-reference.json' with { type: 'json' };
import { nestedRuleCorrections } from './fixtures/form-nested-rules-cases';

for (const entry of reference.cases) {
  test(`Form nested rules preserve source aggregation and recorded corrections for ${entry.sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=form-nested-rules');
    await page.getByRole('combobox', { name: 'Nested rule sample', exact: true })
      .selectOption(entry.sample.id);
    await page.getByRole('button', { name: 'Validate nested rule', exact: true }).click();
    if (entry.sample.pending) {
      await expect(page.getByRole('status', { name: 'Nested rule pending', exact: true }))
        .toHaveText(String(entry.sample.pending));
      await page.getByRole('button', { name: 'Release nested rule', exact: true }).click();
    }
    const expected = nestedRuleCorrections[entry.sample.id] ?? entry;

    await expect.poll(async () => JSON.parse((await page.getByRole('status', {
      name: 'Nested rule report', exact: true
    }).textContent())!)).toEqual({
      valid: expected.valid, errors: expected.errors, warnings: expected.warnings, validating: false
    });
    const input = page.getByLabel('Nested rule field', { exact: true });
    if (expected.errors.length) {
      await expect(input).toHaveAttribute('aria-invalid', 'true');
      await expect(input).toHaveAccessibleDescription(expected.errors.join(' '));
    } else if (expected.warnings.length) {
      await expect(input).not.toHaveAttribute('aria-invalid');
      await expect(input).toHaveAccessibleDescription(expected.warnings.join(' '));
    }
  });
}
