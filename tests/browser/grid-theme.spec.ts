import { test, expect } from './test';
import reference from './fixtures/ant-design-grid-theme-reference.json' with { type: 'json' };
import { snapshotGridTheme } from './grid-theme-metrics';

test.use({ viewport: reference.viewport });
test.beforeEach(async ({ page }) => { await page.goto('/?fixture=grid-theme'); });

for (const sample of reference.cases) {
  for (const [scope, expected] of Object.entries(sample.scopes)) {
    test(`Grid ${scope} theme matches source typography and layout for ${sample.name}`,
      async ({ page }) => {
        await page.getByLabel('Grid theme preset', { exact: true }).selectOption(sample.name);
        await page.getByLabel('Grid theme scope', { exact: true }).selectOption(scope);
        await page.mouse.move(790, 990);

        await expect.poll(() => page.evaluate(snapshotGridTheme)).toEqual(expected);
      });
  }
  for (const [mode, expected] of Object.entries(sample.modes)) {
    test(`Grid ${mode} theme matches source typography and layout for ${sample.name}`,
      async ({ page }) => {
        await page.getByLabel('Grid theme preset', { exact: true }).selectOption(sample.name);
        await page.getByLabel('Grid theme mode', { exact: true }).selectOption(mode);
        await page.mouse.move(790, 990);

        await expect.poll(() => page.evaluate(snapshotGridTheme)).toEqual(expected);
      });
  }
}

test('Grid token updates preserve Row and Col refs, slot input, selection and actions',
  async ({ page }) => {
    await page.getByLabel('Grid theme mode', { exact: true }).selectOption('stateful');
    const root = page.locator('#grid-theme-control');
    const input = root.getByRole('textbox', { name: 'Grid draft', exact: true });
    await input.fill('Grid draft retained');
    await input.evaluate(node => (node as HTMLInputElement).setSelectionRange(1, 5, 'backward'));
    const original = await input.elementHandle();
    const originalRow = await root.locator('.ant-row').elementHandle();
    const originalCol = await root.locator('.ant-col').first().elementHandle();

    await page.getByRole('button', { name: 'Update Grid tokens', exact: true }).dispatchEvent('click');

    await expect(root.locator('.ant-row')).toHaveCSS('font-size', '23px');
    await expect(root.locator('.ant-col').first()).toHaveCSS('font-size', '23px');
    await expect(root.locator('.ant-col').first()).toHaveCSS('font-family', 'serif');
    await expect(root.locator('.ant-row')).toHaveCSS('row-gap', '18px');
    await expect(root.locator('.ant-col').first()).toHaveCSS('padding-left', '8px');
    await expect(input).toHaveValue('Grid draft retained');
    await expect(input).toBeFocused();
    expect(await input.evaluate((node, old) => node === old, original)).toBe(true);
    expect(await root.locator('.ant-row').evaluate((node, old) => node === old, originalRow)).toBe(true);
    expect(await root.locator('.ant-col').first().evaluate((node, old) => node === old,
      originalCol)).toBe(true);
    expect(await input.evaluate(node => {
      const field = node as HTMLInputElement;
      return [field.selectionStart, field.selectionEnd, field.selectionDirection];
    })).toEqual([1, 5, 'backward']);
    expect(await root.getByRole('form').evaluate(node =>
      new FormData(node as HTMLFormElement).get('draft'))).toBe('Grid draft retained');
    await expect(root.getByLabel('Grid theme refs', { exact: true })).toHaveText('true:true');
    await expect(page.locator('#grid-theme-neighbor .ant-col')).toHaveCSS('font-size', '17px');

    await root.getByRole('button', { name: 'Grid action', exact: true }).click();

    await expect(root.getByLabel('Grid theme actions', { exact: true })).toHaveText('1');
  });

test('Grid inheritance reset preserves slots while restoring independent typography',
  async ({ page }) => {
    await page.getByLabel('Grid theme mode', { exact: true }).selectOption('stateful');
    await page.getByLabel('Grid theme scope', { exact: true }).selectOption('nested');
    const root = page.locator('#grid-theme-control');
    const input = root.getByRole('textbox', { name: 'Grid draft', exact: true });
    await input.fill('Nested Grid');
    const original = await input.elementHandle();
    await expect(root.locator('.ant-col').first()).toHaveCSS('font-size', '16px');

    await page.getByLabel('Inherit Grid theme', { exact: true }).dispatchEvent('click');

    await expect(root.locator('.ant-col').first()).toHaveCSS('font-family', /apple-system/);
    await expect(input).toBeFocused();
    await expect(input).toHaveValue('Nested Grid');
    expect(await input.evaluate((node, old) => node === old, original)).toBe(true);
    await expect(page.locator('#grid-theme-neighbor .ant-col')).toHaveCSS('font-family', 'cursive');
  });

test('Grid legacy theme reset preserves slot state and removes source aliases', async ({ page }) => {
  await page.getByLabel('Grid theme mode', { exact: true }).selectOption('stateful');
  const root = page.locator('#grid-theme-control');
  const input = root.getByRole('textbox', { name: 'Grid draft', exact: true });
  await input.fill('Legacy Grid');
  const original = await input.elementHandle();

  await page.getByLabel('Apply source Grid theme', { exact: true }).dispatchEvent('click');

  await expect(root.locator('.ant-row')).toHaveCSS('font-size', '14px');
  await expect(root.locator('.ant-col').first()).toHaveCSS('font-size', '14px');
  await expect(input).toBeFocused();
  await expect(input).toHaveValue('Legacy Grid');
  expect(await input.evaluate((node, old) => node === old, original)).toBe(true);

  await page.getByLabel('Mount themed Grid', { exact: true }).dispatchEvent('click');

  await expect(root).toHaveCount(0);
  expect(await original?.evaluate(node => node.isConnected)).toBe(false);
});

for (const [mode, rowSize, colSize] of [
  ['row-style-canonical', '27px', '20px'],
  ['col-style-canonical', '20px', '29px']
]) {
  test(`Grid canonical ant variables retain native style priority for ${mode}`,
    async ({ page }) => {
      await page.getByLabel('Grid theme preset', { exact: true }).selectOption('custom-css-prefix');
      await page.getByLabel('Grid theme mode', { exact: true }).selectOption(mode);
      const root = page.locator('#grid-theme-control');

      await expect(root.locator('.ant-row')).toHaveCSS('font-size', rowSize);
      await expect(root.locator('.ant-col').first()).toHaveCSS('font-size', colSize);
      await expect(root.locator('.ant-col').last()).toHaveCSS('font-size', '20px');
    });
}
