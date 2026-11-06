import { test, expect } from './test';
import reference from './fixtures/ant-design-border-beam-prefix-reference.json' with { type: 'json' };
import { snapshotBorderBeamTheme } from './border-beam-theme-metrics';

test.use({ viewport: reference.viewport });

for (const sample of reference.cases) {
  test(`BorderBeam local prefix matches source CSS, scope and reduced motion for ${sample.name}`,
    async ({ page }) => {
      await page.goto('/?fixture=border-beam-prefix');
      await page.getByRole('combobox', { name: 'BorderBeam prefix preset', exact: true })
        .selectOption(sample.name);
      const prefix = 'prefix' in sample && sample.prefix || 'ant-border-beam';

      await expect.poll(() => page.evaluate(snapshotBorderBeamTheme, prefix)).toEqual(sample.metrics);
      expect(await page.locator('[data-beam-theme="normal"] > [aria-hidden="true"]')
        .evaluateAll((nodes, cls) => nodes.map(node => ({
          local: node.classList.contains(cls),
          default: node.classList.contains('ant-border-beam'),
          context: node.classList.contains('prefix-context')
        })), prefix)).toEqual(sample.classes);
      await page.emulateMedia({ reducedMotion: 'reduce' });

      await expect.poll(() => page.evaluate(snapshotBorderBeamTheme, prefix)).toEqual(sample.reduced);
    });
}

for (const preset of ['tenant', 'component-aliases', 'native-light', 'native-dark',
  'native-dark-compact']) {
  test(`BorderBeam prefix changes retain layers, external targets and native focus for ${preset}`,
    async ({ page }) => {
      await page.goto('/?fixture=border-beam-prefix');
      await page.getByRole('combobox', { name: 'BorderBeam prefix preset', exact: true })
        .selectOption(preset);
      const host = page.locator('[data-beam-theme="normal"]');
      const layer = host.locator(':scope > [aria-hidden="true"]');
      const external = page.locator('[data-beam-theme="external"] > [aria-hidden="true"]').first();
      await expect(layer).toHaveCSS('position', 'absolute');
      const original = await layer.elementHandle();
      const oldExternal = await external.elementHandle();
      const input = host.getByRole('textbox', { name: 'Beam themed draft normal', exact: true });
      await input.fill('Prefix draft');
      await input.focus();
      await input.evaluate(node => (node as HTMLInputElement).setSelectionRange(1, 8));
      const initial = preset === 'tenant' ? 'tenant-beam'
        : preset === 'component-aliases' ? 'theme-beam' : 'native-beam';
      const before = await page.evaluate(snapshotBorderBeamTheme, initial);
      await page.getByRole('button', { name: 'Set alternate beam prefix', exact: true })
        .dispatchEvent('click');

      await expect(layer).toHaveClass(/\bnext-beam\b/);
      await expect.poll(() => page.evaluate(snapshotBorderBeamTheme, 'next-beam')).toEqual(before);
      expect(await layer.evaluate((node, old) => node === old, original)).toBe(true);
      expect(await external.evaluate((node, old) => node === old, oldExternal)).toBe(true);
      await expect(input).toBeFocused();
      await expect(input).toHaveValue('Prefix draft');
      expect(await input.evaluate(node => {
        const element = node as HTMLInputElement;
        return [element.selectionStart, element.selectionEnd];
      })).toEqual([1, 8]);
      await expect(page.locator(`style[data-ant-svelte-theme="border-beam-prefix:${initial}"]`))
        .toHaveCount(0);
      await page.getByRole('button', { name: 'Use default beam prefix', exact: true })
        .dispatchEvent('click');

      await expect(layer).toHaveClass(/\bant-border-beam\b/);
      await expect(layer).not.toHaveAttribute('data-ant-border-beam-prefix');
      await expect.poll(() => page.evaluate(snapshotBorderBeamTheme, 'ant-border-beam'))
        .toEqual(before);
      await expect(page.locator('style[data-ant-svelte-theme^="border-beam-prefix:"]')).toHaveCount(0);
      await expect(input).toBeFocused();
    });
}

test('BorderBeam prefix styles and external decorations clean up with the owner', async ({ page }) => {
  await page.goto('/?fixture=border-beam-prefix');
  const external = page.locator('[data-beam-theme="external"] > .tenant-beam');
  await expect(external).toHaveCount(2);
  await expect(page.locator('style[data-ant-svelte-theme="border-beam-prefix:tenant-beam"]'))
    .toHaveCount(4);
  await page.getByLabel('Mount prefix beam controls', { exact: true }).uncheck();

  await expect(external).toHaveCount(0);
  await expect(page.locator('style[data-ant-svelte-theme^="border-beam-prefix:"]')).toHaveCount(0);
  await expect(page.getByRole('textbox', { name: 'Beam external draft', exact: true }))
    .toHaveValue('External draft');
  await expect(page.locator('[data-beam-theme="outside"] > .ant-border-beam'))
    .toHaveCSS('position', 'absolute');
});
