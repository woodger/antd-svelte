import type { Locator } from '@playwright/test';
import { test, expect } from './test';

async function textMetrics(root: Locator) {
  return root.locator('.ant-breadcrumb-item').evaluateAll(items => items.map(item => {
    const walker = document.createTreeWalker(item, NodeFilter.SHOW_TEXT);
    let text = walker.nextNode();
    while (text && !text.textContent?.trim()) text = walker.nextNode();
    if (!text) throw new Error('Breadcrumb item must contain text');

    const range = document.createRange();
    range.selectNodeContents(text);
    const rect = range.getBoundingClientRect();
    const css = getComputedStyle(text.parentElement!);

    return {
      top: rect.top,
      height: rect.height,
      row: item.getBoundingClientRect().top,
      fontSize: css.fontSize,
      fontFamily: css.fontFamily,
      fontWeight: css.fontWeight,
      lineHeight: css.lineHeight
    };
  }));
}

const presets = [
  { name: 'default', compact: false, dark: false, large: false, source: false },
  { name: 'compact', compact: true, dark: false, large: false, source: false },
  { name: 'large', compact: false, dark: false, large: true, source: false },
  { name: 'dark-compact', compact: true, dark: true, large: false, source: false },
  { name: 'source', compact: false, dark: false, large: false, source: true },
  { name: 'source-compact', compact: true, dark: true, large: false, source: true }
];

for (const preset of presets) {
  for (const direction of ['ltr', 'rtl']) {
    for (const renderer of ['link', 'button', 'custom']) {
      test(`Breadcrumb text keeps one baseline ${preset.name}/${direction}/${renderer}`, async ({ page }) => {
        await page.goto('/?fixture=breadcrumb');
        await page.getByLabel('Compact Breadcrumb', { exact: true }).setChecked(preset.compact);
        await page.getByLabel('Dark Breadcrumb', { exact: true }).setChecked(preset.dark);
        await page.getByLabel('Large Breadcrumb context', { exact: true }).setChecked(preset.large);
        await page.getByLabel('Source Breadcrumb theme', { exact: true }).setChecked(preset.source);
        await page.getByLabel('Right to left', { exact: true }).setChecked(direction === 'rtl');
        await page.getByLabel('Breadcrumb menu without href', { exact: true })
          .setChecked(renderer === 'button');
        await page.getByLabel('Custom Breadcrumb renderer', { exact: true })
          .setChecked(renderer === 'custom');
        const root = page.getByRole('navigation', { name: 'Aligned breadcrumb', exact: true });

        await expect.poll(async () => {
          const metrics = await textMetrics(root);
          return Math.max(...metrics.map(value => value.top))
            - Math.min(...metrics.map(value => value.top));
        }).toBeLessThan(0.1);
        const metrics = await textMetrics(root);
        expect(metrics).toHaveLength(3);
        for (const value of metrics) {
          expect(value.fontSize).toBe(preset.compact ? '12px' : '14px');
          expect(value.lineHeight).toBe(preset.compact ? '20px' : '22px');
          expect(value.fontFamily).toBe(metrics[0].fontFamily);
          expect(value.fontWeight).toBe('400');
          expect(value.height).toBe(metrics[0].height);
        }
        await expect(page.locator('.standalone-dropdown')).toHaveCSS('vertical-align', 'middle');

        await page.getByLabel('Narrow Breadcrumb', { exact: true }).check();

        const wrapped = await textMetrics(root);
        expect(new Set(wrapped.map(value => value.row)).size).toBeGreaterThan(1);
        expect(wrapped.some(item => wrapped.filter(peer => Math.abs(item.row - peer.row) < 0.1)
          .length > 1)).toBe(true);
        for (const item of wrapped) {
          const peers = wrapped.filter(peer => Math.abs(item.row - peer.row) < 0.1);
          expect(Math.max(...peers.map(peer => peer.top))
            - Math.min(...peers.map(peer => peer.top))).toBeLessThan(0.1);
        }
        const trigger = root.locator('.ant-breadcrumb-item').nth(1)
          .getByRole(renderer === 'button' ? 'button' : 'link');
        if (renderer === 'custom') {
          await root.getByRole('link').first().focus();
          await page.keyboard.press('Tab');
          await expect(trigger).toBeFocused();
        } else {
          await trigger.focus();
        }
        await page.keyboard.press('ArrowDown');
        const menu = page.getByRole('menu', { name: 'Aligned Breadcrumb sections', exact: true });

        await expect(menu.getByRole('menuitem', { name: 'Компоненты', exact: true })).toBeFocused();
        await page.keyboard.press('ArrowDown');
        await expect(menu.getByRole('menuitem', { name: 'Темы', exact: true })).toBeFocused();
        await page.keyboard.press('Escape');
        await expect(menu).toBeHidden();
        await expect(trigger).toBeFocused();
        await expect(page.getByLabel('Breadcrumb submissions', { exact: true })).toHaveText('0');
      });
    }
  }
}
