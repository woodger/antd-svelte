import { test, expect } from './test';
import reference from './fixtures/ant-design-flex-source-reference.json' with { type: 'json' };
import { snapshotFlexSource } from './flex-source-metrics';

test.use({ viewport: reference.viewport });

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=flex-source');
  await expect(page.getByRole('heading', { name: 'Source Flex API', exact: true })).toBeVisible();
});

for (const sample of reference.cases) {
  test(`Flex source classes, layout and forwarded props match for ${sample.name}`, async ({ page }) => {
    await page.getByRole('combobox', { name: 'Flex source preset', exact: true })
      .selectOption(sample.name);

    await expect.poll(() => page.evaluate(snapshotFlexSource, sample.props.prefixCls || 'ant-flex'))
      .toEqual(sample.snapshot);
  });
}

test('Flex custom root preserves state, DOM, input selection and events through prefix and config changes',
  async ({ page }) => {
    await page.getByRole('combobox', { name: 'Flex source preset', exact: true })
      .selectOption('custom-root');
    const root = page.locator('[data-flex-source] > section');
    const original = await root.elementHandle();
    await root.getByRole('button', { name: 'First item', exact: true }).click();
    await expect(root).toHaveAttribute('data-custom-state', '1');
    await expect(page.getByLabel('Flex source events', { exact: true })).toHaveText('1');
    const input = page.getByLabel('Flex source draft', { exact: true });
    await input.fill('Local draft');
    await input.evaluate(node => (node as HTMLInputElement).setSelectionRange(1, 5));

    await page.getByRole('button', { name: 'Change Flex prefix', exact: true }).dispatchEvent('click');
    await page.getByLabel('Alternate Flex config', { exact: true }).dispatchEvent('click');

    await expect(root).toHaveClass(/updated-flex/);
    await expect(root).toHaveClass(/alternate-flex/);
    await expect(root).toHaveAttribute('data-custom-state', '1');
    await expect(root).toHaveCSS('gap', '37px');
    await expect(root).toHaveCSS('flex-direction', 'column');
    await expect(input).toBeFocused();
    await expect(input).toHaveValue('Local draft');
    expect(await input.evaluate(node => [(node as HTMLInputElement).selectionStart,
      (node as HTMLInputElement).selectionEnd])).toEqual([1, 5]);
    expect(await root.evaluate((node, before) => node === before, original)).toBe(true);
    await expect(page.getByLabel('Flex source ref', { exact: true })).toHaveText('SECTION');
    await expect(page.getByLabel('Flex source events', { exact: true })).toHaveText('1');
  });

test('Flex switches native and custom roots and clears refs for a root without forwarding', async ({ page }) => {
  const ref = page.getByLabel('Flex source ref', { exact: true });
  await expect(ref).toHaveText('DIV');

  await page.getByRole('button', { name: 'Use custom Flex root', exact: true }).click();

  await expect(ref).toHaveText('SECTION');
  await expect(page.locator('[data-flex-source] > section > button')).toHaveCount(2);

  await page.getByRole('button', { name: 'Use plain Flex root', exact: true }).click();

  await expect(ref).toHaveText('none');
  const plain = page.locator('[data-flex-source] > article');
  await expect(plain).toBeVisible();
  await expect(plain).not.toHaveAttribute('nativeElement');
  await expect(plain).not.toHaveAttribute('nativeelement');

  await page.getByRole('button', { name: 'Use section Flex root', exact: true }).click();

  await expect(ref).toHaveText('SECTION');
  await expect(page.locator('[data-flex-source] > section > input')).toHaveCount(1);
});

test('Flex custom root keeps native event targets and keyboard focus order', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Flex source preset', exact: true })
    .selectOption('custom-root');
  const root = page.locator('[data-flex-source] > section');
  await root.getByRole('button', { name: 'First item', exact: true }).focus();

  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Flex source draft', { exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(root.getByRole('button', { name: 'Last item', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');

  await expect(page.getByLabel('Flex source events', { exact: true })).toHaveText('1');
  await expect(page.getByLabel('Flex source event target', { exact: true })).toHaveText('BUTTON:SECTION');
  await expect(root).toHaveAttribute('data-custom-state', '1');
});

test('Flex custom component aliases change preset gaps without resetting inherited typography or neighbors', async ({ page }) => {
  const neighbor = page.locator('[data-flex-neighbor] .ant-flex');
  const snapshot = () => neighbor.evaluate(node => {
    const css = getComputedStyle(node);
    return [css.gap, css.fontSize, css.color];
  });
  const before = await snapshot();

  await page.getByRole('combobox', { name: 'Flex source preset', exact: true })
    .selectOption('aliases-large');

  await expect(page.locator('[data-flex-source] > .alias-flex')).toHaveCSS('gap', '31px');
  await expect(page.locator('[data-flex-source] > .alias-flex')).toHaveCSS('font-size', '21px');
  await expect.poll(snapshot).toEqual(before);

  await page.getByRole('combobox', { name: 'Flex source preset', exact: true })
    .selectOption('prefix-marker');

  await expect.poll(snapshot).toEqual(before);
});

test('Flex prefix reset removes its stylesheet while preserving the native root and focused draft', async ({ page }) => {
  const root = page.locator('[data-flex-source] > .tenant-flex');
  const original = await root.elementHandle();
  const input = page.getByLabel('Flex source draft', { exact: true });
  await input.fill('Local draft');
  await input.focus();

  await page.getByRole('button', { name: 'Reset Flex prefix', exact: true }).dispatchEvent('click');

  const current = page.locator('[data-flex-source] > .ant-flex');
  expect(await current.evaluate((node, before) => node === before, original)).toBe(true);
  await expect(input).toBeFocused();
  await expect(input).toHaveValue('Local draft');
  await expect(page.locator('style[data-ant-svelte-theme="flex-prefix:tenant-flex"]')).toHaveCount(0);
});

test('Unmounting custom Flex clears its native ref and prefix stylesheet', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Flex source preset', exact: true })
    .selectOption('custom-root');
  await page.getByLabel('Flex source draft', { exact: true }).focus();

  await page.getByLabel('Mount source Flex', { exact: true }).dispatchEvent('click');

  await expect(page.locator('[data-flex-source] > *')).toHaveCount(0);
  await expect(page.getByLabel('Flex source ref', { exact: true })).toHaveText('none');
  await expect(page.locator('style[data-ant-svelte-theme="flex-prefix:custom-flex"]')).toHaveCount(0);
});
