import { test, expect } from './test';
import reference from './fixtures/ant-design-form-constraints-reference.json' with { type: 'json' };

for (const entry of reference.cases) {
  test(`Form length and whitespace match source constraints for ${entry.sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=form-constraints');
    await page.getByRole('combobox', { name: 'Constraint sample', exact: true })
      .selectOption(entry.sample.id);
    await page.getByRole('button', { name: 'Validate constrained field', exact: true }).click();

    await expect(page.getByRole('status', { name: 'Constraint result', exact: true }))
      .toHaveText(entry.valid ? 'valid' : 'invalid');
    await expect.poll(async () => JSON.parse((await page.getByRole('status', {
      name: 'Constraint metadata', exact: true
    }).textContent())!)).toEqual({ errors: entry.errors, warnings: entry.warnings, store: entry.store });
    if (entry.errors.length) {
      await expect(page.getByLabel('Constrained field', { exact: true }))
        .toHaveAttribute('aria-invalid', 'true');
    }
  });
}

test('Form whitespace validation clears after user input and returns to its captured reset value', async ({ page }) => {
  await page.goto('/?fixture=form-constraints');
  await page.getByRole('combobox', { name: 'Constraint sample', exact: true })
    .selectOption('space-rejected');
  const input = page.getByLabel('Constrained field', { exact: true });
  await page.getByRole('button', { name: 'Validate constrained field', exact: true }).click();
  await expect(input).toHaveAccessibleDescription('Rejected');
  await input.fill('abc');
  await page.getByRole('button', { name: 'Validate constrained field', exact: true }).click();
  await expect(page.getByRole('status', { name: 'Constraint result', exact: true })).toHaveText('valid');
  await expect(input).not.toHaveAttribute('aria-invalid');
  await page.getByRole('button', { name: 'Reset constrained field', exact: true }).click();
  await expect(input).toHaveValue('   ');
  await expect(input).not.toHaveAttribute('aria-invalid');
});
