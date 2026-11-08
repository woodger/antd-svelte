import { test, expect } from './test';
import reference from './fixtures/ant-design-form-validate-messages-reference.json' with { type: 'json' };
import { validateMessagesCorrections } from './fixtures/form-validate-messages-cases';

for (const entry of reference.cases) {
  test(`Form validates source templates and recorded native outcomes for ${entry.sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=form-validate-messages');
    await page.getByRole('combobox', { name: 'Template sample', exact: true })
      .selectOption(entry.sample.id);
    await page.getByRole('button', { name: 'Validate templates', exact: true }).click();
    const errors = validateMessagesCorrections[entry.sample.id] ?? entry.errors;

    await expect(page.getByRole('status', { name: 'Template report', exact: true }))
      .toHaveText(JSON.stringify({ valid: entry.valid, errors,
        warnings: entry.warnings, functionCalls: entry.functionCalls }));
    await expect(page.getByRole('textbox', { name: 'Template field', exact: true }))
      .toHaveAccessibleDescription([...errors, ...entry.warnings].join(' '));
  });
}

test('Form local templates update after mount and restore provider messages', async ({ page }) => {
  await page.goto('/?fixture=form-validate-messages');
  await page.getByRole('combobox', { name: 'Template sample', exact: true })
    .selectOption('config-required');
  const report = page.getByRole('status', { name: 'Template report', exact: true });
  const validate = page.getByRole('button', { name: 'Validate templates', exact: true });
  const toggle = page.getByRole('button', { name: 'Toggle local templates', exact: true });

  await validate.click();
  await expect(report).toContainText('Outer Field label');
  await toggle.click();
  await expect(report).toContainText('Outer Field label');
  await validate.click();
  await expect(report).toContainText('Updated local Field label');
  await toggle.click();
  await validate.click();
  await expect(report).toContainText('Outer Field label');
});

test('Form provider templates isolate nested and sibling models during reactive updates', async ({ page }) => {
  await page.goto('/?fixture=form-validate-messages');
  await page.getByRole('checkbox', { name: 'Show template scopes', exact: true }).check();
  const scopes = page.getByRole('region', { name: 'Template scope cases', exact: true });
  const outer = scopes.locator('[data-message-case="outer-scope"]');
  const inner = scopes.locator('[data-message-case="inner-scope"]');
  const sibling = scopes.locator('[data-message-case="sibling-scope"]');
  const validate = async () => {
    for (const scope of [outer, inner, sibling]) {
      await scope.getByRole('button', { name: 'Validate templates', exact: true }).click();
    }
  };
  const report = (scope: typeof outer) => scope.getByRole('status', { name: 'Template report' });

  await validate();
  await expect(report(outer)).toContainText('Outer Field label');
  await expect(report(inner)).toContainText('Inner Field label');
  await expect(report(sibling)).toContainText('Outer Field label');
  await scopes.getByRole('button', { name: 'Toggle outer templates', exact: true }).click();
  await validate();
  await expect(report(outer)).toContainText('Updated outer Field label');
  await expect(report(inner)).toContainText('Inner Field label');
  await expect(report(sibling)).toContainText('Updated outer Field label');
  await scopes.getByRole('button', { name: 'Toggle inner templates', exact: true }).click();
  await validate();
  await expect(report(outer)).toContainText('Updated outer Field label');
  await expect(report(inner)).toContainText('Updated inner Field label');
  await expect(report(sibling)).toContainText('Updated outer Field label');
});

test('Form releases templates from retained models on replacement and unmount without a DOM wrapper', async ({ page }) => {
  await page.goto('/?fixture=form-validate-messages');
  await page.getByRole('checkbox', { name: 'Show template scopes', exact: true }).check();
  const scope = page.getByRole('region', { name: 'Template lifecycle cases', exact: true });
  const report = scope.getByRole('status', { name: 'Template lifecycle report', exact: true });
  const validate = scope.getByRole('button', { name: 'Validate retained models', exact: true });
  const defaults = ['Заполните это поле.'];
  const mounted = ['Mounted Field label'];

  await validate.click();
  await expect(report).toHaveText(JSON.stringify([mounted, defaults]));
  await scope.getByRole('button', { name: 'Switch template model', exact: true }).click();
  await validate.click();
  await expect(report).toHaveText(JSON.stringify([defaults, mounted]));
  await scope.getByRole('button', { name: 'Toggle template Form', exact: true }).click();
  await validate.click();
  await expect(report).toHaveText(JSON.stringify([defaults, defaults]));
  await scope.getByRole('button', { name: 'Toggle template Form', exact: true }).click();
  await validate.click();
  await expect(report).toHaveText(JSON.stringify([defaults, mounted]));
});
