import { test, expect } from './test';
import reference from './fixtures/ant-design-layout-prefix-reference.json' with { type: 'json' };
import { snapshotLayoutPrefix } from './layout-prefix-metrics';

function isolatedAliasMetrics(metrics: typeof reference.cases[number]['metrics'], sample: {
  prefixCls?: string;
  siderPrefixCls?: string;
  direction: string;
}) {
  const expected = structuredClone(metrics);
  const baseline = reference.cases.find(entry => entry.sample.id === `normal-${sample.direction}`)!
    .metrics;
  const rootAlias = sample.prefixCls === 'ant-layout-sider';
  const siderAlias = sample.siderPrefixCls === 'ant-layout';
  const sharedAlias = sample.prefixCls === 'ant-layout-css-var'
    && sample.siderPrefixCls === 'ant-layout-css-var';

  // Raw Source collisions сохранены; собственные root markers защищают роли и соседей.
  if (rootAlias || siderAlias || sharedAlias) {
    const root = expected.sibling.slots.root;
    const sider = expected.sibling.slots.sider;
    root.background = baseline.sibling.slots.root.background;
    root.position = baseline.sibling.slots.root.position;
    sider.background = baseline.sibling.slots.sider.background;
    sider.flexDirection = baseline.sibling.slots.sider.flexDirection;
  }
  for (const scope of ['normal', 'nested'] as const) {
    if (rootAlias) expected[scope].slots.root.background = baseline[scope].slots.root.background;
    if (siderAlias || sharedAlias) {
      expected[scope].slots.sider.background = baseline[scope].slots.sider.background;
    }
    if (sharedAlias) {
      expected[scope].slots.root.position = baseline[scope].slots.root.position;
      expected[scope].slots.sider.flexDirection = baseline[scope].slots.sider.flexDirection;
    }
  }

  return expected;
}

for (const entry of reference.cases) {
  test(`Layout prefix matches source for ${entry.sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=layout-prefix');
    await page.getByRole('combobox', { name: 'Layout prefix sample', exact: true })
      .selectOption(entry.sample.id);

    await expect.poll(() => page.evaluate(snapshotLayoutPrefix))
      .toEqual(isolatedAliasMetrics(entry.metrics, entry.sample));
  });
}

test('Layout prefix updates retain root and Sider identity with isolated sibling styles',
  async ({ page }) => {
    await page.goto('/?fixture=layout-prefix');
    const select = page.getByRole('combobox', { name: 'Layout prefix transition', exact: true });
    await select.selectOption('before');
    const root = page.locator('[data-layout-prefix="normal"] [data-layout-part="root"]');
    const original = await root.elementHandle();
    const originalSider = await root.locator('aside').elementHandle();

    for (const entry of reference.transitions) {
      await select.selectOption(entry.step);

      await expect.poll(() => page.evaluate(snapshotLayoutPrefix))
        .toEqual(isolatedAliasMetrics(entry.metrics, entry.sample));
      expect(entry.sameRoot && entry.sameSider).toBe(true);
      expect(await root.evaluate((node, previous) => node === previous, original)).toBe(true);
      expect(await root.locator('aside').evaluate((node, previous) => node === previous,
        originalSider)).toBe(true);
    }
  });

test('Layout prefix updates preserve drafts, selection, focus and keyboard collapse',
  async ({ page }) => {
    await page.goto('/?fixture=layout-prefix');
    await page.getByRole('checkbox', { name: 'Interactive Layout prefix', exact: true }).check();
    const host = page.locator('[data-layout-prefix="normal"]');
    const sider = host.locator('aside').first();
    const trigger = sider.getByRole('button');
    const controls = await trigger.getAttribute('aria-controls');
    const original = await trigger.elementHandle();
    const draft = host.getByRole('textbox', { name: 'Layout config draft', exact: true });
    await draft.fill('Prefix retained draft');
    await trigger.press('Enter');
    await expect(sider).toHaveCSS('width', '80px');
    await draft.focus();
    await draft.evaluate(node => (node as HTMLInputElement).setSelectionRange(2, 10));
    const select = page.getByRole('combobox', { name: 'Layout prefix transition', exact: true });

    for (const entry of reference.transitions) {
      await select.selectOption(entry.step);

      await expect(draft).toHaveValue('Prefix retained draft');
      await expect(draft).toBeFocused();
      expect(await draft.evaluate(node => [
        (node as HTMLInputElement).selectionStart, (node as HTMLInputElement).selectionEnd
      ])).toEqual([2, 10]);
      await expect(sider).toHaveCSS('width', '80px');
      await expect(trigger).toHaveAttribute('aria-controls', controls!);
      expect(await trigger.evaluate((node, previous) => node === previous, original)).toBe(true);
    }
    await trigger.press('Space');
    await expect(sider).toHaveCSS('width', '120px');
    await expect(trigger).toBeFocused();
  });

test('Layout prefix preserves adaptive dark compact defaults beside the shared namespace',
  async ({ page }) => {
    await page.goto('/?fixture=layout-prefix');
    await page.getByRole('combobox', { name: 'Layout prefix sample', exact: true })
      .selectOption('light-ltr');
    await page.getByRole('checkbox', { name: 'Legacy dark Layout prefix theme', exact: true }).check();

    await expect.poll(() => page.evaluate(() => {
      const parts = ['root', 'sider', 'header', 'footer'];
      return ['normal', 'sibling'].map(id => {
        const host = document.querySelector(`[data-layout-prefix="${id}"]`)!;
        return parts.map(part => {
          const node = host.querySelector(`[data-layout-part="${part}"]`)!;
          const css = getComputedStyle(node);
          const properties = part === 'root' ? ['background-color', 'color']
            : part === 'sider' ? ['background-color', 'color', 'padding-bottom']
              : ['background-color', 'color', 'padding', 'height'];
          return properties.map(property => css.getPropertyValue(property));
        });
      });
    }).then(([normal, sibling]) => normal.every((values, index) =>
      JSON.stringify(values) === JSON.stringify(sibling[index])))).toBe(true);
  });

for (const sampleId of ['zero-ltr', 'shared-zero-ltr']) {
  test(`Sider keeps zero-width focus and explicit owner choice for ${sampleId}`,
    async ({ page }) => {
      await page.goto('/?fixture=layout-prefix');
      await page.getByRole('combobox', { name: 'Layout prefix sample', exact: true })
        .selectOption(sampleId);
      await page.getByRole('checkbox', { name: 'Interactive Layout prefix', exact: true }).check();
      const sider = page.locator('[data-layout-prefix="normal"] aside').first();
      const draft = sider.getByRole('textbox', { name: 'Layout sidebar draft', exact: true });
      const trigger = sider.getByRole('button');
      const bodyId = await trigger.getAttribute('aria-controls');
      const body = page.locator(`[id="${bodyId}"]`);
      await draft.fill('Zero-width draft');
      await draft.focus();
      await trigger.dispatchEvent('click');

      await expect(sider).toHaveCSS('width', '0px');
      await expect(body).toHaveAttribute('inert', '');
      await expect(trigger).toBeFocused();
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
      await trigger.press('Enter');
      await expect(body).not.toHaveAttribute('inert');
      await expect(draft).toHaveValue('Zero-width draft');
      await draft.focus();
      await trigger.evaluate(node => {
        (node as HTMLButtonElement).click();
        document.querySelector<HTMLInputElement>(
          '[data-layout-prefix="normal"] [data-layout-part="content"] input'
        )!.focus();
      });
      await expect(page.locator('[data-layout-prefix="normal"]')
        .getByRole('textbox', { name: 'Layout config draft', exact: true })).toBeFocused();
    });
}
