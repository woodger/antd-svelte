import { test, expect } from './test';
import reference from './fixtures/ant-design-form-rule-factories-reference.json' with { type: 'json' };

for (const entry of reference.cases) {
  test(`Form rule factories match source settings and current model access for ${entry.sample.id} ${entry.phase}`, async ({ page }) => {
    await page.goto('/?fixture=form-rule-factories');
    await page.getByRole('combobox', { name: 'Rule factory sample', exact: true })
      .selectOption(entry.sample.id);
    if (entry.phase === 'updated') {
      await page.getByRole('button', { name: 'Validate factory field', exact: true }).click();
      await page.getByRole('button', { name: 'Increase factory minimum', exact: true }).click();
    }
    await page.getByRole('button', { name: 'Validate factory field', exact: true }).click();

    await expect.poll(async () => JSON.parse((await page.getByRole('status', {
      name: 'Factory report', exact: true
    }).textContent())!)).toEqual({
      valid: entry.valid, errors: entry.errors, warnings: entry.warnings, store: entry.store,
      factory: { ...entry.factory, sameInstance: true }
    });
    await expect(page.getByLabel('Factory field', { exact: true }))
      .toHaveJSProperty('required', entry.required);
  });
}
