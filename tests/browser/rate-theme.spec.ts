import { test, expect } from './test';
import reference from './fixtures/ant-design-rate-theme-reference.json' with { type: 'json' };
import { snapshotRateTheme, snapshotRateThemeInteraction } from './rate-theme-metrics';

test.use({ viewport: reference.viewport });

for (const sample of reference.cases) {
  test(`Rate tokens match source geometry, colors and focus for ${sample.name}`, async ({ page }) => {
    await page.goto('/?fixture=rate-theme');
    await page.getByLabel('Rate token preset', { exact: true }).selectOption(sample.name);
    await page.mouse.move(0, 0);

    await expect.poll(() => page.evaluate(snapshotRateTheme)).toEqual(sample.metrics);
    if ('states' in sample && sample.states) {
      const control = page.locator('[data-rate-theme="normal"] [role="radio"]').nth(3);
      const nativeFallback = 'opaque' in sample && sample.opaque
        && !('priority' in sample && sample.priority);
      // Raw Source evidence сохраняет none; native opaque-transform boundary описана в реестре.
      const hover = nativeFallback
        ? { ...sample.states.hover, transform: 'matrix(1.1, 0, 0, 1.1, 0, 0)' }
        : sample.states.hover;
      const focus = nativeFallback
        ? { ...sample.states.focus, transform: 'matrix(1.1, 0, 0, 1.1, 0, 0)' }
        : sample.states.focus;
      await control.hover();

      await expect.poll(() => page.evaluate(snapshotRateThemeInteraction, 'normal')).toEqual(hover);
      await page.mouse.move(0, 0);
      await page.keyboard.press('Shift');
      await control.focus();

      await expect.poll(() => page.evaluate(snapshotRateThemeInteraction, 'normal')).toEqual(focus);
      await control.blur();
      await page.locator('[data-rate-theme="disabled"] [role="radio"]').nth(3).hover();

      await expect.poll(() => page.evaluate(snapshotRateThemeInteraction, 'disabled'))
        .toEqual(sample.states.disabled);
    }
  });
}

test('Rate theme updates preserve value, radio identity, focus, callbacks and provider scopes',
  async ({ page }) => {
    await page.goto('/?fixture=rate-theme');
    const root = page.locator('[data-rate-theme="normal"] .ant-rate');
    const radio = root.getByRole('radio', { name: '3', exact: true });
    await radio.focus();
    const input = await radio.elementHandle();
    const original = await root.elementHandle();
    await page.getByRole('button', { name: 'Update Rate star size', exact: true })
      .dispatchEvent('click');

    for (const id of ['normal', 'rtl', 'disabled', 'character', 'tooltips']) {
      await expect(page.locator(`[data-rate-theme="${id}"] .ant-rate`)).toHaveCSS('font-size', '28px');
    }
    for (const [id, size] of [
      ['small', 18], ['large', 30], ['nested', 22], ['reset', 19], ['sibling', 21], ['outside', 20]
    ]) {
      await expect(page.locator(`[data-rate-theme="${id}"] .ant-rate`))
        .toHaveCSS('font-size', `${size}px`);
    }
    await expect(radio).toBeFocused();
    await expect(root.locator('.ant-rate-star-half')).toHaveCount(1);
    await expect(page.getByLabel('Rate theme value', { exact: true })).toHaveText('2.5');
    await expect(page.getByLabel('Rate theme events', { exact: true })).toHaveText('[]');
    await expect(page.getByLabel('Rate theme focus events', { exact: true })).toHaveText('["focus"]');
    await expect(page.getByLabel('Rate theme ref', { exact: true })).toHaveText('mounted');
    expect(await radio.evaluate((node, before) => node === before, input)).toBe(true);
    expect(await root.evaluate((node, before) => node === before, original)).toBe(true);
    await radio.press('ArrowRight');

    await expect(page.getByLabel('Rate theme value', { exact: true })).toHaveText('3');
    await expect(page.getByLabel('Rate theme events', { exact: true })).toHaveText('[3]');
    await page.getByLabel('Inherit child Rate tokens', { exact: true }).dispatchEvent('click');

    await expect(page.locator('[data-rate-theme="nested"] .ant-rate-star-zero .ant-rate-star-second')
      .first()).toHaveCSS('color', 'rgba(0, 0, 0, 0.06)');
    await page.getByLabel('Apply source Rate tokens', { exact: true }).dispatchEvent('click');

    await expect(root).toHaveCSS('font-size', '20px');
    await expect(radio).toBeFocused();
    await expect(page.getByLabel('Rate theme value', { exact: true })).toHaveText('3');
    await expect(page.getByLabel('Rate theme events', { exact: true })).toHaveText('[3]');
    await page.getByLabel('Mount themed Rate controls', { exact: true }).dispatchEvent('click');

    await expect(root).toHaveCount(0);
    expect(await original!.evaluate(node => node.isConnected)).toBe(false);
    await expect(page.locator('[data-rate-theme="outside"] .ant-rate')).toBeVisible();
  });

test('Rate opaque transform fallback retains custom variable and local style priority', async ({ page }) => {
  await page.goto('/?fixture=rate-theme');
  await page.getByLabel('Rate token preset', { exact: true }).selectOption('opaque-css-prefix');
  const root = page.locator('[data-rate-theme="normal"] .ant-rate');
  const radio = root.getByRole('radio', { name: '4', exact: true });
  await page.keyboard.press('Shift');
  await radio.focus();

  await expect(radio).toHaveCSS('transform', 'matrix(1.1, 0, 0, 1.1, 0, 0)');
  await root.evaluate(node => (node as HTMLElement).style
    .setProperty('--owned-rate-star-hover-scale', 'scale(1.6)'));

  await expect(radio).toHaveCSS('transform', 'matrix(1.6, 0, 0, 1.6, 0, 0)');
  await root.evaluate(node => (node as HTMLElement).style
    .setProperty('--ant-rate-star-hover-scale', 'scale(1.7)'));

  await expect(radio).toHaveCSS('transform', 'matrix(1.7, 0, 0, 1.7, 0, 0)');
  await expect(page.getByLabel('Rate theme events', { exact: true })).toHaveText('[]');
});
