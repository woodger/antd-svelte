import { test, expect } from './test';
import reference from './fixtures/ant-design-form-theme-reference.json' with { type: 'json' };
import { snapshotFormTheme } from './form-theme-metrics';

test.use({ viewport: reference.viewport });

for (const sample of reference.cases) {
  test(`Form tokens match source labels, spacing, controls and scopes for ${sample.name}`,
    async ({ page }) => {
      await page.goto('/?fixture=form-theme');
      await page.getByLabel('Form theme preset', { exact: true }).selectOption(sample.name);

      await expect.poll(() => page.evaluate(snapshotFormTheme)).toEqual(sample.metrics);
    });
}

test('Form theme updates preserve field DOM, focus, selection, values and submission',
  async ({ page }) => {
    await page.goto('/?fixture=form-theme');
    const root = page.locator('[data-form-theme="normal"]');
    const input = root.getByRole('textbox', { name: 'Form theme draft normal', exact: true });
    const original = await input.elementHandle();
    await input.fill('Retained field');
    await input.focus();
    await input.evaluate(node => (node as HTMLInputElement).setSelectionRange(1, 8));
    await page.getByRole('button', { name: 'Update Form tokens', exact: true }).dispatchEvent('click');

    const updated = reference.cases.find(sample => sample.name === 'updated-tokens')!;
    await expect.poll(() => page.evaluate(snapshotFormTheme)).toEqual(updated.metrics);
    expect(await input.evaluate((node, old) => node === old, original)).toBe(true);
    await expect(input).toBeFocused();
    await expect(input).toHaveValue('Retained field');
    expect(await input.evaluate(node => [
      (node as HTMLInputElement).selectionStart,
      (node as HTMLInputElement).selectionEnd
    ])).toEqual([1, 8]);
    expect(await root.locator('form').evaluate(node =>
      new FormData(node as HTMLFormElement).get('title'))).toBe('Retained field');
    await expect(root.getByLabel('Form theme submissions normal', { exact: true })).toHaveText('0');

    await root.getByRole('button', { name: 'Submit themed form', exact: true }).click();

    await expect(root.getByLabel('Form theme submissions normal', { exact: true })).toHaveText('1');
    await expect(root.getByLabel('Form theme submitted normal', { exact: true }))
      .toHaveText('Retained field');
    await page.getByLabel('Mount themed Form controls', { exact: true }).uncheck();

    expect(await original!.evaluate(node => node.isConnected)).toBe(false);
    await expect(page.locator('[data-form-theme="normal"]')).toHaveCount(0);
    await expect(page.locator('[data-form-theme="sibling"] label[for]'))
      .toHaveCSS('font-size', '18px');
  });

test('Form retains validation errors and resets its model after a theme update', async ({ page }) => {
  await page.goto('/?fixture=form-theme');
  const root = page.locator('[data-form-theme="normal"]');
  const input = root.getByRole('textbox', { name: 'Form theme draft normal', exact: true });
  const original = await input.elementHandle();
  const description = await input.getAttribute('aria-describedby');
  await input.fill('');
  await input.press('Tab');
  await expect(root.getByRole('alert')).toHaveText('Field required');
  await expect(input).toHaveAttribute('aria-invalid', 'true');

  await page.getByRole('button', { name: 'Update Form tokens', exact: true }).dispatchEvent('click');

  await expect(root.locator('label[for]')).toHaveCSS('height', '36px');
  await expect(root.getByRole('alert')).toHaveText('Field required');
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await expect(input).toHaveAttribute('aria-describedby', description!);
  expect(await input.evaluate((node, old) => node === old, original)).toBe(true);
  await root.getByRole('button', { name: 'Reset themed form', exact: true }).click();

  await expect(input).toHaveValue('Draft');
  await expect(input).not.toHaveAttribute('aria-invalid', 'true');
  await expect(root.getByRole('alert')).toHaveCount(0);
  await expect(root.locator('label[for]')).toHaveCSS('height', '36px');
  await expect(root.getByLabel('Form theme submissions normal', { exact: true })).toHaveText('0');
});

test('Form resets inherited item tokens without replacing its nested field', async ({ page }) => {
  await page.goto('/?fixture=form-theme');
  const root = page.locator('[data-form-theme="nested"]');
  const input = root.getByRole('textbox', { name: 'Form theme draft nested', exact: true });
  const original = await input.elementHandle();
  await input.fill('Nested field');
  await page.getByLabel('Inherit Form theme', { exact: true }).uncheck();

  const defaults = reference.cases.find(sample => sample.name === 'default')!;
  await expect.poll(() => page.evaluate(snapshotFormTheme).then(metrics => metrics.nested))
    .toEqual(defaults.metrics.nested);
  expect(await input.evaluate((node, old) => node === old, original)).toBe(true);
  await expect(input).toHaveValue('Nested field');
  await expect(page.locator('[data-form-theme="normal"] label[for]'))
    .toHaveCSS('font-size', '19px');
});

test('Form restores legacy item styles when the source theme is removed', async ({ page }) => {
  await page.goto('/?fixture=form-theme');
  const root = page.locator('[data-form-theme="normal"]');
  const input = root.getByRole('textbox', { name: 'Form theme draft normal', exact: true });
  const original = await input.elementHandle();
  await input.focus();
  await page.getByLabel('Apply source Form theme', { exact: true }).dispatchEvent('click');

  await expect(root.locator('label[for]')).toHaveCSS('font-size', '14px');
  await expect(root.locator('.ant-form-item')).toHaveCSS('margin-bottom', '24px');
  await expect(input).toBeFocused();
  await expect(input).toHaveValue('Draft');
  expect(await input.evaluate((node, old) => node === old, original)).toBe(true);
  await expect(page.locator('[data-form-theme="sibling"] label[for]'))
    .toHaveCSS('font-size', '18px');
});
