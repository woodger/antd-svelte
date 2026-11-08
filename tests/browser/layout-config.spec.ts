import { test, expect } from './test';
import reference from './fixtures/ant-design-layout-config-reference.json' with { type: 'json' };
import { snapshotLayoutConfig } from './layout-config-metrics';

function nativeStandaloneDefaults(metrics: typeof reference.cases[number]['metrics'],
  direction: string, step?: string) {
  const expected = structuredClone(metrics);

  for (const scope of ['normal', 'nested', 'sibling'] as const) {
    // Source standalone Header/Footer теряют Layout variables; native секции сохраняют тему.
    for (const part of ['header', 'footer'] as const) {
      const standalone = `standalone-${part}` as const;
      expected[scope][standalone] = {
        ...expected[scope][part], classes: expected[scope][standalone].classes
      };
    }
    // Native standalone sections и Sider явно наследуют RTL.
    for (const part of [
      'standalone-header', 'standalone-content', 'standalone-footer', 'standalone-sider'
    ] as const) {
      expected[scope][part].direction = direction;
    }
  }

  // Source React удаляет longhand без восстановления неизменившегося shorthand.
  if (step === 'config-clear') {
    expected.sibling.root.paddingTop = reference.observations.shorthandRemoval.fresh.paddingTop;
  }

  return expected;
}

for (const entry of reference.cases) {
  test(`Layout config matches source for ${entry.sample.id}`, async ({ page }) => {
    const expected = nativeStandaloneDefaults(entry.metrics, entry.sample.direction);
    await page.goto('/?fixture=layout-config');
    await page.getByRole('combobox', { name: 'Layout config sample', exact: true })
      .selectOption(entry.sample.id);

    await expect.poll(() => page.evaluate(snapshotLayoutConfig)).toEqual(expected);
  });
}

test('Layout config updates retain root identity and isolate nested and sibling scopes',
  async ({ page }) => {
    await page.goto('/?fixture=layout-config');
    const select = page.getByRole('combobox', { name: 'Layout config transition', exact: true });
    await select.selectOption('before');
    const root = page.locator('[data-layout-config="normal"] [data-layout-part="root"]');
    const original = await root.elementHandle();

    for (const entry of reference.transitions) {
      await select.selectOption(entry.step);

      await expect.poll(() => page.evaluate(snapshotLayoutConfig))
        .toEqual(nativeStandaloneDefaults(entry.metrics, entry.sample.direction, entry.step));
      expect(entry.sameRoot).toBe(true);
      expect(await root.evaluate((node, previous) => node === previous, original)).toBe(true);
    }
  });

test('Layout config updates preserve drafts, selection, focus and Sider collapse state',
  async ({ page }) => {
    await page.goto('/?fixture=layout-config');
    await page.getByRole('combobox', { name: 'Layout config sample', exact: true })
      .selectOption('sider-ltr');
    await page.getByRole('checkbox', { name: 'Interactive Layout config', exact: true }).check();
    const host = page.locator('[data-layout-config="normal"]');
    const draft = host.getByRole('textbox', { name: 'Layout config draft', exact: true });
    const sider = host.locator('[data-layout-part="sider"]');
    const root = host.locator('[data-layout-part="root"]');
    const before = {
      root: await root.elementHandle(), sider: await sider.elementHandle(),
      input: await draft.elementHandle()
    };
    await draft.fill('Retained layout draft');
    await sider.getByRole('button').press('Enter');
    await expect(sider).toHaveCSS('width', '80px');
    await draft.focus();
    await draft.evaluate(node => (node as HTMLInputElement).setSelectionRange(3, 12));
    await page.getByRole('button', { name: 'Update Layout config record', exact: true })
      .dispatchEvent('click');

    await expect(root).toHaveCSS('padding-top', '12px');
    await expect(root).toHaveClass(/ctx-updated/);
    await expect(sider).toHaveCSS('width', '80px');
    await expect(draft).toHaveValue('Retained layout draft');
    await expect(draft).toBeFocused();
    expect(await draft.evaluate(node => [
      (node as HTMLInputElement).selectionStart, (node as HTMLInputElement).selectionEnd
    ])).toEqual([3, 12]);
    expect(await root.evaluate((node, previous) => node === previous, before.root)).toBe(true);
    expect(await sider.evaluate((node, previous) => node === previous, before.sider)).toBe(true);
    expect(await draft.evaluate((node, previous) => node === previous, before.input)).toBe(true);
    await expect(page.getByRole('status', { name: 'Layout config changes', exact: true }))
      .toHaveText('[{"collapsed":true,"type":"clickTrigger"}]');
  });
