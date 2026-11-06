import { test, expect } from './test';
import reference from './fixtures/ant-design-float-button-theme-reference.json' with { type: 'json' };
import { snapshotFloatButtonTheme } from './float-button-theme-metrics';

test.use({ viewport: reference.viewport });

for (const sample of reference.cases) {
  test(`FloatButton themes match source buttons, groups and BackTop for ${sample.name}`,
    async ({ page }) => {
      await page.goto('/?fixture=float-button-theme');
      await page.getByLabel('FloatButton theme preset', { exact: true }).selectOption(sample.name);

      await expect.poll(() => page.evaluate(snapshotFloatButtonTheme)).toEqual(sample.metrics);
      await expect(page.locator('[_themestyle]')).toHaveCount(0);
    });
}

test('FloatButton theme updates retain native refs, draft, focus and form submission',
  async ({ page }) => {
    await page.goto('/?fixture=float-button-theme');
    const root = page.locator('[data-float-theme="normal"]');
    const button = root.getByRole('button', { name: 'Float theme action normal', exact: true });
    const original = await button.elementHandle();
    const input = root.getByRole('textbox', { name: 'Float theme draft normal', exact: true });
    await input.fill('Retained floating draft');
    await input.focus();
    await input.evaluate(node => (node as HTMLInputElement).setSelectionRange(1, 8));
    await page.getByRole('button', { name: 'Update FloatButton tokens', exact: true })
      .dispatchEvent('click');

    const updated = reference.cases.find(sample => sample.name === 'updated-aliases')!;
    await expect.poll(() => page.evaluate(snapshotFloatButtonTheme)).toEqual(updated.metrics);
    expect(await button.evaluate((node, old) => node === old, original)).toBe(true);
    await expect(input).toHaveValue('Retained floating draft');
    await expect(input).toBeFocused();
    expect(await input.evaluate(node => [
      (node as HTMLInputElement).selectionStart,
      (node as HTMLInputElement).selectionEnd
    ])).toEqual([1, 8]);
    await expect(root.getByLabel('Float theme ref normal', { exact: true })).toHaveText('mounted');

    await button.focus();
    await button.press('Space');

    await expect(root.getByLabel('Float theme submissions normal', { exact: true })).toHaveText('1');
    await expect(root.getByLabel('Float theme data normal', { exact: true }))
      .toHaveText('Retained floating draft');
    await expect(button).toBeFocused();
    await page.getByLabel('Mount themed FloatButton controls', { exact: true }).uncheck();

    expect(await original!.evaluate(node => node.isConnected)).toBe(false);
    await expect(page.locator('[data-float-theme="normal"]')).toHaveCount(0);
    await expect(page.locator('[data-float-theme="sibling"] .ant-float-btn')).toHaveCSS('width', '48px');
  });

test('FloatButton restores legacy defaults when its source theme is removed', async ({ page }) => {
  await page.goto('/?fixture=float-button-theme');
  const button = page.locator('[data-float-theme="normal"] .ant-float-btn');
  await expect(button).toHaveCSS('width', '52px');
  const original = await button.elementHandle();
  await button.focus();
  await page.getByLabel('Apply source FloatButton theme', { exact: true }).dispatchEvent('click');

  await expect(button).toHaveCSS('width', '40px');
  await expect(button).toHaveCSS('bottom', '48px');
  await expect(button).toBeFocused();
  expect(await button.evaluate((node, old) => node === old, original)).toBe(true);
  await expect(page.locator('[data-float-theme="sibling"] .ant-float-btn')).toHaveCSS('width', '48px');
});

test('FloatButton resets inherited aliases while retaining its explicit nested size', async ({ page }) => {
  await page.goto('/?fixture=float-button-theme');
  const button = page.locator('[data-float-theme="nested"] .ant-float-btn');
  await expect(button).toHaveCSS('width', '44px');
  await expect(button).toHaveCSS('padding-top', '8px');
  const original = await button.elementHandle();
  await page.getByLabel('Inherit FloatButton theme', { exact: true }).uncheck();

  await expect(button).toHaveCSS('width', '44px');
  await expect(button).toHaveCSS('padding-top', '4px');
  await expect(button).toHaveCSS('bottom', '48px');
  expect(await button.evaluate((node, old) => node === old, original)).toBe(true);
  await expect(page.locator('[data-float-theme="normal"] .ant-float-btn')).toHaveCSS('width', '52px');
});
