import { test, expect } from './test';
import reference from './fixtures/ant-design-qrcode-prefix-reference.json' with { type: 'json' };
import { snapshotQRCodePrefix } from './qrcode-prefix-metrics';

for (const entry of reference.cases) {
  test(`QRCode prefix matches source root, cover and renderer metrics for ${entry.sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=qrcode-prefix');
    await page.getByRole('combobox', { name: 'QRCode prefix sample', exact: true })
      .selectOption(entry.sample.id);
    const expected = Object.fromEntries(Object.entries(entry.metrics).map(([key, value]) =>
      [key, { ...value, root: { ...value.root, direction: entry.sample.direction } }]));

    await expect.poll(() => page.evaluate(snapshotQRCodePrefix)).toEqual(expected);
  });
}

test('QRCode changes prefixes without replacing its root or canvas and retains refresh keyboard access', async ({ page }) => {
  await page.goto('/?fixture=qrcode-prefix');
  const select = page.getByRole('combobox', { name: 'QRCode prefix transition', exact: true });
  await select.selectOption('before');
  const host = page.locator('[data-qrcode-prefix="normal"]');
  const original = await host.locator(':scope > div').elementHandle();
  const canvas = await host.locator('canvas').elementHandle();

  for (const entry of reference.transitions) {
    await select.selectOption(entry.step);

    await expect.poll(() => page.evaluate(snapshotQRCodePrefix)).toEqual(entry.metrics);
    expect(entry.sameRoot).toBe(true);
    expect(entry.sameDrawing).toBe(true);
    expect(await page.evaluate(node => node === document.querySelector(
      '[data-qrcode-prefix="normal"] > div'
    ), original)).toBe(true);
    expect(await page.evaluate(node => node === document.querySelector(
      '[data-qrcode-prefix="normal"] canvas'
    ), canvas)).toBe(true);
  }

  await host.getByRole('button').focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('status', { name: 'QRCode prefix refreshes', exact: true }))
    .toHaveText('1');
});

test('QRCode prefix preserves the legacy dark cover background alongside the default namespace', async ({ page }) => {
  await page.goto('/?fixture=qrcode-prefix');
  await page.getByRole('combobox', { name: 'QRCode prefix sample', exact: true })
    .selectOption('expired-canvas-ltr');
  await page.getByRole('checkbox', { name: 'Legacy dark QRCode prefix theme', exact: true }).check();

  await expect.poll(async () => {
    const metrics = await page.evaluate(snapshotQRCodePrefix);
    return [metrics.normal.cover?.['background-color'], metrics.sibling.cover?.['background-color']];
  }).toEqual(['color(srgb 0.0784314 0.0784314 0.0784314 / 0.96)',
    'color(srgb 0.0784314 0.0784314 0.0784314 / 0.96)']);
});
