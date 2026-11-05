import { test, expect } from './test';
import reference from './fixtures/ant-design-pagination-metrics.json' with { type: 'json' };

for (const source of [false, true]) {
  for (const dark of [false, true]) {
    for (const rtl of [false, true]) {
      test(`Pagination colors match pinned states for ${source ? 'source' : 'native'}/${dark ? 'dark' : 'light'}/${rtl ? 'rtl' : 'ltr'}`, async ({ page }) => {
        await page.goto('/?fixture=pagination-color');
        await page.getByLabel('Source pagination colors', { exact: true }).setChecked(source);
        await page.getByLabel('Dark pagination colors', { exact: true }).setChecked(dark);
        await page.getByLabel('RTL pagination colors', { exact: true }).setChecked(rtl);
        const sample = reference.cases.find(item => item.name === (dark ? 'dark' : 'default'))!;
        const metrics = sample.metrics['ltr/middle'];
        // Native primary="blue" keeps the seed palette in both light and dark modes.
        const activeColor = source ? metrics.activePage.color
          : reference.cases.find(item => item.name === 'default')!
            .metrics['ltr/middle'].activePage.color;
        const root = page.getByRole('navigation', { name: 'Pagination colors', exact: true });
        const page1 = root.locator('.ant-pagination-item-1 > button');
        const page2 = root.locator('.ant-pagination-item-2 > button');
        await expect(page2).toHaveCSS('color', metrics.page.color);
        await expect(page1).toHaveCSS('color', activeColor);
        await page2.click();
        await page.mouse.move(1200, 700);
        await expect(page2).toHaveAttribute('aria-current', 'page');
        await expect(page2).toHaveCSS('color', activeColor);
        await expect(page1).toHaveCSS('color', metrics.page.color);
        await page2.hover();
        if (!dark || !source) {
          const hover = reference.interactions.find(item => item.name === 'default')!;
          await expect(page2).toHaveCSS('color', hover.states['hover-active'].control.color);
        } else {
          await expect.poll(() => root.locator('.ant-pagination-item-active').evaluate(node => {
            const button = node.querySelector('button')!;
            return getComputedStyle(button).color === getComputedStyle(node).borderTopColor;
          })).toBe(true);
        }
        await page.getByLabel('Disabled pagination colors', { exact: true }).check();
        const disabled = sample.metrics['ltr/disabled'];
        await expect(page2).toBeDisabled();
        await expect(page2).toHaveCSS('color', disabled.activePage.color);
        await expect(page1).toHaveCSS('color', disabled.page.color);
        await page2.hover();
        await expect(page2).toHaveCSS('color', disabled.activePage.color);
        await expect(page.getByLabel('Pagination color changes', { exact: true })).toHaveText('["2:10"]');
        await expect(page.getByLabel('Pagination color submissions', { exact: true })).toHaveText('0');
      });
    }
  }
}

for (const source of [false, true]) {
  test(`Pagination preserves custom colors and native controls in ${source ? 'source' : 'native'} theme`, async ({ page }) => {
    await page.goto('/?fixture=pagination-color');
    await page.getByLabel('Source pagination colors', { exact: true }).setChecked(source);
    await page.getByLabel('Custom active page colors', { exact: true }).check();
    const root = page.getByRole('navigation', { name: 'Pagination colors', exact: true });
    const page1 = root.locator('.ant-pagination-item-1 > button');
    await expect(page1).toHaveCSS('color', 'rgb(17, 119, 51)');
    await page1.hover();
    await expect(page1).toHaveCSS('color', 'rgb(51, 136, 85)');
    await page.getByLabel('Disabled pagination colors', { exact: true }).check();
    await expect(page1).toHaveCSS('color', 'rgb(119, 85, 51)');
    await page.getByLabel('Inline pagination colors', { exact: true }).check();
    await expect(page1).toHaveCSS('color', 'rgb(85, 68, 51)');
    await expect(page1).toBeDisabled();
    await page.getByLabel('Disabled pagination colors', { exact: true }).uncheck();
    const page2 = root.locator('.ant-pagination-item-2 > button');
    await page2.focus();
    await page2.press('Enter');
    await expect(page2).toHaveAttribute('aria-current', 'page');
    await expect(page2).toHaveCSS('color', 'rgb(85, 68, 51)');
    await expect(page.getByLabel('Pagination color current', { exact: true })).toHaveText('2');
    await expect(page.getByLabel('Pagination color submissions', { exact: true })).toHaveText('0');
  });
}
