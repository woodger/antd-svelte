import { test, expect } from './test';
import reference from './fixtures/ant-design-link-decoration-reference.json' with { type: 'json' };

const selectors = {
  anchor: '.decoration-anchor a',
  breadcrumb: '.decoration-breadcrumb a.ant-breadcrumb-link:not(.ant-breadcrumb-overlay-link)',
  menu: '.decoration-breadcrumb a.ant-breadcrumb-overlay-link',
  custom: '[aria-label="Custom decoration Breadcrumb"] a'
};

test.use({ viewport: { width: 1000, height: 800 } });
for (const source of [false, true]) {
  for (const legacy of [false, true]) {
    for (const sample of reference.cases) {
      test(`navigation links match pinned decoration in ${source ? 'source' : 'native'} ${legacy ? 'legacy' : 'items'} ${sample.name}`, async ({ page }) => {
        await page.goto('/?fixture=link-decoration');
        for (const [name, value] of Object.entries({
          'Source link theme': source, 'Custom link decorations': sample.custom,
          'Inline link decoration': sample.inline, 'Legacy Anchor links': legacy,
          'Dark link theme': sample.dark, 'Compact link theme': sample.compact
        })) {
          await page.getByLabel(name, { exact: true }).setChecked(value);
        }

        for (const [name, expected] of Object.entries(sample.links)) {
          const link = page.locator(selectors[name as keyof typeof selectors]);
          await page.mouse.move(990, 790);
          await expect(link).toHaveCSS('text-decoration-line', expected.normal);
          await link.hover();
          await expect(link).toHaveCSS('text-decoration-line', expected.hover);
          await page.mouse.down();
          await expect(link).toHaveCSS('text-decoration-line', expected.active);
          await page.mouse.move(990, 790);
          await page.mouse.up();
          await page.keyboard.press('Tab');
          await link.focus();
          await expect(link).toHaveCSS('text-decoration-line', expected.focus);
          await expect(link).toBeFocused();
          await expect.poll(() => link.evaluate(node => getComputedStyle(node).outlineStyle))
            .not.toBe('none');
          await link.evaluate(node => node.blur());
        }
        await expect(page.locator('#outside-decoration')).toHaveCSS('text-decoration-line', 'underline');
      });
    }
  }
}

test('navigation links preserve nodes, focus, href, callbacks and dropdown keyboard access through theme changes', async ({ page }) => {
  await page.goto('/?fixture=link-decoration');
  const link = page.getByRole('link', { name: 'Anchor link', exact: true });
  const previous = await link.elementHandle();
  await link.focus();
  await link.press('Enter');
  await expect(page.getByLabel('Decoration clicks', { exact: true })).toHaveText('1');
  await expect(link).toHaveAttribute('href', '#decoration-target');

  await page.getByLabel('Source link theme', { exact: true }).evaluate(node => {
    const control = node as HTMLInputElement;
    control.checked = true;
    control.dispatchEvent(new Event('change', { bubbles: true }));
  });

  await expect(link).toBeFocused();
  expect(await link.evaluate((node, old) => node === old, previous)).toBe(true);
  const menu = page.getByRole('link', { name: 'Breadcrumb menu link', exact: true });
  await menu.focus();
  await menu.press('ArrowDown');
  await expect(page.getByRole('menuitem', { name: 'Menu choice', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menu).toBeFocused();
});
