import { test, expect } from './test';
import { formStatusMetrics } from './form-status-metrics';
import reference from './fixtures/ant-design-form-status-reference.json' with { type: 'json' };

for (const { sample, metrics } of reference.cases) {
  test(`Form validation status matches source classes and colors for ${sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=form-status');
    await page.getByRole('combobox', { name: 'Form status sample', exact: true })
      .selectOption(sample.id);
    const expected = structuredClone(metrics);

    // Native Input/Select помечают visual error как aria-invalid и без model errors.
    for (const value of Object.values(expected)) {
      if (value.control.includes('error')) value.ariaInvalid = 'true';
    }

    await expect.poll(() => page.evaluate(formStatusMetrics)).toEqual(expected);
  });
}

test('Form status changes preserve controls, draft, focus and selection', async ({ page }) => {
  await page.goto('/?fixture=form-status');
  const input = page.getByRole('textbox', { name: 'Input', exact: true });
  await input.fill('Edited draft');
  await input.evaluate((node: HTMLInputElement) => {
    node.setSelectionRange(1, 5);
  });
  const original = await input.elementHandle();

  for (const id of [
    'explicit-error', 'explicit-warning', 'explicit-success', 'explicit-validating',
    'explicit-empty', 'default'
  ]) {
    await page.getByRole('combobox', { name: 'Form status sample', exact: true }).evaluate(
      (node: HTMLSelectElement, value) => {
        node.value = value;
        node.dispatchEvent(new Event('change', { bubbles: true }));
      }, id
    );
    const statuses = reference.cases.find(({ sample }) => sample.id === id)!.metrics.input.root;
    await expect.poll(async () => (await page.evaluate(formStatusMetrics)).input.root)
      .toEqual(statuses);
    await expect(input).toBeFocused();
    await expect(input).toHaveValue('Edited draft');
    expect(await input.evaluate((node, previous) => node === previous, original)).toBe(true);
    expect(await input.evaluate((node: HTMLInputElement) => [node.selectionStart, node.selectionEnd]))
      .toEqual([1, 5]);
  }
});

test('Form status follows pending validation, touched success and reset without losing messages', async ({ page }) => {
  await page.goto('/?fixture=form-status');
  const sample = page.getByRole('combobox', { name: 'Form status sample', exact: true });
  await sample.selectOption('errors');
  const item = page.locator('.capture-input');
  const input = page.getByRole('textbox', { name: 'Input', exact: true });
  await expect(item).toHaveClass(/ant-form-item-has-error/);

  await page.getByRole('button', { name: 'Begin status validation', exact: true }).click();
  await expect(item).toHaveClass(/ant-form-item-is-validating/);
  await expect(item).not.toHaveClass(/ant-form-item-has-error/);
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await expect(item.locator('.ant-form-item-explain-error')).toHaveText('Invalid');
  await page.getByRole('button', { name: 'Release status validation', exact: true }).click();
  await expect(page.getByRole('status', { name: 'Status validation', exact: true }))
    .toHaveText('ready');
  await expect(item).toHaveClass(/ant-form-item-has-success/);
  await expect(input).not.toHaveAttribute('aria-invalid', 'true');
  await expect(item.locator('.ant-form-item-explain-error')).toHaveCount(0);

  await page.getByRole('button', { name: 'Reset status form', exact: true }).click();
  await expect(item).not.toHaveClass(/ant-form-item-has-success|ant-form-item-is-validating/);
  await expect(input).toHaveValue('Draft');
});

test('Form visual success or empty status retains error accessibility across control families', async ({ page }) => {
  await page.goto('/?fixture=form-status');
  await page.getByRole('button', { name: 'Show status controls', exact: true }).click();
  await page.getByRole('button', { name: 'Seed control errors', exact: true }).click();
  const items = page.locator('[class*="status-control-"]');
  await expect(items).toHaveCount(20);

  for (const status of ['success', 'warning', 'validating', '']) {
    await page.getByRole('combobox', { name: 'Control visual status', exact: true })
      .selectOption(status);
    for (const item of await items.all()) {
      await expect(item.locator('[aria-invalid="true"],[data-ant-form-invalid="true"]').first())
        .toBeAttached();
      await expect(item.locator('.ant-form-item-explain-error')).toHaveText('Stored error');
      await expect(item).not.toHaveClass(/ant-form-item-has-error/);
    }
    const description = await page.locator('.status-control-transfer .ant-transfer')
      .getAttribute('aria-describedby');
    expect(description).toBeTruthy();
    await expect(page.locator(`[id="${description}"]`)).toHaveText('Stored error');
  }

  await page.getByRole('button', { name: 'Reset control errors', exact: true }).click();
  await expect(page.locator('[class*="status-control-"] [aria-invalid="true"]')).toHaveCount(0);
  await expect(page.locator('[class*="status-control-"] [data-ant-form-invalid="true"]'))
    .toHaveCount(0);
});
