import { test, expect } from './test';
import reference from './fixtures/ant-design-affix-config-reference.json' with { type: 'json' };
import { snapshotAffixConfiguration, snapshotAffixTheme } from './affix-theme-metrics';

test.use({ viewport: reference.viewport });

for (const sample of reference.cases) {
  test(`Affix configuration matches source wrapper priority, prefixes and geometry for ${sample.name}`,
    async ({ page }) => {
      await page.goto('/?fixture=affix-config');
      await page.getByLabel('Affix config preset', { exact: true }).selectOption(sample.name);
      const prefix = 'prefix' in sample && sample.prefix || 'ant-affix';

      await expect.poll(() => page.evaluate(snapshotAffixTheme, prefix)).toEqual(sample.unfixed);
      await page.locator('[data-affix-scroll]').evaluateAll(nodes => {
        for (const node of nodes) node.scrollTop = 80;
      });

      await expect.poll(() => page.evaluate(snapshotAffixTheme, prefix)).toEqual(sample.metrics);
      expect(await page.evaluate(snapshotAffixConfiguration, prefix)).toEqual(sample.wrappers);
    });
}

for (const preset of ['tenant', 'source-theme', 'native-light', 'native-dark', 'native-dark-compact']) {
  test(`Affix prefix and config updates preserve fixed DOM, fields and callbacks for ${preset}`,
    async ({ page }) => {
      await page.goto('/?fixture=affix-config');
      await page.getByLabel('Affix config preset', { exact: true }).selectOption(preset);
      await page.locator('[data-affix-scroll]').evaluateAll(nodes => {
        for (const node of nodes) node.scrollTop = 80;
      });
      const host = page.locator('[data-affix-theme="normal"]');
      const root = host.locator('.theme-affix');
      const content = root.locator(':scope > div').last();
      const initial = preset === 'tenant' ? 'tenant-affix'
        : preset === 'source-theme' ? 'source-affix' : 'native-affix';
      await expect(content).toHaveClass(new RegExp(`\\b${initial}\\b`));
      const oldContent = await content.elementHandle();
      const oldRoot = await root.elementHandle();
      const input = root.getByRole('textbox', { name: 'Affix themed draft normal', exact: true });
      await input.fill('Prefix retained');
      await input.focus();
      await input.evaluate(node => (node as HTMLInputElement).setSelectionRange(1, 6));
      const before = await page.evaluate(snapshotAffixTheme, initial);
      await page.getByRole('button', { name: 'Set alternate Affix prefix', exact: true })
        .dispatchEvent('click');
      await page.getByRole('button', { name: 'Replace Affix config', exact: true }).dispatchEvent('click');

      await expect(content).toHaveClass(/\bnext-affix\b/);
      await expect(root).toHaveClass('theme-affix updated-affix');
      await expect(root).toHaveCSS('opacity', '0.65');
      await expect(root).toHaveCSS('outline-offset', '7px');
      await expect.poll(() => page.evaluate(snapshotAffixTheme, 'next-affix')).toEqual(before);
      const wrappers = await page.evaluate(snapshotAffixConfiguration, 'next-affix');
      expect(wrappers.explicit.opacity).toBe('0.8');
      expect(wrappers.explicit.outlineOffset).toBe('9px');
      expect(wrappers.inherited.opacity).toBe('0.65');
      expect(wrappers.replaced.opacity).toBe('0.3');
      expect(wrappers.replaced.outlineOffset).toBe('0px');
      expect(wrappers.cleared.opacity).toBe('1');
      expect(wrappers.cleared.className).toBe('theme-affix');
      expect(wrappers.outside.opacity).toBe('0.6');
      expect(await content.evaluate((node, old) => node === old, oldContent)).toBe(true);
      expect(await root.evaluate((node, old) => node === old, oldRoot)).toBe(true);
      await expect(input).toHaveValue('Prefix retained');
      await expect(input).toBeFocused();
      expect(await input.evaluate(node => {
        const element = node as HTMLInputElement;
        return [element.selectionStart, element.selectionEnd];
      })).toEqual([1, 6]);
      await expect(host.getByLabel('Affix theme changes normal', { exact: true })).toHaveText('[true]');
      await expect(host.getByLabel('Affix theme ref normal', { exact: true })).toHaveText('mounted');
      await expect(page.locator(`style[data-ant-svelte-theme="affix-prefix:${initial}"]`))
        .toHaveCount(0);
      await page.getByRole('button', { name: 'Use default Affix prefix', exact: true })
        .dispatchEvent('click');

      await expect(content).toHaveClass(/\bant-affix\b/);
      await expect(content).not.toHaveAttribute('data-ant-affix-prefix');
      await expect.poll(() => page.evaluate(snapshotAffixTheme)).toEqual(before);
      await expect(page.locator('style[data-ant-svelte-theme^="affix-prefix:"]')).toHaveCount(0);
      await expect(input).toBeFocused();
    });
}

test('Affix releases custom prefix CSS when its fixed owner is removed', async ({ page }) => {
  await page.goto('/?fixture=affix-config');
  await page.locator('[data-affix-scroll]').evaluateAll(nodes => {
    for (const node of nodes) node.scrollTop = 80;
  });
  await expect(page.locator('.tenant-affix')).toHaveCount(5);
  await expect(page.locator('style[data-ant-svelte-theme^="affix-prefix:"]')).toHaveCount(5);
  await page.getByLabel('Mount configured Affix controls', { exact: true }).uncheck();
  await page.setViewportSize({ width: 1000, height: 1200 });

  await expect(page.locator('.tenant-affix')).toHaveCount(0);
  await expect(page.locator('style[data-ant-svelte-theme^="affix-prefix:"]')).toHaveCount(0);
  await expect(page.locator('[data-affix-theme="outside"] .ant-affix')).toHaveCSS('z-index', '10');
});
