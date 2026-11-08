import { test, expect } from './test';
import reference from './fixtures/ant-design-form-transform-reference.json' with { type: 'json' };

for (const entry of reference.cases) {
  test(`Form transform preserves source calls, original store and messages for ${entry.sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=form-transform');
    await page.getByRole('combobox', { name: 'Transform sample', exact: true })
      .selectOption(entry.sample.id);
    await page.getByRole('button', { name: 'Validate transformed field', exact: true }).click();
    const errors = entry.sample.kind === 'throw' ? ['Rejected'] : entry.errors;

    await expect(page.getByRole('status', { name: 'Transform validation', exact: true }))
      .toHaveText(errors.length ? 'invalid' : 'valid');
    await expect.poll(async () => JSON.parse((await page.getByRole('status', {
      name: 'Transform metadata', exact: true
    }).textContent())!)).toEqual({ errors, warnings: entry.warnings, store: entry.store, calls: entry.calls });
    if (errors.length) {
      await expect(page.getByLabel('Transformed field', { exact: true }))
        .toHaveAttribute('aria-invalid', 'true');
    }
  });
}

test('Form transform leaves native FormData, successful submit and reset values unmodified', async ({ page }) => {
  await page.goto('/?fixture=form-transform');
  const input = page.getByLabel('Transformed field', { exact: true });
  await page.getByRole('button', { name: 'Submit transformed field', exact: true }).click();

  await expect(page.getByRole('status', { name: 'Transform submission', exact: true }))
    .toHaveText('{"field":" abc "}');
  await expect(input).toHaveValue(' abc ');
  expect(await input.evaluate((node: HTMLInputElement) => new FormData(node.form!).get('field')))
    .toBe(' abc ');
  await input.fill(' xyz ');
  await page.getByRole('button', { name: 'Reset transformed field', exact: true }).click();
  await expect(input).toHaveValue(' abc ');
  await expect(page.locator('.ant-form-item-explain-error')).toHaveCount(0);
});
