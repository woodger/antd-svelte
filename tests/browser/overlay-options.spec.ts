import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-overlay-options-reference.json' with { type: 'json' };
import { snapshotOverlayCorner } from './overlay-corner-metrics';
import type { OverlayCornerCase } from './fixtures/overlay-corner-presets';

test.use({ viewport: { width: reference.viewport.width, height: reference.viewport.height } });

async function select(page: Page, name: string) {
  await page.goto('/?fixture=overlay-options');
  await page.getByRole('combobox', { name: 'Options reference', exact: true }).selectOption(name);
  await expect(page.locator('#corner-case')).toBeVisible();
}

const next = (page: Page) => page.getByRole('button', { name: 'Next options frame', exact: true })
  .dispatchEvent('click');

for (const sample of reference.cases as OverlayCornerCase[]) {
  test(`Overlay arrow and overflow match source for ${sample.name}`, async ({ page }) => {
    await select(page, sample.name);
    const snapshot = () => page.evaluate(snapshotOverlayCorner, sample.component);

    for (const [index, expected] of sample.snapshots.entries()) {
      if (index) await next(page);

      await expect.poll(snapshot).toEqual(expected);
    }
  });
}

for (const name of ['topLeft-point-true', 'top-overflow-0', 'popover-topLeft-point']) {
  test(`Overlay options preserve source default tokens without a theme for ${name}`, async ({ page }) => {
    await select(page, name);
    const sample = reference.cases.find(sample => sample.name === name)!;

    await page.getByLabel('Native options defaults', { exact: true }).dispatchEvent('click');

    await expect.poll(() => page.evaluate(snapshotOverlayCorner, sample.component))
      .toEqual(sample.snapshots[0]);
  });
}

test('Popover arrow updates preserve the draft, selection, focus and DOM', async ({ page }) => {
  await select(page, 'popover-point-updates');
  const input = page.getByRole('textbox', { name: 'Corner draft', exact: true });
  await input.fill('Arrow draft');
  await input.evaluate((node: HTMLInputElement) => node.setSelectionRange(1, 6));
  const original = await input.elementHandle();
  const popup = await page.locator('.ant-popover:popover-open').elementHandle();
  const sample = reference.cases.find(sample => sample.name === 'popover-point-updates')!;

  for (const expected of sample.snapshots.slice(1)) {
    await next(page);

    await expect.poll(async () => {
      const snapshot = await page.evaluate(snapshotOverlayCorner, 'popover');
      return snapshot && { ...snapshot, input: 'Draft' };
    }).toEqual(expected);
    await expect(input).toHaveValue('Arrow draft');
    await expect(input).toBeFocused();
    expect(await input.evaluate((node: HTMLInputElement) => [node.selectionStart, node.selectionEnd]))
      .toEqual([1, 6]);
    expect(await input.evaluate((node, old) => node === old, original)).toBe(true);
    expect(await page.locator('.ant-popover:popover-open')
      .evaluate((node, old) => node === old, popup)).toBe(true);
  }
});

test('Range Slider forwards arrow and overflow options to the active handle tooltip', async ({ page }) => {
  await select(page, 'topLeft-point-true');
  await page.getByRole('button', { name: 'Toggle options component', exact: true }).dispatchEvent('click');
  const range = page.getByLabel('Range arrow options', { exact: true });
  const handles = range.getByRole('slider');

  for (const [index, value] of [25, 75].entries()) {
    const handle = handles.nth(index);
    await handle.focus();
    const tooltip = page.getByRole('tooltip');

    await expect(tooltip).toHaveText(`Range ${value}`);
    await expect(tooltip).toHaveClass(/ant-tooltip-placement-topLeft(?:\s|$)/);
    await expect.poll(async () => {
      const target = await handle.boundingBox();
      const arrow = await tooltip.locator('.ant-tooltip-arrow').boundingBox();
      return Math.abs(target!.x + target!.width / 2 - arrow!.x - arrow!.width / 2);
    }).toBeLessThan(1);

    await page.keyboard.press('Escape');

    await expect(tooltip).toHaveCount(0);
  }
});
