import { test, expect } from './test';
import reference from './fixtures/ant-design-form-warning-observation.json' with { type: 'json' };

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=form-warnings');
  await expect(page.locator('#form-warnings-fixture')).toBeVisible();
});

test('Form matches pinned warning metadata and submits an optional empty field', async ({ page }) => {
  const sample = reference.cases.find((entry) => entry.id === 'required-warning')!;
  const input = page.getByLabel('Recommended name', { exact: true });

  await page.getByRole('button', { name: 'Submit warnings', exact: true }).click();

  await expect(page.getByRole('status', { name: 'Warning fields', exact: true }))
    .toHaveText(JSON.stringify(sample.fields));
  await expect(page.getByRole('status', { name: 'Submitted warnings', exact: true }))
    .toHaveText(JSON.stringify(sample.submitted![0]));
  await expect(input).toHaveAccessibleDescription('Name recommended');
  await expect(input).not.toHaveAttribute('required');
  await expect(input).not.toHaveAttribute('aria-invalid');
  await expect(page.locator('#warning-form .ant-form-item-required')).toHaveCount(0);
  await expect(page.locator('#warning-form .ant-form-item')).toHaveClass(/ant-form-item-has-warning/);
  await expect(input).toHaveClass(/ant-input-status-warning/);
  await expect(page.locator('#warning-form [role="alert"]')).toHaveCount(0);
});

test('Form renders mixed errors before warnings and focuses only the invalid field', async ({ page }) => {
  const sample = reference.cases.find((entry) => entry.id === 'mixed-error-warning')!;
  const input = page.getByLabel('Required name', { exact: true });

  await page.getByRole('button', { name: 'Submit mixed rules', exact: true }).click();

  await expect(page.getByRole('status', { name: 'Mixed warning fields', exact: true }))
    .toHaveText(JSON.stringify(sample.fields));
  await expect(page.getByRole('status', { name: 'Rejected mixed fields', exact: true }))
    .toHaveText(JSON.stringify(sample.validation!.errorFields));
  await expect(input).toBeFocused();
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await expect(input).toHaveAccessibleDescription('Name required Name recommended');
  await expect(page.locator('#mixed-warning-form .ant-form-item-explain > div'))
    .toHaveText(sample.messages!);
  await expect(input).toHaveClass(/ant-input-status-error/);
  await expect(page.locator('#mixed-warning-form .ant-form-item-has-warning')).toHaveCount(0);
});

test('Form updates warning messages on input and clears them on native reset', async ({ page }) => {
  const input = page.getByLabel('Recommended name', { exact: true });
  await page.getByRole('button', { name: 'Validate warnings', exact: true }).click();
  await expect(input).toHaveAccessibleDescription('Name recommended');

  await input.fill('Anna');
  await input.blur();

  await expect(input).toHaveAccessibleDescription('Optional name');
  await expect(page.locator('#warning-form .ant-form-item-has-warning')).toHaveCount(0);
  await input.fill('');
  await input.blur();
  await expect(input).toHaveAccessibleDescription('Name recommended');
  await page.getByRole('button', { name: 'Reset warnings', exact: true }).click();

  const reset = reference.cases.find((entry) => entry.id === 'required-warning-reset')!;
  await expect(page.getByRole('status', { name: 'Warning fields', exact: true }))
    .toHaveText(JSON.stringify(reset.fields));
  await expect(input).toHaveAccessibleDescription('Optional name');
});

test('FormList exposes source warning metadata without rejecting submit', async ({ page }) => {
  const sample = reference.cases.find((entry) => entry.id === 'list-warning')!;

  await page.getByRole('button', { name: 'Submit warning list', exact: true }).click();

  await expect(page.getByRole('status', { name: 'List warning meta', exact: true }))
    .toHaveText(JSON.stringify(sample.meta));
  await expect(page.getByRole('status', { name: 'List warning fields', exact: true }))
    .toHaveText(JSON.stringify(sample.fields));
  await expect(page.getByRole('status', { name: 'Submitted warning list', exact: true }))
    .toHaveText(JSON.stringify(sample.values));
  await expect(page.locator('#list-warning-form [data-ant-form-error-message]')).toHaveText(['Add a user']);
  await page.getByRole('button', { name: 'Add warning user', exact: true }).click();

  await expect(page.getByRole('status', { name: 'List warning meta', exact: true }))
    .toHaveText('{"errors":[],"warnings":[]}');
  await expect(page.locator('#list-warning-form [data-ant-form-error-list]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Reset warning list', exact: true }).click();
  await expect(page.getByRole('status', { name: 'List warning meta', exact: true }))
    .toHaveText('{"errors":[],"warnings":[]}');
});

for (const operation of ['reset', 'remove'] as const) {
  test(`Form ignores a delayed warning after ${operation}`, async ({ page }) => {
    await page.getByRole('button', { name: 'Toggle pending field', exact: true }).click();
    await page.getByRole('button', { name: 'Validate warnings', exact: true }).click();
    await expect(page.getByRole('status', { name: 'Pending warning count', exact: true }))
      .toHaveText('1');

    await page.getByRole('button', {
      name: operation === 'reset' ? 'Reset warnings' : 'Toggle pending field', exact: true
    }).click();
    await page.getByRole('button', { name: 'Complete warnings', exact: true }).click();

    await expect(page.getByRole('status', { name: 'Warning validation', exact: true }))
      .toHaveText('outdated');
    await expect(page.getByRole('status', { name: 'Detail warnings', exact: true })).toHaveText('[]');
    await expect(page.getByText('Delayed warning', { exact: true })).toHaveCount(0);
  });
}
