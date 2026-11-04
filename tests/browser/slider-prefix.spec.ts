import { test, expect } from './test';
import reference from './fixtures/ant-design-slider-prefix-reference.json' with { type: 'json' };
import { snapshotSliderPrefix } from './slider-prefix-metrics';

test.use({ viewport: reference.viewport });

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=slider-prefix');
  await expect(page.getByRole('heading', { name: 'Slider prefixes', exact: true })).toBeVisible();
});

for (const sample of reference.cases) {
  test(`Slider prefix matches source classes, styles and popup ownership for ${sample.name}`,
    async ({ page }) => {
      await page.getByRole('combobox', { name: 'Slider prefix preset', exact: true })
        .selectOption(sample.name);
      await page.mouse.move(0, 0);
      const args = { prefix: sample.prefix || 'ant-slider', tip: sample.tip || 'ant-tooltip' };
      // Native disabled сохраняет согласованное скрытие Tooltip даже при open=true.
      const base = sample.disabled ? { ...sample.base, popups: [] } : sample.base;

      await expect.poll(() => page.evaluate(snapshotSliderPrefix, args)).toEqual(base);
      if (sample.focus) {
        await page.locator('[data-slider-prefix-case]').getByRole('slider').first().focus();

        await expect.poll(() => page.evaluate(snapshotSliderPrefix, args)).toEqual(sample.focus);
      }
    });
}

for (const preset of ['tenant-single', 'tenant-range', 'active-range', 'native-dark-single']) {
  test(`Slider prefix updates preserve focus, input, values and callbacks for ${preset}`,
    async ({ page }) => {
      await page.getByRole('combobox', { name: 'Slider prefix preset', exact: true })
        .selectOption(preset);
      const input = page.locator('[data-slider-prefix-case]').getByRole('slider').first();
      await input.focus();
      await input.press('ArrowRight');
      const original = await input.elementHandle();
      const value = await page.getByLabel('Prefix value', { exact: true }).textContent();
      const events = await page.getByLabel('Prefix events', { exact: true }).textContent();

      await page.getByRole('button', { name: 'Set alternate slider prefix', exact: true })
        .dispatchEvent('click');

      await expect(page.locator('[data-slider-prefix-case] > .next-slider')).toBeVisible();
      await expect(input).toBeFocused();
      expect(await input.evaluate((node, before) => node === before, original)).toBe(true);
      await expect(page.getByLabel('Prefix value', { exact: true })).toHaveText(value!);
      await expect(page.getByLabel('Prefix events', { exact: true })).toHaveText(events!);
      await expect(page.locator('.next-slider-tooltip:popover-open').first()).toBeVisible();
      expect(await page.locator('#prefix-form').evaluate(form =>
        new FormData(form as HTMLFormElement).getAll('prefix-value')))
        .toEqual(preset.includes('single') ? ['25'] : ['25', '75']);

      await page.getByRole('button', { name: 'Use default slider prefix', exact: true })
        .dispatchEvent('click');

      await expect(page.locator('[data-slider-prefix-case] > .ant-slider')).toBeVisible();
      await expect(input).toBeFocused();
      await expect(page.locator('style[data-ant-svelte-theme="slider-prefix:next-slider"]'))
        .toHaveCount(0);
    });
}

test('Slider prefix defaults remain isolated from an adjacent range and Input', async ({ page }) => {
  const neighbor = page.locator('[data-prefix-neighbor]');
  const snapshot = () => neighbor.evaluate(root => {
    const rail = getComputedStyle(root.querySelector('.ant-slider-rail')!);
    const input = getComputedStyle(root.querySelector('input.ant-input')!);
    return [rail.height, rail.backgroundColor, input.fontSize, input.color];
  });
  const before = await snapshot();

  await page.getByRole('combobox', { name: 'Slider prefix preset', exact: true })
    .selectOption('marker-single');

  await expect.poll(snapshot).toEqual(before);
  await expect(page.getByLabel('Prefix neighbor', { exact: true })).toBeEnabled();
});

test('Slider prefix CSS reaches portals and cleans up with a focused owner', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Slider prefix preset', exact: true })
    .selectOption('tooltip-range');
  await page.getByLabel('Portal prefix tooltips', { exact: true }).dispatchEvent('click');
  const popup = page.locator('body > .owner-slider-tooltip:popover-open').first();
  await expect(popup).toBeVisible();
  await expect(popup).toHaveClass(/owner-tip/);
  await page.locator('[data-slider-prefix-case]').getByRole('slider').first().focus();

  await page.getByLabel('Mount prefix slider', { exact: true }).dispatchEvent('click');

  await expect(page.locator('.owner-slider-tooltip')).toHaveCount(0);
  await expect(page.locator('style[data-ant-svelte-theme="slider-prefix:owner-slider"]'))
    .toHaveCount(0);
});

test('Slider prefix root variables keep semantic style priority', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Slider prefix preset', exact: true })
    .selectOption('own-single');
  await page.getByLabel('Override prefix rail', { exact: true }).dispatchEvent('click');

  await expect(page.locator('.token-slider-rail')).toHaveCSS('height', '13px');
});

test('Slider prefix native transitions respect reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.getByRole('combobox', { name: 'Slider prefix preset', exact: true })
    .selectOption('native-single');
  await expect(page.locator('.native-slider-rail')).toHaveCSS('transition-duration', '0.2s');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.native-slider-rail')).toHaveCSS('transition-duration', '0s');
  await expect.poll(() => page.locator('.native-slider-handle').evaluate(node =>
    getComputedStyle(node, '::after').transitionDuration)).toBe('0s');
});
