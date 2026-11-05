import { test, expect } from './test';
import reference from './fixtures/ant-design-layout-theme-reference.json' with { type: 'json' };
import { snapshotLayoutTheme } from './layout-theme-metrics';

test.use({ viewport: reference.viewport });

for (const sample of reference.cases) {
  test(`Layout theme matches source root, sections, sidebars and scopes for ${sample.name}`,
    async ({ page }) => {
      await page.goto('/?fixture=layout-theme');
      await page.getByLabel('Layout theme preset', { exact: true }).selectOption(sample.name);

      await expect.poll(() => page.evaluate(snapshotLayoutTheme)).toEqual(sample.metrics);
    });
}

test('Layout theme updates retain sidebar drafts, selection, DOM, refs and collapse state',
  async ({ page }) => {
    await page.goto('/?fixture=layout-theme');
    const host = page.locator('[data-layout-theme="dark"]');
    const root = host.locator('.ant-layout').first();
    const sider = host.locator('.ant-layout-sider');
    const draft = host.getByRole('textbox', { name: 'Layout draft dark', exact: true });
    const header = host.locator('.ant-layout-header');
    await draft.fill('Retained sidebar draft');
    await draft.focus();
    await draft.evaluate(node => {
      if (!(node instanceof HTMLInputElement)) throw new Error('Expected native sidebar input');
      node.setSelectionRange(3, 12);
    });
    const before = {
      root: await root.elementHandle(),
      sider: await sider.elementHandle(),
      input: await draft.elementHandle(),
      header: await header.elementHandle()
    };
    await page.getByRole('button', { name: 'Update Layout tokens', exact: true })
      .dispatchEvent('click');

    await expect(root).toHaveCSS('background-color', 'rgb(230, 244, 255)');
    await expect(header).toHaveCSS('height', '84px');
    await expect(sider).toHaveCSS('padding-bottom', '60px');
    await expect(sider).toHaveCSS('width', '200px');
    await expect(draft).toHaveValue('Retained sidebar draft');
    await expect(draft).toBeFocused();
    expect(await draft.evaluate(node => {
      if (!(node instanceof HTMLInputElement)) throw new Error('Expected native sidebar input');

      return [node.selectionStart, node.selectionEnd];
    })).toEqual([3, 12]);
    for (const [node, old] of [
      [root, before.root], [sider, before.sider], [draft, before.input], [header, before.header]
    ] as const) {
      expect(await node.evaluate((element, previous) => element === previous, old)).toBe(true);
    }
    await expect(page.getByLabel('Layout theme refs dark', { exact: true })).toHaveText('mounted');
    await expect(page.getByLabel('Layout theme changes dark', { exact: true })).toHaveText('[]');
    await expect(page.locator('[data-layout-theme="root-variable"] .ant-layout-header'))
      .toHaveCSS('height', '94px');
    for (const [id, height] of [['nested', '88px'], ['reset', '76px'], ['sibling', '52px'],
      ['outside', '64px']]) {
      await expect(page.locator(`[data-layout-theme="${id}"] .ant-layout-header`))
        .toHaveCSS('height', height);
    }
    await sider.getByRole('button').press('Enter');

    await expect(sider).toHaveCSS('width', '80px');
    await expect(draft).toHaveValue('Retained sidebar draft');
    await expect(sider.getByRole('button')).toBeFocused();
    await expect(page.getByLabel('Layout theme changes dark', { exact: true }))
      .toHaveText('[{"collapsed":true,"type":"clickTrigger"}]');
  });

test('Layout resets inherited and removed themes without replacing focused sidebar controls',
  async ({ page }) => {
    await page.goto('/?fixture=layout-theme');
    const nested = page.locator('[data-layout-theme="nested"]');
    const input = nested.getByRole('textbox', { name: 'Layout draft nested', exact: true });
    await input.fill('Nested draft');
    await input.focus();
    await page.getByLabel('Inherit child Layout theme', { exact: true }).dispatchEvent('click');

    await expect(nested.locator('.ant-layout-sider')).toHaveCSS('background-color', 'rgb(0, 21, 41)');
    await expect(nested.locator('.ant-layout-header')).toHaveCSS('height', '88px');
    await expect(input).toBeFocused();
    const dark = page.locator('[data-layout-theme="dark"]');
    const draft = dark.getByRole('textbox', { name: 'Layout draft dark', exact: true });
    await draft.fill('Native fallback draft');
    await draft.focus();
    await page.getByLabel('Apply source Layout theme', { exact: true }).dispatchEvent('click');

    await expect(dark.locator('.ant-layout-header')).toHaveCSS('height', '64px');
    await expect(dark.locator('.ant-layout-sider')).toHaveCSS('padding-bottom', '48px');
    await expect(draft).toHaveValue('Native fallback draft');
    await expect(draft).toBeFocused();
    const root = await dark.elementHandle();
    await page.getByLabel('Mount themed Layout controls', { exact: true }).dispatchEvent('click');

    await expect(dark).toHaveCount(0);
    expect(await root!.evaluate(node => node.isConnected)).toBe(false);
    await expect(page.locator('[data-layout-theme="outside"]')).toBeVisible();
  });

test('Standalone Layout sections receive component tokens without requiring a Layout wrapper',
  async ({ page }) => {
    await page.goto('/?fixture=layout-theme');
    const host = page.locator('[data-layout-standalone]');

    await expect(host.locator('header')).toHaveCSS('height', '72px');
    await expect(host.locator('header')).toHaveCSS('background-color', 'rgb(83, 29, 171)');
    await expect(host.locator('footer')).toHaveCSS('padding', '14px 30px');
    await expect(host.locator('footer')).toHaveCSS('background-color', 'rgb(255, 247, 230)');
    await expect(host.locator('.ant-layout')).toHaveCount(0);
    await page.getByRole('button', { name: 'Update Layout tokens', exact: true }).click();

    await expect(host.locator('header')).toHaveCSS('height', '84px');
    await expect(host.locator('footer')).toHaveCSS('padding', '14px 30px');
  });
