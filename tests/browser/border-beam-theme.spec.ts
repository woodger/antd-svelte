import { test, expect } from './test';
import reference from './fixtures/ant-design-border-beam-theme-reference.json' with { type: 'json' };
import { snapshotBorderBeamTheme } from './border-beam-theme-metrics';

test.use({ viewport: reference.viewport });

for (const sample of reference.cases) {
  test(`BorderBeam themes match source aliases, timing and portal scopes for ${sample.name}`,
    async ({ page }) => {
      await page.goto('/?fixture=border-beam-theme');
      await page.getByLabel('BorderBeam theme preset', { exact: true }).selectOption(sample.name);

      await expect.poll(() => page.evaluate(snapshotBorderBeamTheme)).toEqual(sample.metrics);
    });
}

test('BorderBeam token updates retain target content, layer identity and scoped explicit overrides',
  async ({ page }) => {
    await page.goto('/?fixture=border-beam-theme');
    const host = page.locator('[data-beam-theme="normal"]');
    const layer = host.locator('.ant-border-beam');
    const external = page.locator('[data-beam-theme="external"] .ant-border-beam').first();
    const input = host.getByRole('textbox', { name: 'Beam themed draft normal', exact: true });
    await expect(layer).toHaveCSS('padding', '4px');
    await input.fill('Preserved beam draft');
    await input.focus();
    await input.evaluate(node => {
      if (!(node instanceof HTMLInputElement)) throw new Error('Expected native beam input');
      node.setSelectionRange(2, 9);
    });
    const oldLayer = await layer.elementHandle();
    const oldExternal = await external.elementHandle();
    const oldInput = await input.elementHandle();
    await page.getByRole('button', { name: 'Update beam tokens', exact: true }).dispatchEvent('click');

    await expect(layer).toHaveCSS('padding', '8px');
    await expect(external).toHaveCSS('padding', '8px');
    await expect.poll(() => external.evaluate(node =>
      getComputedStyle(node, '::before').backgroundImage
    )).toContain('rgb(19, 82, 0)');
    await expect(input).toHaveValue('Preserved beam draft');
    await expect(input).toBeFocused();
    expect(await input.evaluate(node => {
      if (!(node instanceof HTMLInputElement)) throw new Error('Expected native beam input');

      return [node.selectionStart, node.selectionEnd];
    })).toEqual([2, 9]);
    expect(await layer.evaluate((node, old) => node === old, oldLayer)).toBe(true);
    expect(await external.evaluate((node, old) => node === old, oldExternal)).toBe(true);
    expect(await input.evaluate((node, old) => node === old, oldInput)).toBe(true);
    for (const [id, width] of [['explicit', 7], ['variable', 6], ['nested', 2], ['reset', 3],
      ['sibling', 5], ['outside', 1]]) {
      await expect(page.locator(`[data-beam-theme="${id}"] .ant-border-beam`))
        .toHaveCSS('padding', `${width}px`);
    }
    await page.getByLabel('Mount themed beam controls', { exact: true }).dispatchEvent('click');

    await expect(layer).toHaveCount(0);
    await expect(page.locator('[data-beam-theme="external"] .ant-border-beam')).toHaveCount(0);
    expect(await oldExternal!.evaluate(node => node.isConnected)).toBe(false);
    await expect(page.getByRole('textbox', { name: 'Beam external draft', exact: true }))
      .toHaveValue('External draft');
  });

test('BorderBeam preserves owner CSS overrides for an external target and releases its observer',
  async ({ page }) => {
    await page.goto('/?fixture=border-beam-theme');
    await page.getByLabel('BorderBeam theme preset', { exact: true }).selectOption('default');
    const owner = page.locator('[data-beam-owner="external"]');
    const beam = page.locator('[data-beam-theme="external"] .ant-border-beam').first();
    await expect(beam).toHaveCSS('padding', '1px');
    const origin = await owner.evaluateHandle(node => node.closest('.ant-svelte-theme')!);
    await origin.evaluate(node => {
      const element = node as HTMLElement;
      element.style.setProperty('--ant-line-width', '6px');
      element.style.setProperty('--ant-color-primary', '#135200');
    });

    await expect(beam).toHaveCSS('padding', '6px');
    await expect.poll(() => beam.evaluate(node =>
      getComputedStyle(node, '::before').backgroundImage
    )).toContain('rgb(19, 82, 0)');
    const oldBeam = await beam.elementHandle();
    await page.getByLabel('Mount themed beam controls', { exact: true }).uncheck();
    const oldStyle = await oldBeam!.getAttribute('style');
    await origin.evaluate(node => (node as HTMLElement).style.setProperty('--ant-line-width', '9px'));
    await page.setViewportSize({ width: 1000, height: 900 });

    expect(await oldBeam!.getAttribute('style')).toBe(oldStyle);
    expect(await oldBeam!.evaluate(node => node.isConnected)).toBe(false);
  });

test('BorderBeam clears source styling and inherits the physical target again when source theme is removed',
  async ({ page }) => {
    await page.goto('/?fixture=border-beam-theme');
    const external = page.locator('[data-beam-theme="external"] .ant-border-beam').first();
    await expect(external).toHaveCSS('padding', '4px');
    await page.getByLabel('Apply source beam theme', { exact: true }).uncheck();

    await expect(external).toHaveCSS('padding', '9px');
    await expect.poll(() => external.evaluate(node =>
      getComputedStyle(node, '::before').backgroundImage
    )).toContain('rgb(250, 84, 28)');
  });
