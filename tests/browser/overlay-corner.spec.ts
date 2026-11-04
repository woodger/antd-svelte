import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-overlay-corner-reference.json' with { type: 'json' };
import { snapshotOverlayCorner } from './overlay-corner-metrics';
import type { OverlayCornerCase } from './fixtures/overlay-corner-presets';

test.use({ viewport: { width: reference.viewport.width, height: reference.viewport.height } });

async function select(page: Page, name: string) {
  await page.goto('/?fixture=overlay-corner');
  await page.getByRole('combobox', { name: 'Corner reference', exact: true }).selectOption(name);
  await expect(page.locator('#corner-case')).toBeVisible();
}

const next = (page: Page) => page.getByRole('button', { name: 'Next corner frame', exact: true })
  .dispatchEvent('click');

for (const sample of reference.cases as OverlayCornerCase[]) {
  test(`Overlay corner geometry matches source for ${sample.name}`, async ({ page }) => {
    await select(page, sample.name);
    const snapshot = () => page.evaluate(snapshotOverlayCorner, sample.component);
    for (const [index, expected] of sample.snapshots.entries()) {
      if (index) await next(page);

      await expect.poll(snapshot).toEqual(expected);
    }
  });
}

for (const name of ['topLeft-center', 'popover-topLeft']) {
  test(`Overlay corners preserve source default spacing without source theme for ${name}`, async ({ page }) => {
    await select(page, name);
    const sample = reference.cases.find(sample => sample.name === name)!;

    await page.getByLabel('Native corner defaults', { exact: true }).dispatchEvent('click');

    await expect.poll(() => page.evaluate(snapshotOverlayCorner, sample.component))
      .toEqual(sample.snapshots[0]);
  });
}

test('Popover corner updates preserve the draft, selection, focus and DOM', async ({ page }) => {
  await select(page, 'popover-placement-updates');
  const input = page.getByRole('textbox', { name: 'Corner draft', exact: true });
  await input.fill('Placement draft');
  await input.evaluate((node: HTMLInputElement) => node.setSelectionRange(2, 7));
  const original = await input.elementHandle();
  const popup = await page.locator('.ant-popover:popover-open').elementHandle();
  const sample = reference.cases.find(sample => sample.name === 'popover-placement-updates')!;

  for (let index = 0; index < 4; index++) {
    await next(page);

    await expect(page.locator('.ant-popover:popover-open')).toHaveClass(new RegExp(
      `ant-popover-placement-${sample.snapshots[index + 1]!.placement}(?:\\s|$)`
    ));
    await expect(input).toHaveValue('Placement draft');
    await expect(input).toBeFocused();
    expect(await input.evaluate((node: HTMLInputElement) => [node.selectionStart, node.selectionEnd]))
      .toEqual([2, 7]);
    expect(await input.evaluate((node, old) => node === old, original)).toBe(true);
    expect(await page.locator('.ant-popover:popover-open')
      .evaluate((node, old) => node === old, popup)).toBe(true);
  }
});

test('Popover corners retain native Escape dismissal and clear the pending frame', async ({ page }) => {
  await select(page, 'popover-topLeft');
  const input = page.getByRole('textbox', { name: 'Corner draft', exact: true });
  await input.focus();

  await page.keyboard.press('Escape');

  await expect(page.locator('.ant-popover:popover-open')).toHaveCount(0);
  await expect(page.locator('[data-corner-anchor]')).toBeFocused();
  await page.getByRole('button', { name: 'Toggle corner component', exact: true }).click();

  await expect(page.locator('.ant-popover')).toHaveCount(0);
});
