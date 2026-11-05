import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-menu-link-decoration-reference.json' with { type: 'json' };

test.use({ viewport: { width: 1200, height: 1000 } });

const names = { nested: 'Nested link', regular: 'Regular link', group: 'Group link' };

async function configure(page: Page, sample: typeof reference.cases[number], source: boolean) {
  await page.goto('/?fixture=menu-link-decoration');
  await page.getByLabel('Source Menu links', { exact: true }).setChecked(source);
  await page.getByLabel('Dark Menu links', { exact: true }).setChecked(sample.dark);
  await page.getByLabel('Compact Menu links', { exact: true }).setChecked(sample.compact);
  await page.getByLabel('Custom Menu link decorations', { exact: true }).setChecked(sample.custom);
  await page.getByLabel('Inline Menu link decoration', { exact: true }).setChecked(sample.inline);
  await page.getByLabel('RTL Menu links', { exact: true }).setChecked(sample.rtl);
  await page.getByLabel('Menu link mode', { exact: true }).selectOption(sample.mode);
}

async function update(page: Page, name: string, checked: boolean) {
  await page.getByLabel(name, { exact: true }).evaluate((node, value) => {
    const input = node as HTMLInputElement;
    input.checked = value;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, checked);
}

for (const source of [false, true]) {
  for (const sample of reference.cases) {
    test(`Menu links match ${sample.name} in ${source ? 'source' : 'native'} theme`, async ({ page }) => {
      await configure(page, sample, source);
      const title = page.getByRole('menuitem', { name: 'More', exact: true });
      const nested = page.getByRole('link', { name: 'Nested link', exact: true });
      if (!await nested.isVisible()) await title.click();

      for (const [kind, expected] of Object.entries(sample.links)) {
        const link = page.getByRole('link', { name: names[kind as keyof typeof names], exact: true });
        await page.mouse.move(1180, 980);
        await expect(link).toHaveCSS('text-decoration-line', expected.normal);
        await link.hover();
        await expect(link).toHaveCSS('text-decoration-line', expected.hover);
        await page.mouse.down();
        await expect(link).toHaveCSS('text-decoration-line', expected.active);
        await page.mouse.move(1180, 980);
        await page.mouse.up();
        await page.keyboard.press('Tab');
        await link.focus();
        await expect(link).toHaveCSS('text-decoration-line', expected.focus);
        await expect(link).toHaveCSS('outline-style', expected.outline);
        await expect(link).toBeFocused();
        if (kind !== 'group') {
          await expect.poll(() => link.evaluate(node =>
            getComputedStyle(node).color === getComputedStyle(node.closest('.ant-menu-item')!).color
          )).toBe(true);
        }
        await link.evaluate(node => (node as HTMLElement).blur());
      }
      await expect(page.locator('#outside-menu-decoration'))
        .toHaveCSS('text-decoration-line', 'underline');
    });
  }

  for (const mode of ['horizontal', 'inline', 'vertical']) {
    test(`Menu ${mode} links retain navigation and selection in ${source ? 'source' : 'native'} theme`,
      async ({ page }) => {
        await configure(page, reference.cases.find(item => item.mode === mode)!, source);
        const regular = page.getByRole('link', { name: 'Regular link', exact: true });
        await regular.focus();
        await expect(regular).toBeFocused();
        await regular.press('Enter');

        await expect(page).toHaveURL(/#reports$/);
        await expect(page.getByLabel('Menu link selected', { exact: true })).toHaveText('["regular"]');
        await expect(page.getByLabel('Menu link clicks', { exact: true })).toHaveText('["regular"]');
        const title = page.getByRole('menuitem', { name: 'More', exact: true });
        const nested = page.getByRole('link', { name: 'Nested link', exact: true });
        if (!await nested.isVisible()) await title.click();
        await nested.focus();
        await nested.press('Enter');

        await expect(page).toHaveURL(/#nested$/);
        await expect(page.getByLabel('Menu link selected', { exact: true })).toHaveText('["nested"]');
        await expect(page.getByLabel('Menu link clicks', { exact: true }))
          .toHaveText('["regular","nested"]');
        await expect(regular).toHaveAttribute('href', '#reports');
        await expect(page.locator('a[href="#nested"]').first()).toHaveAttribute('href', '#nested');
      });
  }

  for (const mode of ['horizontal', 'vertical']) {
    for (const target of ['body', 'shadow']) {
      test(`Menu ${mode} ${target} links keep tokens and focus in ${source ? 'source' : 'native'} theme`,
        async ({ page }) => {
          await configure(page, reference.cases.find(item => item.mode === mode)!, source);
          await page.getByLabel('Menu link container', { exact: true }).selectOption(target);
          const nested = page.getByRole('link', { name: 'Nested link', exact: true });
          const title = page.getByRole('menuitem', { name: 'More', exact: true });
          if (!await nested.isVisible()) await title.click();
          await expect(nested).toBeVisible();
          const original = await nested.elementHandle();
          await page.keyboard.press('Tab');
          await nested.focus();
          await update(page, 'Custom Menu link decorations', true);

          await expect(nested).toHaveCSS('text-decoration-line', 'line-through');
          await expect(nested).toBeFocused();
          expect(await nested.evaluate((node, before) => node === before, original)).toBe(true);
          await update(page, 'Inline Menu link decoration', true);
          await expect(nested).toHaveCSS('text-decoration-line', 'underline');
          await update(page, 'Source Menu links', !source);
          await expect(nested).toHaveCSS('text-decoration-line', 'underline');
          await expect(nested).toBeFocused();
          expect(await nested.evaluate((node, before) => node === before, original)).toBe(true);
          await expect(page.getByLabel('Menu link clicks', { exact: true })).toHaveText('[]');
          await nested.press('Escape');
          await expect(title).toBeFocused();
        });
    }
  }
}
