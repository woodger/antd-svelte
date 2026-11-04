import { test, expect } from './test';
import reference from './fixtures/ant-design-slider-theme-reference.json' with { type: 'json' };
import { snapshotSliderTheme } from './slider-theme-metrics';

test.use({ viewport: reference.viewport });

const ids = ['single-horizontal', 'single-vertical', 'range-horizontal', 'range-vertical'] as const;

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=slider-theme');
  await expect(page.getByRole('heading', { name: 'Source Slider tokens', exact: true }))
    .toBeVisible();
});

for (const sample of reference.cases) {
  for (const id of ids) {
    test(`Slider ${id} tokens match the source for ${sample.name}`, async ({ page }) => {
      await page.getByRole('combobox', { name: 'Slider token preset', exact: true })
        .selectOption(sample.name);
      const root = page.locator(`[data-slider-theme="${id}"] .ant-slider`);
      const expected = sample.metrics[id];
      const snapshot = () => page.evaluate(snapshotSliderTheme, id);
      await page.mouse.move(0, 0);
      await root.scrollIntoViewIfNeeded();

      await expect.poll(snapshot).toEqual(expected.base);
      if (expected.hover) {
        await root.hover({ position: { x: 1, y: 1 } });

        await expect.poll(snapshot).toEqual(expected.hover);
      }

      await page.mouse.move(0, 0);
      await root.getByRole('slider').first().focus();

      await expect.poll(snapshot).toEqual(expected.focus);

      await page.getByLabel('Disable themed Sliders', { exact: true }).dispatchEvent('click');

      await expect.poll(snapshot).toEqual(expected.disabled);
    });
  }
}

test('Slider rail token updates retain values, nodes, focus and callback silence', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Slider token preset', exact: true })
    .selectOption('rail-six');
  const handle = page.locator('[data-slider-theme="single-horizontal"]').getByRole('slider');
  const original = await handle.elementHandle();
  await handle.focus();
  await handle.press('ArrowRight');
  await expect(page.getByLabel('Slider theme value', { exact: true })).toHaveText('51');
  const changes = await page.getByLabel('Slider theme changes', { exact: true }).textContent();

  await page.getByRole('button', { name: 'Set themed rail to eight', exact: true })
    .dispatchEvent('click');

  for (const id of ids) {
    const rail = page.locator(`[data-slider-theme="${id}"] .ant-slider-rail`);
    await expect(rail).toHaveCSS(id.endsWith('vertical') ? 'width' : 'height', '8px');
  }
  await expect(page.locator('[data-slider-theme="nested"] .ant-slider-rail'))
    .toHaveCSS('height', '9px');
  await expect(page.locator('[data-slider-theme="sibling"] .ant-slider-rail'))
    .toHaveCSS('height', '7px');
  await expect(handle).toBeFocused();
  await expect(handle).toHaveValue('51');
  expect(await handle.evaluate((node, old) => node === old, original)).toBe(true);
  await expect(page.getByLabel('Slider theme changes', { exact: true })).toHaveText(changes!);
});

test('Slider tokens stay isolated from nested and sibling providers', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Slider token preset', exact: true })
    .selectOption('own-tokens');

  await expect(page.locator('[data-slider-theme="single-horizontal"] .ant-slider-rail'))
    .toHaveCSS('height', '6px');
  await expect(page.locator('[data-slider-theme="nested"] .ant-slider-rail'))
    .toHaveCSS('height', '9px');
  await expect(page.locator('[data-slider-theme="nested"] .ant-slider-handle'))
    .toHaveCSS('width', '16px');
  await expect(page.locator('[data-slider-theme="sibling"] .ant-slider-rail'))
    .toHaveCSS('height', '7px');
  await expect(page.locator('[data-slider-theme="sibling"] .ant-slider-handle'))
    .toHaveCSS('width', '10px');
  await expect(page.locator('[data-slider-theme="outside"] .ant-slider-rail'))
    .toHaveCSS('height', '4px');
  await expect(page.getByLabel('Slider token neighbor', { exact: true }))
    .toHaveCSS('font-size', '14px');

  await page.getByLabel('Inherit child Slider tokens', { exact: true }).dispatchEvent('click');

  await expect(page.locator('[data-slider-theme="nested"] .ant-slider-rail'))
    .toHaveCSS('height', '9px');
  await expect(page.locator('[data-slider-theme="nested"] .ant-slider-handle'))
    .toHaveCSS('width', '10px');
  await expect(page.locator('[data-slider-theme="single-horizontal"] .ant-slider-handle'))
    .toHaveCSS('width', '16px');
});

test('Slider theme variables precede existing semantic and local styles', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Slider token preset', exact: true })
    .selectOption('rail-six');

  await page.getByLabel('Slider theme style priority', { exact: true }).dispatchEvent('click');

  await expect(page.locator('[data-slider-theme="single-horizontal"] .ant-slider-rail'))
    .toHaveCSS('height', '11px');
  await expect(page.locator('[data-slider-theme="range-horizontal"] .ant-slider'))
    .toHaveCSS('--ant-slider-rail-size', '11px');
  await expect(page.locator('[data-slider-theme="range-horizontal"] .ant-slider-rail'))
    .toHaveCSS('height', '13px');
});

test('Slider custom prefixes and source removal preserve the native controls', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Slider token preset', exact: true })
    .selectOption('custom-prefix');
  const root = page.locator('[data-slider-theme="single-horizontal"] .ant-slider');
  const original = await root.elementHandle();

  await expect(root).toHaveCSS('--slider-x-slider-rail-size', '7px');
  await expect(root).toHaveClass(/slider-theme-scope/);
  await expect(root).toHaveClass(/(?:^|\s)css-(?:dev-only-do-not-override-)?[a-z0-9]+(?:\s|$)/);
  await page.getByLabel('Hash themed Sliders', { exact: true }).dispatchEvent('click');
  await expect(root).not.toHaveClass(/(?:^|\s)css-(?:dev-only-do-not-override-)?[a-z0-9]+(?:\s|$)/);

  await page.getByLabel('Apply source Slider tokens', { exact: true }).dispatchEvent('click');

  await expect(root.locator('.ant-slider-rail')).toHaveCSS('height', '4px');
  await expect(root).not.toHaveClass(/slider-theme-scope|ant-slider-css-var/);
  await expect(root).not.toHaveAttribute('style');
  expect(await root.evaluate((node, old) => node === old, original)).toBe(true);
  await expect(page.locator('style[data-ant-svelte-theme="slider-theme-scope"]')).toHaveCount(0);
});

test('Slider token changes retain range keyboard behavior and RTL direction', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Slider token preset', exact: true })
    .selectOption('own-tokens');
  await page.getByLabel('Slider theme RTL', { exact: true }).dispatchEvent('click');
  const handles = page.locator('[data-slider-theme="range-horizontal"]').getByRole('slider');
  await handles.first().focus();

  await handles.first().press('ArrowLeft');

  await expect(page.getByLabel('Slider theme range', { exact: true })).toHaveText('50,75');
  await expect(handles.first()).toBeFocused();
  await page.getByRole('button', { name: 'Set themed rail to eight', exact: true })
    .dispatchEvent('click');
  await expect(handles.first()).toHaveValue('50');
  await expect(handles.first()).toBeFocused();
});

test('Unmounting themed Sliders cleans their scope and focused controls', async ({ page }) => {
  const handle = page.locator('[data-slider-theme="range-horizontal"]').getByRole('slider').first();
  await handle.focus();

  await page.getByLabel('Mount themed Sliders', { exact: true }).dispatchEvent('click');

  await expect(handle).toHaveCount(0);
  await expect(page.locator('style[data-ant-svelte-theme="slider-theme-scope"]')).toHaveCount(0);
  await expect(page.locator('[data-slider-theme="outside"]')).toBeVisible();
});
