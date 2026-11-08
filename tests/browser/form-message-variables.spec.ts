import { test, expect } from './test';
import reference from './fixtures/ant-design-form-message-variables-reference.json' with { type: 'json' };
import { messageVariablesCorrections } from './fixtures/form-message-variables-cases';

for (const entry of reference.cases) {
  test(`Form messages interpolate source aliases and recorded corrections for ${entry.sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=form-message-variables');
    await page.getByRole('combobox', { name: 'Message variable sample', exact: true })
      .selectOption(entry.sample.id);
    await page.getByRole('button', { name: 'Validate message variables', exact: true }).click();
    const expected = messageVariablesCorrections[entry.sample.id] ?? entry.errors;

    await expect(page.getByRole('status', { name: 'Message variable report', exact: true }))
      .toHaveText(JSON.stringify(expected));
    await expect(page.getByRole('textbox', { name: 'Message variable field', exact: true }))
      .toHaveAccessibleDescription(expected.join(' '));
  });
}

test('Form messages read reactive variables again after mount and restore the field label', async ({ page }) => {
  await page.goto('/?fixture=form-message-variables');
  const validate = page.getByRole('button', { name: 'Validate message variables', exact: true });
  const toggle = page.getByRole('button', { name: 'Toggle message label', exact: true });
  const report = page.getByRole('status', { name: 'Message variable report', exact: true });

  await validate.click();
  await expect(report).toHaveText('["Field label/field"]');
  await toggle.click();
  await validate.click();
  await expect(report).toHaveText('["Updated label/field"]');
  await toggle.click();
  await validate.click();
  await expect(report).toHaveText('["Field label/field"]');
});
