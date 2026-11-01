import { test, expect } from './test';

const themes = [
  { name: 'default', compact: false, dark: false },
  { name: 'compact', compact: true, dark: false },
  { name: 'dark', compact: false, dark: true },
  { name: 'dark-compact', compact: true, dark: true }
];

for (const viewport of [1280, 320]) {
  for (const theme of themes) {
    for (const direction of ['ltr', 'rtl']) {
      for (const horizontal of [true, false]) {
        test(`Anchor spacing ${theme.name}/${direction}/${horizontal ? 'horizontal' : 'vertical'}/${viewport}`, async ({ page }) => {
          await page.setViewportSize({ width: viewport, height: 900 });
          await page.goto('/?fixture=anchor-spacing');
          await page.getByLabel('Compact spacing Anchor', { exact: true }).setChecked(theme.compact);
          await page.getByLabel('Dark spacing Anchor', { exact: true }).setChecked(theme.dark);
          await page.getByLabel('Right to left', { exact: true }).setChecked(direction === 'rtl');
          await page.getByLabel('Horizontal spacing Anchor', { exact: true }).setChecked(horizontal);
          const root = page.locator('#spacing-anchor');
          const items = root.locator('.ant-anchor > .ant-anchor-link');

          await expect(items).toHaveCount(3);
          await expect(items.first()).toHaveCSS('padding-block-start', '4px');
          await expect(items.first()).toHaveCSS('padding-inline-start', horizontal ? '0px' : '16px');
          await expect(items.nth(1)).toHaveCSS('padding-inline-start', '16px');
          await expect(items.nth(2)).toHaveCSS('padding-inline-end', '0px');
          const positions = await items.evaluateAll(elements => elements.map(item => {
            const title = item.querySelector('.ant-anchor-link-title')!;
            const rect = title.getBoundingClientRect();
            return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
          }));
          if (horizontal) {
            for (let index = 1; index < positions.length; index++) {
              const gap = direction === 'rtl'
                ? positions[index - 1].left - positions[index].right
                : positions[index].left - positions[index - 1].right;
              expect(gap).toBeCloseTo(16, 1);
            }
            await expect(root.getByRole('link', { name: 'Условия доставки', exact: true }))
              .toHaveCount(0);
            const box = (await root.boundingBox())!;
            expect(box.x).toBeGreaterThanOrEqual(0);
            expect(box.x + box.width).toBeLessThanOrEqual(viewport);
          } else {
            expect(positions[1].top - positions[0].bottom).toBeCloseTo(8, 1);
            const nested = root.locator('.ant-anchor-link .ant-anchor-link');
            await expect(nested).toHaveCSS('padding-block-start', '2px');
            await expect(nested).toHaveCSS('padding-block-end', '2px');
            await expect(nested).toHaveCSS('padding-inline-start', '16px');
            const parent = root.getByRole('link', { name: 'Доставка', exact: true });
            const child = root.getByRole('link', { name: 'Условия доставки', exact: true });
            const parentBox = (await parent.boundingBox())!;
            const childBox = (await child.boundingBox())!;
            const indent = direction === 'rtl'
              ? parentBox.x + parentBox.width - childBox.x - childBox.width
              : childBox.x - parentBox.x;
            expect(indent).toBeCloseTo(16, 1);
          }

          const link = root.getByRole('link', { name: 'Доставка', exact: true });
          // Индикатор измеряет текущий шрифт; сначала ждём завершения перехода темы.
          await expect(link).toHaveCSS('font-size', theme.compact ? '12px' : '14px');
          await expect(link).toHaveCSS('line-height', theme.compact ? '20px' : '22px');
          await link.focus();
          await page.keyboard.press('Enter');

          await expect(link).toBeFocused();
          await expect(link).toHaveClass(/-title-active/);
          await expect(page).toHaveURL(/#spacing-delivery$/);
          await expect(page.getByLabel('Spacing Anchor clicks', { exact: true })).toHaveText('1');
          await expect(page.getByLabel('Spacing Anchor changes', { exact: true }))
            .toHaveText('#spacing-delivery');
          await expect.poll(() => page.locator('#spacing-scroll').evaluate(node => node.scrollTop))
            .toBe(200);
          await expect.poll(async () => {
            const indicator = (await root.locator('.ant-anchor-ink').boundingBox())!;
            const title = (await link.boundingBox())!;
            return horizontal ? Math.max(Math.abs(indicator.x - title.x),
              Math.abs(indicator.width - title.width)) : Math.max(Math.abs(indicator.y - title.y),
              Math.abs(indicator.height - title.height));
          }).toBeLessThan(0.6);
        });
      }
    }
  }
}

test('legacy Anchor links receive the same default spacing', async ({ page }) => {
  await page.goto('/?fixture=anchor-spacing');
  await page.getByLabel('Legacy spacing Anchor', { exact: true }).check();
  const items = page.locator('#spacing-anchor .ant-anchor > .ant-anchor-link');

  await expect(items.first()).toHaveCSS('padding-inline-start', '0px');
  await expect(items.nth(1)).toHaveCSS('padding-inline-start', '16px');
  await page.getByLabel('Horizontal spacing Anchor', { exact: true }).uncheck();

  await expect(items.first()).toHaveCSS('padding-block-start', '4px');
  await expect(items.first()).toHaveCSS('padding-inline-start', '16px');
  await expect(page.locator('#spacing-anchor .ant-anchor-link .ant-anchor-link'))
    .toHaveCSS('padding-block-start', '2px');
});
