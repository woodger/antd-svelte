import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-overlay-color-reference.json' with { type: 'json' };
import { snapshotOverlayColors } from './overlay-color-metrics';
import type { OverlayConfigCase } from './fixtures/overlay-config-presets';

test.use({ viewport: reference.viewport });

async function select(page: Page, name: string) {
  await page.goto('/?fixture=overlay-color');
  await page.getByRole('combobox', { name: 'Color reference', exact: true }).selectOption(name);
  await expect(page.locator('#config-case')).toBeVisible();
}

const next = (page: Page) => page.getByRole('button', { name: 'Next color frame', exact: true })
  .dispatchEvent('click');

for (const sample of reference.cases as OverlayConfigCase[]) {
  test(`Overlay color matches source for ${sample.name}`, async ({ page }) => {
    await select(page, sample.name);

    for (const [index, expected] of sample.snapshots.entries()) {
      if (index) await next(page);

      await expect.poll(() => page.evaluate(snapshotOverlayColors, sample.component)).toEqual(expected);
    }
  });
}

for (const component of ['tooltip', 'popover', 'popconfirm', 'avatar-group']) {
  test(`Overlay color changes retain the open ${component}, draft, selection and focus`, async ({ page }) => {
    await select(page, `${component}-reactive`);
    const input = page.getByRole('textbox', { name: 'Config draft', exact: true });
    await input.fill('Color draft');
    await input.evaluate((node: HTMLInputElement) => node.setSelectionRange(1, 5));
    const original = await input.elementHandle();
    const prefix = component === 'tooltip' ? 'ant-tooltip' : 'ant-popover';
    const popup = await page.locator(`.${prefix}:popover-open`).elementHandle();
    const sample = reference.cases.find(sample => sample.name === `${component}-reactive`)!;

    for (const expected of sample.snapshots.slice(1)) {
      await next(page);

      await expect.poll(() => page.evaluate(snapshotOverlayColors, component)).toEqual(expected);
      await expect(input).toBeFocused();
      await expect(input).toHaveValue('Color draft');
      expect(await input.evaluate((node: HTMLInputElement) => [node.selectionStart, node.selectionEnd]))
        .toEqual([1, 5]);
      expect(await input.evaluate((node, old) => node === old, original)).toBe(true);
      expect(await page.locator(`.${prefix}:popover-open`)
        .evaluate((node, old) => node === old, popup)).toBe(true);
    }

    await page.getByRole('button', { name: 'Toggle color component', exact: true })
      .dispatchEvent('click');

    await expect(page.locator(`.${prefix}`)).toHaveCount(0);
    await expect(page.locator('[data-config-anchor]')).toHaveCount(0);
  });
}

test('Overlay colors preserve source paints and arrows in RTL', async ({ page }) => {
  await select(page, 'popover-root-arrow-custom');
  await page.getByRole('checkbox', { name: 'Right to left', exact: true }).dispatchEvent('click');
  const sample = reference.cases.find(sample => sample.name === 'popover-root-arrow-custom')!;

  await expect(page.locator('.ant-popover:popover-open')).toHaveClass(/ant-popover-rtl/);
  await expect.poll(() => page.evaluate(snapshotOverlayColors, sample.component))
    .toEqual(sample.snapshots[0]);
});

for (const sample of reference.nested) {
  test(`Nested Tooltip colors preserve the source container boundary for ${sample.name}`, async ({ page }) => {
    await page.goto('/?fixture=overlay-color');
    await page.getByRole('combobox', { name: 'Color reference', exact: true }).selectOption(sample.name);
    const popup = page.locator('.nested-color-inner:popover-open .ant-tooltip-container');

    await expect(popup).toBeVisible();
    await expect.poll(() => popup.evaluate(node => ({
      background: getComputedStyle(node).backgroundColor,
      color: getComputedStyle(node).color
    }))).toEqual(sample.snapshot);
  });
}

for (const name of ['slider-reactive', 'slider-range-reactive']) {
  test(`Slider colors reach the active handle and retain focus for ${name}`, async ({ page }) => {
    await select(page, name);
    await page.getByRole('checkbox', { name: 'Active color slider', exact: true })
      .dispatchEvent('click');
    const sample = reference.cases.find(sample => sample.name === name)!;
    const handles = page.locator('#config-case').getByRole('slider');

    await handles.first().focus();

    for (const [step, expected] of sample.snapshots.entries()) {
      if (step) await next(page);

      await expect(page.getByRole('tooltip')).toHaveCount(1);
      await expect.poll(() => page.evaluate(snapshotOverlayColors, 'slider'))
        .toEqual([expected![0]]);
      await expect(handles.first()).toBeFocused();
    }

    if (name === 'slider-range-reactive') {
      await handles.last().focus();

      await expect(page.getByRole('tooltip')).toHaveCount(1);
      await expect.poll(() => page.evaluate(snapshotOverlayColors, 'slider'))
        .toEqual([sample.snapshots.at(-1)![0]]);
      await expect(handles.last()).toBeFocused();
    }
  });
}

for (const name of ['tooltip-blue', 'tooltip-hex', 'popover-blue',
  'popover-css-palette', 'popconfirm-hex', 'tooltip-css-palette']) {
  test(`Overlay colors preserve native theme and CSS variable priority for ${name}`, async ({ page }) => {
    await select(page, name);
    await page.getByRole('checkbox', { name: 'Native color theme', exact: true })
      .dispatchEvent('click');
    const sample = reference.cases.find(sample => sample.name === name)!;

    await expect.poll(() => page.evaluate(snapshotOverlayColors, sample.component))
      .toEqual(sample.snapshots[0]);
  });
}
