import { test, expect } from './test';
import reference from './fixtures/ant-design-layout-section-prefix-reference.json' with { type: 'json' };
import { snapshotLayoutSectionPrefix } from './layout-section-prefix-metrics';
import {
  layoutSectionPrefix, type LayoutSectionPrefixSample
} from './fixtures/layout-section-prefix-cases';

for (const entry of reference.cases) {
  test(`Layout sections retain source role styles for ${entry.sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=layout-section-prefix');
    await page.getByRole('combobox', { name: 'Layout section prefix sample', exact: true })
      .selectOption(entry.sample.id);

    await expect.poll(() => page.evaluate(snapshotLayoutSectionPrefix)).toEqual(entry.expectedRoles);
    for (const part of ['header', 'content', 'footer'] as const) {
      const prefix = layoutSectionPrefix(entry.sample as LayoutSectionPrefixSample, part)
        || `ant-layout-${part}`;
      for (const scope of ['normal', 'standalone']) {
        expect(await page.locator(`[data-section-prefix="${scope}"] [data-section-part="${part}"]`)
          .evaluate((node, prefix) => node.classList.contains(prefix), prefix)).toBe(true);
      }
    }
  });
}

test('Layout section prefixes update without replacing controls or losing drafts and selection',
  async ({ page }) => {
    await page.goto('/?fixture=layout-section-prefix');
    await page.getByRole('checkbox', { name: 'Interactive Layout sections', exact: true }).check();
    const scope = page.locator('[data-section-prefix="normal"]');
    const input = scope.getByRole('textbox', { name: 'header section draft', exact: true });
    const header = scope.locator('header');
    const previous = { input: await input.elementHandle(), header: await header.elementHandle() };
    await input.fill('Section prefix draft');
    await input.focus();
    await input.evaluate(node => (node as HTMLInputElement).setSelectionRange(2, 10));
    const select = page.getByRole('combobox', { name: 'Layout section prefix sample', exact: true });

    for (const sample of ['custom-ltr', 'shared-ltr', 'variable-alias-ltr', 'empty-ltr']) {
      await select.selectOption(sample);

      await expect(input).toHaveValue('Section prefix draft');
      await expect(input).toBeFocused();
      expect(await input.evaluate(node => [
        (node as HTMLInputElement).selectionStart, (node as HTMLInputElement).selectionEnd
      ])).toEqual([2, 10]);
      expect(await input.evaluate((node, old) => node === old, previous.input)).toBe(true);
      expect(await header.evaluate((node, old) => node === old, previous.header)).toBe(true);
    }
  });

test('Standalone section defaults and custom prefixes retain native dark compact metrics',
  async ({ page }) => {
    await page.goto('/?fixture=layout-section-prefix');
    await page.getByRole('combobox', { name: 'Layout section prefix sample', exact: true })
      .selectOption('custom-ltr');
    await page.getByRole('checkbox', { name: 'Legacy dark compact sections', exact: true }).check();
    const custom = await page.evaluate(snapshotLayoutSectionPrefix);
    await page.getByRole('checkbox', { name: 'Use section prefixes', exact: true }).uncheck();

    await expect.poll(() => page.evaluate(snapshotLayoutSectionPrefix)).toEqual(custom);
    expect(custom.standalone.header.height).toBe(custom.normal.header.height);
    expect(custom.standalone.footer.padding).toBe(custom.normal.footer.padding);
    expect(custom.standalone.footer.background).toBe(custom.normal.footer.background);
  });
