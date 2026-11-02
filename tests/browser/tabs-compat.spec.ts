import type { Page } from '@playwright/test';
import { test, expect } from './test';

const root = (page: Page) => page.locator('#tabs-layout-main');
const tab = (page: Page, name: string) => root(page).getByRole('tab', { name, exact: true });

async function check(page: Page, name: string, value = true) {
  await page.getByLabel(name, { exact: true }).evaluate(
    (element, checked) => {
      const input = element as HTMLInputElement;
      input.checked = checked;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    },
    value
  );
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1600 });
  await page.goto('/?fixture=tabs-layout');
  await check(page, 'Interactive Tabs layout');
});

for (const direction of ['ltr', 'rtl']) {
  for (const position of ['top', 'right', 'bottom', 'left']) {
    test(`Tabs keeps source physical ${position} placement in ${direction}`, async ({ page }) => {
      await check(page, 'Use legacy Tabs placement');
      await check(page, 'RTL Tabs layout', direction === 'rtl');
      await page.getByLabel('Tabs physical position', { exact: true }).selectOption(position);
      const vertical = position === 'left' || position === 'right';

      await expect(root(page)).toHaveClass(new RegExp(`ant-tabs-${position}`));
      await expect(root(page).getByRole('tablist')).toHaveAttribute(
        'aria-orientation',
        vertical ? 'vertical' : 'horizontal'
      );
      await tab(page, 'Alpha').focus();
      await page.keyboard.press(vertical ? 'ArrowDown'
        : direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight');

      await expect(tab(page, 'Beta')).toBeFocused();
      await expect(tab(page, 'Alpha')).toHaveAttribute('aria-selected', 'true');
      await page.keyboard.press('Enter');

      await expect(tab(page, 'Beta')).toHaveAttribute('aria-selected', 'true');
      await expect(page.getByLabel('Tabs layout changes', { exact: true })).toHaveText('["beta"]');
    });
  }
}

test('Tabs prioritizes logical placement and preserves native panes when switching to the alias',
  async ({ page }) => {
    await check(page, 'RTL Tabs layout');
    await page.getByLabel('Tabs physical position', { exact: true }).selectOption('left');
    await page.getByLabel('Tabs layout placement', { exact: true }).selectOption('start');
    const draft = page.getByRole('textbox', { name: 'Layout Alpha draft', exact: true });
    await draft.fill('Retained alias draft');
    const original = await draft.elementHandle();
    await draft.focus();

    await expect(root(page)).toHaveClass(/ant-tabs-right/);
    await check(page, 'Use legacy Tabs placement');

    await expect(root(page)).toHaveClass(/ant-tabs-left/);
    await expect(draft).toBeFocused();
    expect(await draft.evaluate((element, previous) => element === previous, original)).toBe(true);
    await check(page, 'Use legacy Tabs placement', false);

    await expect(root(page)).toHaveClass(/ant-tabs-right/);
    await expect(draft).toHaveValue('Retained alias draft');
    await expect(draft).toBeFocused();
    await expect(page.getByLabel('Tabs layout changes', { exact: true })).toHaveText('[]');
    await expect(page.getByLabel('Tabs layout clicks', { exact: true })).toHaveText('[]');
  });

test('Tabs source medium overrides provider size and matches the existing middle size',
  async ({ page }) => {
    await page.getByLabel('Tabs provider size', { exact: true }).selectOption('small');
    await expect(root(page)).toHaveClass(/ant-tabs-small/);
    await expect(tab(page, 'Alpha')).toHaveCSS('padding-top', '8px');
    await page.getByLabel('Tabs layout size', { exact: true }).selectOption('medium');

    await expect(tab(page, 'Alpha')).toHaveCSS('font-size', '14px');
    await expect(tab(page, 'Alpha')).toHaveCSS('padding-top', '12px');
    await expect(root(page)).not.toHaveClass(/ant-tabs-(small|large|medium|middle)/);
    const medium = await tab(page, 'Alpha').boundingBox();
    await page.getByLabel('Tabs layout size', { exact: true }).selectOption('middle');
    await expect.poll(() => tab(page, 'Alpha').boundingBox()).toEqual(medium);
    await page.getByLabel('Tabs provider size', { exact: true }).selectOption('large');

    await expect(tab(page, 'Alpha')).toHaveCSS('font-size', '14px');
    await page.getByLabel('Tabs layout size', { exact: true }).selectOption('');

    await expect(tab(page, 'Alpha')).toHaveCSS('font-size', '16px');
    await expect(root(page)).toHaveClass(/ant-tabs-large/);
    await expect(page.getByLabel('Tabs layout changes', { exact: true })).toHaveText('[]');
  });

test('physical vertical Tabs keep the native mobile fallback and restore their side on resize',
  async ({ page }) => {
    await check(page, 'RTL Tabs layout');
    await check(page, 'Use legacy Tabs placement');
    await page.getByLabel('Tabs physical position', { exact: true }).selectOption('left');

    await expect(root(page)).toHaveClass(/ant-tabs-left/);
    await page.setViewportSize({ width: 575, height: 1000 });

    await expect(root(page)).toHaveClass(/ant-tabs-top/);
    await expect(root(page).getByRole('tablist')).toHaveAttribute('aria-orientation', 'horizontal');
    await page.setViewportSize({ width: 576, height: 1000 });

    await expect(root(page)).toHaveClass(/ant-tabs-left/);
    await expect(root(page).getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical');
  });
