import { test, expect } from './test';
import reference from './fixtures/ant-design-affix-theme-reference.json' with { type: 'json' };
import { snapshotAffixTheme } from './affix-theme-metrics';

test.use({ viewport: reference.viewport });

for (const sample of reference.cases) {
  test(`Affix themes match source unfixed and fixed CSS, geometry and scopes for ${sample.name}`,
    async ({ page }) => {
      await page.goto('/?fixture=affix-theme');
      await page.getByLabel('Affix theme preset', { exact: true }).selectOption(sample.name);

      await expect.poll(() => page.evaluate(snapshotAffixTheme)).toEqual(sample.unfixed);
      await page.locator('[data-affix-scroll]').evaluateAll(nodes => {
        for (const node of nodes) node.scrollTop = 80;
      });

      await expect.poll(() => page.evaluate(snapshotAffixTheme)).toEqual(sample.metrics);
    });
}

test('Affix theme updates retain the fixed node, draft, native ref and transition callbacks',
  async ({ page }) => {
    await page.goto('/?fixture=affix-theme');
    const host = page.locator('[data-affix-theme="normal"]');
    const root = host.locator('.theme-affix');
    const content = root.locator(':scope > div').last();
    await expect(page.locator('[data-affix-scroll]')).toHaveCount(6);
    await page.locator('[data-affix-scroll]').evaluateAll(nodes => {
      for (const node of nodes) node.scrollTop = 80;
    });
    await expect(content).toHaveCSS('z-index', '73');
    const previous = await content.elementHandle();
    const previousRoot = await root.elementHandle();
    const input = root.getByRole('textbox', { name: 'Affix themed draft normal', exact: true });
    await input.fill('Affix theme draft');
    await input.focus();
    await input.evaluate(node => (node as HTMLInputElement).setSelectionRange(1, 8));
    await page.getByRole('button', { name: 'Update Affix tokens', exact: true }).dispatchEvent('click');

    await expect(content).toHaveCSS('z-index', '333');
    await expect(content).toHaveCSS('font-size', '24px');
    expect(await content.evaluate((node, old) => node === old, previous)).toBe(true);
    expect(await root.evaluate((node, old) => node === old, previousRoot)).toBe(true);
    await expect(input).toHaveValue('Affix theme draft');
    await expect(input).toBeFocused();
    expect(await input.evaluate(node => {
      const element = node as HTMLInputElement;
      return [element.selectionStart, element.selectionEnd];
    })).toEqual([1, 8]);
    await expect(host.getByLabel('Affix theme ref normal', { exact: true })).toHaveText('mounted');
    await expect(host.getByLabel('Affix theme changes normal', { exact: true })).toHaveText('[true]');
    const metrics = await page.evaluate(snapshotAffixTheme) as typeof reference.cases[0]['metrics'];
    expect(metrics.normal.placeholder).toEqual(['260px', '32px']);
    expect(metrics.normal.topOffset).toBe(5);
    expect(metrics.nested.content['z-index']).toBe('21');
    expect(metrics.reset.content['z-index']).toBe('31');
    expect(metrics.sibling.content['z-index']).toBe('41');
    expect(metrics.outside.content['z-index']).toBe('10');
    await host.locator('[data-affix-scroll]').evaluate(node => node.scrollTop = 0);

    await expect(content).not.toHaveClass(/\bant-affix\b/);
    await expect(content).toHaveCSS('font-size', '14px');
    await expect(content).toHaveCSS('z-index', 'auto');
    await expect(host.getByLabel('Affix theme changes normal', { exact: true }))
      .toHaveText('[true,false]');
    await page.getByLabel('Mount themed Affix controls', { exact: true }).uncheck();
    await page.setViewportSize({ width: 1000, height: 1200 });

    expect(await previous!.evaluate(node => node.isConnected)).toBe(false);
    await expect(root).toHaveCount(0);
  });

test('Affix restores legacy defaults when its source theme is removed while fixed', async ({ page }) => {
  await page.goto('/?fixture=affix-theme');
  const host = page.locator('[data-affix-theme="normal"]');
  const content = host.locator('.theme-affix > div').last();
  await host.locator('[data-affix-scroll]').evaluate(node => node.scrollTop = 80);
  await expect(content).toHaveCSS('z-index', '73');
  const original = await content.elementHandle();
  await page.getByLabel('Apply source Affix theme', { exact: true }).uncheck();

  await expect(content).toHaveCSS('z-index', '10');
  await expect(content).toHaveCSS('font-size', '14px');
  expect(await content.evaluate((node, old) => node === old, original)).toBe(true);
  await expect(host.getByLabel('Affix theme changes normal', { exact: true })).toHaveText('[true]');
});
