import { test, expect } from './test';
import reference from './fixtures/ant-design-watermark-theme-reference.json' with { type: 'json' };
import { snapshotWatermarkTheme, traceWatermarkTheme } from './watermark-theme-metrics';

test.use({ viewport: reference.viewport });
test.beforeEach(async ({ page }) => {
  await page.addInitScript(traceWatermarkTheme);
  await page.goto('/?fixture=watermark-theme');
});

for (const sample of reference.cases) {
  test(`Watermark raw global tokens match source Canvas and layer styles for ${sample.name}`,
    async ({ page }) => {
      await page.getByLabel('Watermark theme preset', { exact: true }).selectOption(sample.name);

      await expect.poll(() => page.evaluate(snapshotWatermarkTheme)).toEqual(sample.metrics);
    });
}

test('Watermark global updates preserve the wrapper, mark, draft, selection and native ref',
  async ({ page }) => {
    const host = page.locator('[data-watermark-theme="normal"]');
    const root = host.locator('.theme-watermark');
    const mark = root.locator(':scope > div[style*="background-image"]');
    await expect(mark).toHaveCSS('z-index', '1699');
    const oldRoot = await root.elementHandle();
    const oldMark = await mark.elementHandle();
    const original = await mark.evaluate(node => getComputedStyle(node).backgroundImage);
    const input = root.getByRole('textbox', { name: 'Watermark theme draft normal', exact: true });
    await input.fill('Theme draft');
    await input.focus();
    await input.evaluate(async node => {
      (node as HTMLInputElement).setSelectionRange(2, 7);
      await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() =>
        resolve())));
    });
    await page.getByRole('button', { name: 'Update Watermark tokens', exact: true })
      .dispatchEvent('click');

    await expect(mark).toHaveCSS('z-index', '2299');
    await expect.poll(() => mark.evaluate(node => getComputedStyle(node).backgroundImage))
      .not.toBe(original);
    const metrics = await page.evaluate(snapshotWatermarkTheme) as typeof reference.cases[0]['metrics'];
    expect(metrics.normal.text).toEqual([
      { text: 'normal:Text', font: '26px sans-serif', color: '#135200', align: 'center' }
    ]);
    expect(metrics.css.text[0].font).toBe('26px sans-serif');
    expect(metrics.explicit.text[0].font).toBe('bold 20px serif');
    expect(metrics.explicit.mark['z-index']).toBe('77');
    expect(metrics.lines.text[1].font).toBe('italic 12px sans-serif');
    expect(metrics.lines.text[1].color).toBe('#389e0d');
    expect(metrics.nested.text[0].font).toBe('14px sans-serif');
    expect(metrics.nested.text[0].color).toBe('#135200');
    expect(metrics.reset.text[0].color).toBe('#fa8c16');
    expect(metrics.sibling.text[0].color).toBe('#13c2c2');
    expect(metrics.outside.mark['z-index']).toBe('999');
    expect(await root.evaluate((node, old) => node === old, oldRoot)).toBe(true);
    expect(await mark.evaluate((node, old) => node === old, oldMark)).toBe(true);
    await expect(input).toHaveValue('Theme draft');
    await expect(input).toBeFocused();
    expect(await input.evaluate(node => {
      const element = node as HTMLInputElement;
      return [element.selectionStart, element.selectionEnd];
    })).toEqual([2, 7]);
    await expect(host.getByLabel('Watermark theme ref normal', { exact: true })).toHaveText('mounted');
    await expect(host.getByLabel('Watermark theme removals normal', { exact: true })).toHaveText('0');
  });

for (const kind of ['modal', 'drawer'] as const) {
  test(`Watermark updates its inherited ${kind} PNG without replacing panel content or focus`,
    async ({ page }) => {
      await page.getByRole('button', { name: `Open themed Watermark ${kind}`, exact: true }).click();
      const panel = page.locator(kind === 'modal' ? '.ant-modal-container' : '.ant-drawer-section');
      const mark = panel.locator(':scope > div[style*="background-image"]');
      const rootMark = page.locator('[data-watermark-theme="normal"] .theme-watermark')
        .locator(':scope > div[style*="background-image"]');
      await expect(mark).toHaveCSS('z-index', '1699');
      const original = await mark.elementHandle();
      const input = panel.getByRole('textbox', { name: `Watermark ${kind} draft`, exact: true });
      await input.fill('Panel theme draft');
      await input.focus();
      await input.evaluate(async node => {
        (node as HTMLInputElement).setSelectionRange(1, 8);
        await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() =>
          resolve())));
      });
      await page.getByRole('button', { name: 'Update Watermark tokens', exact: true })
        .dispatchEvent('click');

      await expect(mark).toHaveCSS('z-index', '2299');
      await expect.poll(() => mark.evaluate(node => getComputedStyle(node).backgroundImage))
        .toBe(await rootMark.evaluate(node => getComputedStyle(node).backgroundImage));
      expect(await mark.evaluate((node, old) => node === old, original)).toBe(true);
      await expect(input).toHaveValue('Panel theme draft');
      await expect(input).toBeFocused();
      expect(await input.evaluate(node => {
        const element = node as HTMLInputElement;
        return [element.selectionStart, element.selectionEnd];
      })).toEqual([1, 8]);
      await page.getByLabel('Mount themed Watermark controls', { exact: true })
        .dispatchEvent('click');
      await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() =>
        requestAnimationFrame(() => resolve()))));

      expect(await original!.evaluate(node => node.isConnected)).toBe(false);
      await expect(page.getByRole('textbox', { name: `Watermark ${kind} draft`, exact: true }))
        .toHaveCount(0);
    });
}

test('Watermark restores legacy CSS defaults after removing the source theme', async ({ page }) => {
  await page.getByLabel('Watermark theme preset', { exact: true }).selectOption('custom-css-prefix');
  const root = page.locator('[data-watermark-theme="css"] .theme-watermark');
  const mark = root.locator(':scope > div[style*="background-image"]');
  await expect(mark).toHaveCSS('z-index', '1699');
  await root.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() =>
    requestAnimationFrame(() => resolve()))));
  await page.getByLabel('Apply source Watermark theme', { exact: true }).uncheck();

  await expect(mark).toHaveCSS('z-index', '5999');
  const metrics = await page.evaluate(snapshotWatermarkTheme) as typeof reference.cases[0]['metrics'];
  expect(metrics.css.text[0].font).toBe('50px sans-serif');
  expect(metrics.css.text[0].color).toBe('#ff0000');
  expect(metrics.normal.text[0].font).toBe('16px sans-serif');
  expect(metrics.normal.mark['z-index']).toBe('999');
});
