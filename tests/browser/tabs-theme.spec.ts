import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-tabs-theme-metrics.json' with { type: 'json' };

async function check(page: Page, name: string, value = true) {
  await page.getByLabel(name, { exact: true }).evaluate((element, checked) => {
    const input = element as HTMLInputElement;
    input.checked = checked;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
}

async function preset(page: Page, name: string) {
  await page.getByLabel('Tabs token preset', { exact: true }).evaluate((element, value) => {
    const select = element as HTMLSelectElement;
    select.value = value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
  }, name);
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1400 });
  await page.goto('/?fixture=tabs-theme');
});

for (const sample of reference.cases) for (const direction of ['ltr', 'rtl']) {
  test(`Tabs matches source theme metrics for ${sample.name}/${direction}`, async ({ page }) => {
    await preset(page, sample.name);
    await check(page, 'RTL themed Tabs', direction === 'rtl');
    for (const [name, expected] of Object.entries(sample.metrics)) {
      if (!name.startsWith(direction + '/') || name.endsWith('/popup')) continue;
      const variant = name.slice(direction.length + 1);
      const root = page.locator(`.tabs-token-${variant}`);

      await expect.poll(() => root.evaluate((element, metrics) => {
        const selectors: Record<string, string> = {
          nav: '.ant-tabs-nav',
          tab: '.ant-tabs-tab',
          label: '.ant-tabs-tab-btn',
          disabled: '.ant-tabs-tab-disabled',
          ink: '.ant-tabs-ink-bar',
          add: '.ant-tabs-nav-add'
        };
        return Object.fromEntries(Object.entries(metrics).map(([key, fields]) => {
          if (!fields) return [key, null];
          const target = key === 'root' ? element : element.querySelector(selectors[key]);
          if (!target) throw new Error(`Missing ${key}`);
          const css = getComputedStyle(target);
          return [key, Object.fromEntries(Object.keys(fields).map(name => [name,
            css[name as keyof CSSStyleDeclaration]
          ]))];
        }));
      }, expected), { message: name }).toEqual(expected);
    }
    await page.locator('.tabs-token-overflow .ant-tabs-nav-more').hover();
    const menu = page.getByRole('listbox', { name: 'expanded dropdown', exact: true });
    await expect(menu).toBeVisible();
    const expected = sample.metrics[`${direction}/popup` as keyof typeof sample.metrics];
    await expect.poll(() => menu.evaluate(element => {
      const css = (node: Element, fields: string[]) => {
        const style = getComputedStyle(node);
        return Object.fromEntries(fields.map(key => [key, style[key as keyof CSSStyleDeclaration]]));
      };
      return {
        surface: css(element.closest('.ant-tabs-dropdown')!, ['fontSize', 'lineHeight', 'color', 'zIndex']),
        menu: css(element, ['backgroundColor', 'paddingTop', 'paddingBottom', 'borderRadius', 'maxHeight']),
        option: css(element.querySelector('.ant-tabs-dropdown-menu-item')!, [
          'fontSize', 'lineHeight', 'color', 'paddingTop', 'paddingLeft', 'minWidth'
        ])
      };
    })).toEqual(expected);
  });
}

test('theme changes preserve a panel draft, its selection, native focus and DOM', async ({ page }) => {
  const draft = page.getByRole('textbox', { name: 'Themed Tabs draft', exact: true });
  await draft.fill('Retained theme draft');
  await draft.evaluate(element => (element as HTMLInputElement).setSelectionRange(2, 8));
  const original = await draft.elementHandle();
  for (const name of ['own-tokens', 'own-algorithm', 'custom-prefix', 'default']) {
    await preset(page, name);

    await expect(draft).toBeFocused();
    await expect(draft).toHaveValue('Retained theme draft');
    expect(await draft.evaluate((element, previous) => element === previous, original)).toBe(true);
    expect(await draft.evaluate(element => [
      (element as HTMLInputElement).selectionStart, (element as HTMLInputElement).selectionEnd
    ])).toEqual([2, 8]);
  }
  await expect(page.getByLabel('Tabs theme events', { exact: true })).toHaveText('[]');
});

test('theme changes retain the open More popup and its focused custom field', async ({ page }) => {
  await check(page, 'Custom themed Tabs popup');
  const root = page.locator('#tabs-theme-interactive');
  const add = root.getByRole('button', { name: 'Add tab', exact: true });
  const originalAdd = await add.elementHandle();
  await root.locator('.ant-tabs-nav-more').click();
  const draft = page.getByRole('textbox', { name: 'Themed Tabs popup draft', exact: true });
  await draft.fill('Retained popup draft');
  const original = await draft.elementHandle();
  for (const name of ['own-tokens', 'own-algorithm', 'custom-prefix', 'undefined']) {
    await preset(page, name);

    await expect(draft).toBeFocused();
    await expect(draft).toHaveValue('Retained popup draft');
    expect(await draft.evaluate((element, previous) => element === previous, original)).toBe(true);
    expect(await add.evaluate((element, previous) => element === previous, originalAdd)).toBe(true);
    await expect(page.locator('[data-tabs-popup-owner="tabs-theme-interactive"]'))
      .toBeInViewport({ ratio: 1 });
  }
  await page.keyboard.press('Escape');

  await expect(draft).toBeHidden();
  await expect(root.locator('.ant-tabs-nav-more')).toBeFocused();
});

test('source scopes reset parent aliases and retain explicit native root style priority', async ({ page }) => {
  await preset(page, 'own-aliases');
  await check(page, 'Parent Tabs aliases');

  await expect(page.locator('.tabs-token-middle')).toHaveCSS('font-size', '18px');
  await check(page, 'Override Tabs styles');

  await expect(page.locator('.tabs-token-editable .ant-tabs-tab').first())
    .toHaveCSS('padding', '3px 7px');
  await preset(page, 'own-tokens');

  await expect(page.locator('.tabs-token-editable .ant-tabs-tab').first())
    .toHaveCSS('padding', '3px 7px');
});

test('switching source scopes and hashes preserves native controls and disposes the portal on unmount',
  async ({ page }) => {
    await check(page, 'Custom themed Tabs popup');
    await page.locator('#tabs-theme-interactive .ant-tabs-nav-more').click();
    const draft = page.getByRole('textbox', { name: 'Themed Tabs popup draft', exact: true });
    await draft.fill('Native theme draft');
    await check(page, 'Hash themed Tabs', false);
    await check(page, 'Apply source Tabs tokens', false);
    await check(page, 'Native compact themed Tabs');

    await expect(draft).toBeFocused();
    await expect(draft).toHaveValue('Native theme draft');
    await expect(page.locator('#tabs-theme-interactive')).not.toHaveClass(/ant-tabs-source-theme/);
    await check(page, 'Apply source Tabs tokens');
    await expect(draft).toBeFocused();
    await page.getByRole('textbox', { name: 'Themed Tabs outside', exact: true }).focus();
    await check(page, 'Mount themed Tabs', false);

    await expect(page.locator('[data-tabs-popup-owner="tabs-theme-interactive"]')).toHaveCount(0);
    await expect(page.getByRole('textbox', { name: 'Themed Tabs outside', exact: true })).toBeFocused();
  });
