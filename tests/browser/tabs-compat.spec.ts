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

test('Tabs medium overrides provider size and preserves geometry across provider changes',
  async ({ page }) => {
    await page.getByLabel('Tabs provider size', { exact: true }).selectOption('small');
    await expect(root(page)).toHaveClass(/ant-tabs-small/);
    await expect(tab(page, 'Alpha')).toHaveCSS('padding-top', '8px');
    await page.getByLabel('Tabs layout size', { exact: true }).selectOption('medium');

    await expect(tab(page, 'Alpha')).toHaveCSS('font-size', '14px');
    await expect(tab(page, 'Alpha')).toHaveCSS('padding-top', '12px');
    await expect(root(page)).not.toHaveClass(/ant-tabs-(small|large|medium)/);
    const medium = await tab(page, 'Alpha').boundingBox();
    await page.getByLabel('Tabs provider size', { exact: true }).selectOption('large');
    await expect.poll(() => tab(page, 'Alpha').boundingBox()).toEqual(medium);

    await expect(tab(page, 'Alpha')).toHaveCSS('font-size', '14px');
    await page.getByLabel('Tabs layout size', { exact: true }).selectOption('');

    await expect(tab(page, 'Alpha')).toHaveCSS('font-size', '16px');
    await expect(root(page)).toHaveClass(/ant-tabs-large/);
    await expect(page.getByLabel('Tabs layout changes', { exact: true })).toHaveText('[]');
  });
