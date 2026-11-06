import { test, expect } from './test';
import reference from './fixtures/ant-design-list-theme-reference.json' with { type: 'json' };
import { snapshotListTheme } from './list-theme-metrics';

test.use({ viewport: reference.viewport });

for (const sample of reference.cases) {
  test(`List tokens match source items, Meta, grid and empty styles for ${sample.name}`,
    async ({ page }) => {
      if ('viewport' in sample) await page.setViewportSize(sample.viewport!);
      await page.goto('/?fixture=list-theme');
      await page.getByLabel('List theme preset', { exact: true }).selectOption(sample.name);

      await expect.poll(() => page.evaluate(snapshotListTheme)).toEqual(sample.metrics);
    });
}

test('List theme updates preserve pagination, keyed row state, draft, focus and selection',
  async ({ page }) => {
    await page.goto('/?fixture=list-theme');
    const root = page.locator('[data-list-theme="normal"] [data-list-part="normal"]');
    await root.getByRole('button', { name: 'Страница 2', exact: true }).click();
    const input = root.getByRole('textbox', { name: 'List theme draft normal Gamma', exact: true });
    const original = await input.elementHandle();
    await input.fill('Retained List draft');
    await root.getByRole('button', { name: 'Increment normal Gamma', exact: true }).click();
    await input.focus();
    await input.evaluate(node => (node as HTMLInputElement).setSelectionRange(1, 8));

    await page.getByRole('button', { name: 'Update List tokens', exact: true }).dispatchEvent('click');

    const updated = reference.cases.find(sample => sample.name === 'updated-tokens')!;
    await expect.poll(() => page.evaluate(snapshotListTheme)).toEqual(updated.metrics);
    expect(await input.evaluate((node, old) => node === old, original)).toBe(true);
    await expect(input).toBeFocused();
    await expect(input).toHaveValue('Retained List draft');
    expect(await input.evaluate(node => [
      (node as HTMLInputElement).selectionStart,
      (node as HTMLInputElement).selectionEnd
    ])).toEqual([1, 8]);
    await expect(root.getByRole('button', { name: 'Increment normal Gamma', exact: true }))
      .toHaveText('1');
    await expect(root.locator('.ant-pagination [aria-current="page"]')).toHaveText('2');
    await expect(page.getByLabel('List theme events normal', { exact: true }))
      .toHaveText('["page:2:2"]');
    await page.getByLabel('Mount themed List controls', { exact: true }).dispatchEvent('click');

    expect(await original!.evaluate(node => node.isConnected)).toBe(false);
    await expect(page.locator('[data-list-theme="normal"]')).toHaveCount(0);
    await expect(page.locator('[data-list-theme="sibling"] .ant-list').first())
      .toHaveCSS('font-size', '18px');
  });

test('List grid theme updates preserve the Col field and its local state', async ({ page }) => {
  await page.goto('/?fixture=list-theme');
  const root = page.locator('[data-list-theme="normal"] [data-list-part="grid"]');
  const input = root.getByRole('textbox', { name: 'List theme draft normal Alpha', exact: true });
  const original = await input.elementHandle();
  const column = await root.locator('.ant-col').first().elementHandle();
  await input.fill('Retained grid draft');
  await input.focus();

  await page.getByRole('button', { name: 'Update List tokens', exact: true }).dispatchEvent('click');

  const updated = reference.cases.find(sample => sample.name === 'updated-tokens')!;
  await expect.poll(() => page.evaluate(snapshotListTheme).then(metrics => metrics.normal.grid))
    .toEqual(updated.metrics.normal.grid);
  expect(await input.evaluate((node, old) => node === old, original)).toBe(true);
  expect(await input.evaluate((node, old) => node.closest('.ant-col') === old, column)).toBe(true);
  await expect(input).toHaveValue('Retained grid draft');
  await expect(input).toBeFocused();
  await expect(page.getByLabel('List theme events normal', { exact: true })).toHaveText('[]');
});

test('List resets inherited tokens without replacing the nested field', async ({ page }) => {
  await page.goto('/?fixture=list-theme');
  const root = page.locator('[data-list-theme="nested"] [data-list-part="normal"]');
  const input = root.getByRole('textbox', { name: 'List theme draft nested Alpha', exact: true });
  const original = await input.elementHandle();
  await input.fill('Nested List draft');

  await page.getByLabel('Inherit List theme', { exact: true }).dispatchEvent('click');

  const defaults = reference.cases.find(sample => sample.name === 'default')!;
  await expect.poll(() => page.evaluate(snapshotListTheme).then(metrics => metrics.nested))
    .toEqual(defaults.metrics.nested);
  expect(await input.evaluate((node, old) => node === old, original)).toBe(true);
  await expect(input).toBeFocused();
  await expect(input).toHaveValue('Nested List draft');
  await expect(page.locator('[data-list-theme="normal"] .ant-list').first())
    .toHaveCSS('font-size', '20px');
});

test('List restores legacy tokens and preserves the field when its source theme is removed',
  async ({ page }) => {
    await page.goto('/?fixture=list-theme');
    const root = page.locator('[data-list-theme="normal"] [data-list-part="normal"]');
    const input = root.getByRole('textbox', { name: 'List theme draft normal Alpha', exact: true });
    const original = await input.elementHandle();
    await input.fill('Legacy List draft');

    await page.getByLabel('Apply source List theme', { exact: true }).dispatchEvent('click');

    await expect(root.locator('.ant-list')).toHaveCSS('font-size', '14px');
    await expect(root.locator('.ant-list-item-meta-description').first())
      .toHaveCSS('font-size', '14px');
    await expect(root.locator('.ant-list-header')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    expect(await input.evaluate((node, old) => node === old, original)).toBe(true);
    await expect(input).toBeFocused();
    await expect(input).toHaveValue('Legacy List draft');
    await expect(page.getByLabel('List theme events normal', { exact: true })).toHaveText('[]');
    await expect(page.locator('[data-list-theme="sibling"] .ant-list').first())
      .toHaveCSS('font-size', '18px');
  });
