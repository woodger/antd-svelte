import { test, expect } from './test';
import reference from './fixtures/ant-design-tour-theme-reference.json' with { type: 'json' };
import zIndexObservation from './fixtures/ant-design-tour-z-index-observation.json' with { type: 'json' };
import { snapshotTourTheme } from './tour-theme-metrics';

test.use({ viewport: reference.viewport });
test.beforeEach(async ({ page }) => { await page.goto('/?fixture=tour-theme'); });

for (const sample of reference.cases) {
  for (const [scope, expected] of Object.entries(sample.scopes)) {
    test(`Tour ${scope} theme matches source sections and controls for ${sample.name}`,
      async ({ page }) => {
        await page.getByLabel('Tour theme preset', { exact: true }).selectOption(sample.name);
        await page.getByLabel('Tour theme scope', { exact: true }).selectOption(scope);
        await expect(page.locator('.ant-tour')).toBeVisible();

        await expect.poll(() => page.evaluate(snapshotTourTheme)).toEqual(expected);
      });
  }

  for (const [mode, expected] of Object.entries(sample.modes)) {
    test(`Tour ${mode} theme matches source sections and controls for ${sample.name}`,
      async ({ page }) => {
        await page.getByLabel('Tour theme preset', { exact: true }).selectOption(sample.name);
        const selected = mode === 'previousHover' || mode === 'nextHover' ? 'primary' : mode;
        await page.getByLabel('Tour theme mode', { exact: true }).selectOption(selected);
        await expect(page.locator('.ant-tour')).toBeVisible();
        if (mode === 'previousHover') await page.locator('.ant-tour-prev-btn').hover();
        if (mode === 'nextHover') await page.locator('.ant-tour-next-btn').hover();

        await expect.poll(() => page.evaluate(snapshotTourTheme)).toEqual(expected);
      });
  }
}

test('Tour token updates preserve the step, focused editor, caret and existing action buttons',
  async ({ page }) => {
    await page.getByLabel('Show Tour input', { exact: true }).dispatchEvent('click');
    const input = page.getByLabel('Tour draft', { exact: true });
    const popup = page.locator('.ant-tour');
    const next = popup.locator('.ant-tour-next-btn');
    const originalInput = await input.elementHandle();
    const originalPopup = await popup.elementHandle();
    const originalNext = await next.elementHandle();
    await input.fill('draft text');
    await input.evaluate(node => (node as HTMLInputElement).setSelectionRange(1, 5, 'backward'));

    await page.getByRole('button', { name: 'Update Tour tokens', exact: true })
      .dispatchEvent('click');

    await expect(popup.locator('.ant-tour-close')).toHaveCSS('width', '40px');
    expect(await input.evaluate((node, old) => node === old, originalInput)).toBe(true);
    expect(await popup.evaluate((node, old) => node === old, originalPopup)).toBe(true);
    expect(await next.evaluate((node, old) => node === old, originalNext)).toBe(true);
    await expect(input).toBeFocused();
    await expect(input).toHaveValue('draft text');
    expect(await input.evaluate(node => {
      const input = node as HTMLInputElement;
      return [input.selectionStart, input.selectionEnd, input.selectionDirection];
    })).toEqual([1, 5, 'backward']);
    await expect(page.getByLabel('Tour theme events', { exact: true })).toHaveText('[]');

    await next.click();

    await expect(popup.locator('.ant-tour-title')).toHaveText('Last');
    await expect(page.getByLabel('Tour theme events', { exact: true })).toHaveText('["change:2"]');
  });

test('Tour inheritance reset keeps its current step and focused action button', async ({ page }) => {
  await page.getByLabel('Tour theme scope', { exact: true }).selectOption('nested');
  const popup = page.locator('.ant-tour');
  const action = popup.locator('.ant-tour-next-btn');
  const originalPopup = await popup.elementHandle();
  const originalAction = await action.elementHandle();
  await action.focus();

  await page.getByLabel('Inherit Tour theme', { exact: true }).dispatchEvent('click');

  const expected = reference.cases.find(item => item.name === 'default')!.scopes.nested;
  await expect(popup).toHaveCSS('font-family', expected.root!['font-family']);
  await expect(popup).toHaveCSS('font-size', '16px');
  expect(await popup.evaluate((node, old) => node === old, originalPopup)).toBe(true);
  expect(await action.evaluate((node, old) => node === old, originalAction)).toBe(true);
  await expect(action).toBeFocused();
  await expect(popup.locator('.ant-tour-title')).toHaveText('Stored step');
  await expect(page.getByLabel('Tour theme events', { exact: true })).toHaveText('[]');
});

test('Tour returns to legacy styling without losing its editor and cleans up every layer',
  async ({ page }) => {
    await page.getByLabel('Show Tour input', { exact: true }).dispatchEvent('click');
    const popup = page.locator('.ant-tour');
    const input = page.getByLabel('Tour draft', { exact: true });
    const original = await input.elementHandle();
    await input.fill('unfinished value');

    await page.getByLabel('Apply source Tour theme', { exact: true }).dispatchEvent('click');

    await expect(popup).toHaveCSS('font-size', '14px');
    await expect(popup).toHaveCSS('z-index', '1001');
    await expect(popup.locator('.ant-tour-close')).toHaveCSS('width', '22px');
    expect(await input.evaluate((node, old) => node === old, original)).toBe(true);
    await expect(input).toBeFocused();
    await expect(input).toHaveValue('unfinished value');

    await page.getByLabel('Mount themed Tour', { exact: true }).dispatchEvent('click');

    await expect(popup).toHaveCount(0);
    await expect(page.locator('.ant-tour-mask, .ant-tour-target-placeholder')).toHaveCount(0);
    expect(await original!.evaluate(node => node.isConnected)).toBe(false);
  });

test('Tour keeps the documented runtime layer and gives the explicit zIndex prop priority',
  async ({ page }) => {
    await page.getByLabel('Tour theme preset', { exact: true }).selectOption('component-tokens');
    const popup = page.locator('.ant-tour');
    const original = await popup.elementHandle();
    const tokenCase = zIndexObservation.cases.find(item => item.name === 'tokens')!;
    await expect(popup).toHaveCSS('z-index', tokenCase.metrics.root!['z-index']);
    await expect(popup).toHaveCSS('--ant-tour-z-index-popup', '1750');

    await page.getByLabel('Use explicit Tour layer', { exact: true }).dispatchEvent('click');

    const explicit = zIndexObservation.cases.find(item => item.name === 'explicit-prop')!;
    await expect(popup).toHaveCSS('z-index', explicit.metrics.root!['z-index']);
    expect(await popup.evaluate((node, old) => node === old, original)).toBe(true);
    await expect(page.getByLabel('Tour theme events', { exact: true })).toHaveText('[]');
  });
