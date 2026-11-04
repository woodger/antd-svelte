import { test, expect } from './test';
import reference from './fixtures/ant-design-divider-config-reference.json' with { type: 'json' };
import { snapshotDividerConfig } from './divider-config-metrics';

test.use({ viewport: reference.viewport });

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=divider-config');
  await expect(page.getByRole('heading', { name: 'Divider prefix and config', exact: true }))
    .toBeVisible();
});

for (const sample of reference.cases) {
  test(`Divider prefix and config match the source for ${sample.name}`, async ({ page }) => {
    await page.getByRole('combobox', { name: 'Divider config preset', exact: true })
      .selectOption(sample.name);

    await expect.poll(() => page.evaluate(snapshotDividerConfig, sample.props.prefixCls || 'ant-divider'))
      .toEqual(sample.snapshot);
  });
}

for (const preset of ['prefix-native', 'own-tokens', 'callback-both']) {
  test(`Divider prefix updates preserve styles, refs and input focus for ${preset}`, async ({ page }) => {
    await page.getByRole('combobox', { name: 'Divider config preset', exact: true })
      .selectOption(preset);
    const sample = reference.cases.find(sample => sample.name === preset)!;
    const root = page.locator('[data-divider-config-case]').getByRole('separator');
    const original = await root.elementHandle();
    const before = await page.evaluate(snapshotDividerConfig, sample.props.prefixCls || 'ant-divider');
    const input = page.getByLabel('Divider config neighbor', { exact: true });
    await input.fill('Draft');
    await input.focus();

    await page.getByRole('button', { name: 'Change Divider prefix', exact: true }).dispatchEvent('click');

    await expect(root).toHaveClass(/(?:^|\s)updated-divider(?:\s|$)/);
    await expect(input).toBeFocused();
    await expect(input).toHaveValue('Draft');
    await expect(page.getByLabel('Configured Divider ref', { exact: true })).toHaveText('DIV');
    expect(await root.evaluate((node, before) => node === before, original)).toBe(true);
    const after = await page.evaluate(snapshotDividerConfig, 'updated-divider');
    expect(after.root).toEqual(before.root);
    expect(after.content?.style).toEqual(before.content?.style);
    expect(after.rails.map(rail => rail.style)).toEqual(before.rails.map(rail => rail.style));
    if (preset === 'callback-both') {
      await expect(root.locator('.updated-divider-inner-text'))
        .toHaveClass(/fn-prefix-updated-divider/);
    }

    await page.getByRole('button', { name: 'Reset Divider prefix', exact: true }).dispatchEvent('click');

    await expect(root).toHaveClass(/(?:^|\s)ant-divider(?:\s|$)/);
    await expect(input).toBeFocused();
    await expect(page.locator('style[data-ant-svelte-theme="divider-prefix:updated-divider"]'))
      .toHaveCount(0);
  });
}

test('Divider config updates replace the record and preserve DOM and an adjacent draft', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Divider config preset', exact: true })
    .selectOption('provider');
  const root = page.locator('[data-divider-config-case]').getByRole('separator');
  const original = await root.elementHandle();
  const input = page.getByLabel('Divider config neighbor', { exact: true });
  await input.fill('Draft');
  await input.focus();

  await page.getByLabel('Alternate Divider config', { exact: true }).dispatchEvent('click');

  await expect(root).toHaveClass(/alternate-provider/);
  await expect(root).not.toHaveClass(/provider-root|provider-main/);
  await expect(root).toHaveCSS('opacity', '1');
  await expect(root.locator('.configured-divider-inner-text')).toHaveCSS('padding-inline-start', '16px');
  await expect(root.locator('.configured-divider-inner-text')).toHaveCSS('padding-inline-end', '37px');
  await expect(input).toBeFocused();
  await expect(input).toHaveValue('Draft');
  expect(await root.evaluate((node, before) => node === before, original)).toBe(true);
});

test('Divider prefix defaults do not change adjacent dark Divider and Input styles', async ({ page }) => {
  const neighbor = page.locator('[data-divider-config-neighbor]');
  const snapshot = () => neighbor.evaluate(node => {
    const divider = getComputedStyle(node.querySelector('.ant-divider')!);
    const content = getComputedStyle(node.querySelector('.ant-divider-inner-text')!);
    const input = getComputedStyle(node.querySelector('input.ant-input')!);
    return [divider.color, divider.fontSize, divider.marginTop, content.paddingInlineStart,
      input.color, input.fontSize];
  });
  const before = await snapshot();

  await page.getByRole('combobox', { name: 'Divider config preset', exact: true })
    .selectOption('prefix-marker');

  await expect.poll(snapshot).toEqual(before);
});

test('Divider prefix changes do not insert whitespace into an inline separator', async ({ page }) => {
  const inline = page.locator('[data-divider-inline]');
  const snapshot = () => inline.evaluate(node => {
    const bounds = node.getBoundingClientRect();
    const separator = node.querySelector('[role="separator"]')!.getBoundingClientRect();
    return [bounds.width, bounds.height, separator.x - bounds.x, separator.width, separator.height];
  });
  const before = await snapshot();

  await page.getByRole('button', { name: 'Reset Divider prefix', exact: true }).dispatchEvent('click');

  await expect.poll(snapshot).toEqual(before);
  await expect(inline).toHaveText('StartEnd');
});

test('Divider unmount clears its ref and prefix styles without changing a focused sibling', async ({ page }) => {
  const input = page.getByLabel('Divider config neighbor', { exact: true });
  await input.focus();

  await page.getByLabel('Mount configured Divider', { exact: true }).dispatchEvent('click');

  await expect(page.locator('[data-divider-config-case]').getByRole('separator')).toHaveCount(0);
  await expect(page.getByLabel('Configured Divider ref', { exact: true })).toHaveText('none');
  await expect(page.locator('style[data-ant-svelte-theme="divider-prefix:tenant-divider"]'))
    .toHaveCount(0);
  await expect(input).toBeFocused();
});
