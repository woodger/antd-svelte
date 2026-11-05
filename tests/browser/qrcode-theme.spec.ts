import { test, expect } from './test';
import reference from './fixtures/ant-design-qrcode-theme-reference.json' with { type: 'json' };
import { snapshotQRCodeTheme } from './qrcode-theme-metrics';

test.use({ viewport: reference.viewport });

for (const sample of reference.cases) {
  test(`QRCode theme matches source geometry, status colors and drawing for ${sample.name}`,
    async ({ page }) => {
      await page.goto('/?fixture=qrcode-theme');
      await page.getByLabel('QRCode theme preset', { exact: true }).selectOption(sample.name);

      await expect.poll(() => page.evaluate(snapshotQRCodeTheme)).toEqual(sample.metrics);
    });
}

test('QRCode theme updates repaint the same canvas and SVG while preserving focus and isolated scopes',
  async ({ page }) => {
    await page.goto('/?fixture=qrcode-theme');
    const canvas = page.locator('[data-qrcode-theme="canvas"] canvas');
    const svg = page.locator('[data-qrcode-theme="svg"] svg');
    const button = page.locator('[data-qrcode-theme="custom"] button');
    await button.focus();
    const originalCanvas = await canvas.elementHandle();
    const originalSvg = await svg.elementHandle();
    const originalButton = await button.elementHandle();
    const before = await page.evaluate(snapshotQRCodeTheme);
    await page.getByRole('button', { name: 'Update QRCode global text', exact: true })
      .dispatchEvent('click');

    await expect.poll(async () => (await page.evaluate(snapshotQRCodeTheme)).canvas.drawing.palette)
      .toEqual(['19,82,0,255']);
    await expect.poll(async () => (await page.evaluate(snapshotQRCodeTheme)).svg.drawing.fills?.[1])
      .toBe('rgb(19, 82, 0)');
    const changed = await page.evaluate(snapshotQRCodeTheme);
    expect(changed.explicit.drawing.palette).toEqual(before.explicit.drawing.palette);
    expect(changed.sibling).toEqual(before.sibling);
    expect(changed.outside).toEqual(before.outside);
    expect(changed.expired.text?.color).toBe('rgb(114, 46, 209)');
    await expect(button).toBeFocused();
    expect(await canvas.evaluate((node, old) => node === old, originalCanvas)).toBe(true);
    expect(await svg.evaluate((node, old) => node === old, originalSvg)).toBe(true);
    expect(await button.evaluate((node, old) => node === old, originalButton)).toBe(true);
    await expect(page.getByLabel('QRCode theme ref canvas', { exact: true })).toHaveText('mounted');
    await expect(page.getByLabel('QRCode theme refresh custom', { exact: true })).toHaveText('0');
    await page.getByRole('button', { name: 'Update QRCode cover and padding', exact: true })
      .dispatchEvent('click');

    await expect(page.locator('[data-qrcode-theme="expired"] .ant-qrcode-cover'))
      .toHaveCSS('background-color', 'rgba(230, 244, 255, 0.96)');
    await expect(page.locator('[data-qrcode-theme="canvas"] .ant-qrcode')).toHaveCSS('padding', '24px');
    await expect(page.locator('[data-qrcode-theme="borderless"] .ant-qrcode')).toHaveCSS('padding', '0px');
    for (const [id, padding] of [['nested', 6], ['reset', 5], ['sibling', 4], ['outside', 12]]) {
      await expect(page.locator(`[data-qrcode-theme="${id}"] .ant-qrcode`))
        .toHaveCSS('padding', `${padding}px`);
    }
    await expect(button).toBeFocused();
    await page.getByLabel('Inherit child QRCode theme', { exact: true }).dispatchEvent('click');

    await expect.poll(async () => (await page.evaluate(snapshotQRCodeTheme)).nested.drawing.palette)
      .toEqual(['0,0,0,224']);
    await page.getByLabel('Apply source QRCode theme', { exact: true }).dispatchEvent('click');

    await expect.poll(async () => (await page.evaluate(snapshotQRCodeTheme)).canvas.drawing.palette)
      .toEqual(['0,0,0,224']);
    await expect(button).toBeFocused();
    await button.press('Enter');

    await expect(page.getByLabel('QRCode theme refresh custom', { exact: true })).toHaveText('1');
    await expect(page.locator('[data-qrcode-theme="custom"] .ant-qrcode-cover')).toBeVisible();
    await page.getByLabel('Mount themed QRCode controls', { exact: true }).dispatchEvent('click');

    await expect(canvas).toHaveCount(0);
    await expect(svg).toHaveCount(0);
    expect(await originalCanvas!.evaluate(node => node.isConnected)).toBe(false);
    expect(await originalSvg!.evaluate(node => node.isConnected)).toBe(false);
    await expect(page.locator('[data-qrcode-theme="outside"] .ant-qrcode')).toBeVisible();
  });
