import { test, expect } from './test';
import reference from './fixtures/ant-design-tree-theme-reference.json' with { type: 'json' };
import { snapshotTreeTheme, snapshotTreeThemeComposition } from './tree-theme-metrics';

test.use({ viewport: reference.viewport });

for (const sample of reference.cases) {
  test(`Tree component themes match source node, checkbox and indent styles for ${sample.name}`,
    async ({ page }) => {
      await page.goto('/?fixture=tree-theme');
      await page.getByLabel('Tree theme preset', { exact: true }).selectOption(sample.name);

      await expect.poll(() => page.evaluate(snapshotTreeTheme)).toEqual(sample.metrics);
    });
}

test('TreeSelect keeps its own theme when Tree and Select tokens conflict', async ({ page }) => {
  await page.goto('/?fixture=tree-theme');
  const input = page.getByRole('combobox', { name: 'Tree theme composition', exact: true });
  await input.scrollIntoViewIfNeeded();
  await expect(page.locator('.ant-tree-select-dropdown')).toBeVisible();

  await expect.poll(() => page.evaluate(snapshotTreeThemeComposition))
    .toEqual(reference.treeSelectComposition.metrics);
  const original = await input.elementHandle();
  await input.focus();

  await page.getByRole('button', { name: 'Update Tree tokens', exact: true }).dispatchEvent('click');

  await expect.poll(() => page.evaluate(snapshotTreeThemeComposition))
    .toEqual(reference.treeSelectComposition.metrics);
  expect(await input.evaluate((node, old) => node === old, original)).toBe(true);
  await expect(input).toBeFocused();
  await expect(page.locator('.ant-tree-select-dropdown')
    .getByRole('checkbox', { name: 'Alpha', exact: true })).toHaveAttribute('aria-checked', 'true');
});

test('Tree theme updates preserve active descendant, focus, selection, checks and keyboard actions',
  async ({ page }) => {
    await page.goto('/?fixture=tree-theme');
    const host = page.locator('[data-tree-theme="normal"]');
    const tree = host.getByRole('tree', { name: 'Themed Tree normal', exact: true });
    const original = await tree.elementHandle();
    const checked = host.getByRole('checkbox', { name: 'Alpha', exact: true });
    const originalCheck = await checked.elementHandle();
    await tree.focus();
    await tree.press('ArrowDown');
    const active = await tree.getAttribute('aria-activedescendant');
    await expect.poll(() => page.evaluate(snapshotTreeTheme)).toEqual(reference.activeUpdate.before);

    await page.getByRole('button', { name: 'Update Tree tokens', exact: true }).dispatchEvent('click');

    await expect.poll(() => page.evaluate(snapshotTreeTheme)).toEqual(reference.activeUpdate.after);
    expect(await tree.evaluate((node, old) => node === old, original)).toBe(true);
    expect(await checked.evaluate((node, old) => node === old, originalCheck)).toBe(true);
    await expect(tree).toBeFocused();
    await expect(tree).toHaveAttribute('aria-activedescendant', active!);
    await expect(checked).toHaveAttribute('aria-checked', 'true');
    await expect(host.getByRole('treeitem', { name: 'Alpha', exact: true }))
      .toHaveAttribute('aria-selected', 'true');
    await expect(host.getByLabel('Tree theme events normal', { exact: true })).toHaveText('[]');

    await tree.press('Home');
    await tree.press('Space');

    await expect(host.getByRole('checkbox', { name: 'Parent', exact: true }))
      .toHaveAttribute('aria-checked', 'true');
    await expect(host.getByLabel('Tree theme events normal', { exact: true }))
      .toHaveText('["check:p:true"]');
    await page.getByLabel('Mount themed Tree controls', { exact: true }).dispatchEvent('click');
    expect(await original!.evaluate(node => node.isConnected)).toBe(false);
    await expect(page.locator('[data-tree-theme="sibling"] .ant-tree').first())
      .toHaveCSS('font-size', '18px');
  });

test('Tree keeps pending loading and its callback across a theme update', async ({ page }) => {
  await page.goto('/?fixture=tree-theme');
  const host = page.locator('[data-tree-theme="normal"]');
  const lazy = host.locator('[data-tree-lazy="normal"]');
  const root = lazy.locator('.ant-tree');
  const original = await root.elementHandle();
  await lazy.locator('.ant-tree-switcher').click();
  await expect(lazy.locator('.ant-tree-switcher-loading-icon')).toBeVisible();

  await page.getByRole('button', { name: 'Update Tree tokens', exact: true }).dispatchEvent('click');

  await expect(lazy.locator('.ant-tree-switcher-loading-icon')).toBeVisible();
  await expect(lazy.locator('.ant-tree-node-content-wrapper')).toHaveCSS('min-height', '40px');
  expect(await root.evaluate((node, old) => node === old, original)).toBe(true);
  await expect(host.getByLabel('Tree theme events normal', { exact: true })).toHaveText('[]');
  await host.getByRole('button', { name: 'Resolve themed Tree normal', exact: true }).click();

  await expect(lazy.getByRole('treeitem', { name: 'Loaded child', exact: true })).toBeVisible();
  await expect(lazy.locator('.ant-tree-switcher-loading-icon')).toHaveCount(0);
  await expect(host.getByLabel('Tree theme events normal', { exact: true })).toHaveText('["load"]');
});

test('Tree resets inherited tokens without replacing its focus target or selected node',
  async ({ page }) => {
    await page.goto('/?fixture=tree-theme');
    const host = page.locator('[data-tree-theme="nested"]');
    const tree = host.getByRole('tree', { name: 'Themed Tree nested', exact: true });
    const original = await tree.elementHandle();
    await tree.focus();

    await page.getByLabel('Inherit Tree theme', { exact: true }).dispatchEvent('click');

    const defaults = reference.cases.find(sample => sample.name === 'default')!;
    await expect.poll(() => page.evaluate(snapshotTreeTheme).then(metrics => metrics.nested))
      .toEqual(defaults.metrics.nested);
    expect(await tree.evaluate((node, old) => node === old, original)).toBe(true);
    await expect(tree).toBeFocused();
    await expect(host.getByRole('checkbox', { name: 'Alpha', exact: true }))
      .toHaveAttribute('aria-checked', 'true');
  });

test('Tree restores legacy defaults while preserving native focus and checked state', async ({ page }) => {
  await page.goto('/?fixture=tree-theme');
  const host = page.locator('[data-tree-theme="normal"]');
  const tree = host.getByRole('tree', { name: 'Themed Tree normal', exact: true });
  const original = await tree.elementHandle();
  await tree.focus();

  await page.getByLabel('Apply source Tree theme', { exact: true }).dispatchEvent('click');

  await expect(host.locator('.ant-tree').first()).toHaveCSS('font-size', '14px');
  await expect(host.locator('.ant-tree-node-content-wrapper').first())
    .toHaveCSS('min-height', '24px');
  expect(await tree.evaluate((node, old) => node === old, original)).toBe(true);
  await expect(tree).toBeFocused();
  await expect(host.getByRole('checkbox', { name: 'Alpha', exact: true }))
    .toHaveAttribute('aria-checked', 'true');
});
