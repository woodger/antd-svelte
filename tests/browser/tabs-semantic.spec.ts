import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-tabs-semantic-reference.json' with { type: 'json' };

async function check(page: Page, name: string, value = true) {
  await page.getByLabel(name, { exact: true }).evaluate((element, checked) => {
    const input = element as HTMLInputElement;
    input.checked = checked;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 1300 });
  await page.goto('/?fixture=tabs-semantic');
});

for (const sample of reference.cases) {
  test(`semantic slots and global settings match the official source for ${sample.name}`,
    async ({ page }) => {
      await check(page, 'Mount semantic Tabs', false);
      await page.getByLabel('Tabs semantic reference', { exact: true }).selectOption(sample.name);
      await check(page, 'Mount semantic Tabs');
      const more = page.locator('#tabs-semantic-main .ant-tabs-nav-more');
      await more.focus();
      await more.press('ArrowDown');
      await expect(page.getByRole('listbox', { name: 'expanded dropdown', exact: true })).toBeVisible();
      const capture = () => page.evaluate(() => {
        const root = document.getElementById('tabs-semantic-main')!;
        const surface = Array.from(document.querySelectorAll<HTMLElement>('.ant-tabs-dropdown'))
          .find(element => element.getClientRects().length)!;
        const nodes: Record<string, Element | null> = {
          root,
          header: root.querySelector('.ant-tabs-nav'),
          item: root.querySelector('.ant-tabs-tab'),
          remove: root.querySelector('.ant-tabs-tab-remove'),
          indicator: root.querySelector('.ant-tabs-ink-bar'),
          body: root.querySelector('.ant-tabs-body'),
          content: root.querySelector('[role=tabpanel]'),
          popup: surface,
          popupRemove: surface.querySelector('.ant-tabs-dropdown-menu-item-remove')
        };
        const classes = Object.fromEntries(Object.entries(nodes).map(([key, element]) => [key,
          element ? Array.from(element.classList)
            .filter(name => /^s-(?:context|local|extra|more)-/.test(name)) : null
        ]));
        const fields: Record<string, string[]> = {
          root: ['color', 'fontSize'],
          header: ['marginBottom'],
          item: ['paddingTop', 'paddingLeft'],
          remove: ['color'],
          indicator: ['width', 'transform', 'backgroundColor'],
          body: ['paddingTop'],
          content: ['paddingLeft'],
          popup: ['backgroundColor'],
          popupRemove: ['color']
        };
        const metrics = Object.fromEntries(Object.entries(nodes).map(([key, element]) => [key,
          element ? Object.fromEntries(fields[key].map(name => [name,
            getComputedStyle(element)[name as keyof CSSStyleDeclaration]
          ])) : null
        ]));
        if (metrics.indicator && nodes.indicator instanceof HTMLElement)
          metrics.indicator.transform = nodes.indicator.style.transform;
        const icon = (element: Element | null) => element ? {
          text: element.textContent,
          paths: Array.from(element.querySelectorAll('path'), path => path.getAttribute('d'))
        } : null;
        return {
          classes,
          metrics,
          icons: {
            more: icon(root.querySelector('.ant-tabs-nav-more')),
            add: icon(root.querySelector('.ant-tabs-nav-add')),
            remove: icon(root.querySelector('.ant-tabs-tab-remove'))
          },
          info: (Reflect.get(window, 'tabsSemanticInfo') ?? []).slice(-4)
        };
      });

      await expect.poll(capture).toEqual({
        classes: sample.classes,
        metrics: sample.metrics,
        icons: sample.icons,
        info: sample.info
      });
    });
}

test('semantic changes preserve bound native roots, drafts, focus and selection', async ({ page }) => {
  const root = page.locator('#tabs-semantic-main');
  const draft = page.getByRole('textbox', { name: 'Semantic Tabs draft', exact: true });
  await draft.fill('Retained semantic draft');
  await draft.evaluate(element => (element as HTMLInputElement).setSelectionRange(2, 7));
  const original = await draft.elementHandle();
  const originalRoot = await root.elementHandle();
  await page.getByLabel('Tabs semantic reference', { exact: true }).evaluate(element => {
    const select = element as HTMLSelectElement;
    select.value = 'callbacks-ltr';
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await check(page, 'Apply global Tabs config', false);

  await expect(draft).toBeFocused();
  await expect(draft).toHaveValue('Retained semantic draft');
  expect(await draft.evaluate((element, previous) => element === previous, original)).toBe(true);
  expect(await root.evaluate((element, previous) => element === previous, originalRoot)).toBe(true);
  expect(await draft.evaluate(element => [
    (element as HTMLInputElement).selectionStart, (element as HTMLInputElement).selectionEnd
  ])).toEqual([2, 7]);
  await expect(page.getByLabel('Semantic native root', { exact: true })).toHaveText('tabs-semantic-main');
  await expect(root).toHaveAttribute('title', 'Native Tabs root');
  await expect(root).toHaveAttribute('data-native-owner', 'semantic');
  await expect(page.getByLabel('Semantic Tabs changes', { exact: true })).toHaveText('[]');
  await check(page, 'Mount semantic Tabs', false);

  await expect(page.getByLabel('Semantic native root', { exact: true })).toHaveText('none');
});

test('native root handlers retain native event dispatch alongside tab selection', async ({ page }) => {
  await page.locator('#tabs-semantic-main').getByRole('tab', { name: 'Tab 2', exact: true }).click();

  await expect(page.getByLabel('Semantic native clicks', { exact: true })).toHaveText('1');
  await expect(page.getByLabel('Semantic Tabs changes', { exact: true })).toHaveText('["1"]');
});

test('styles changed before first opening do not leave stale popup declarations', async ({ page }) => {
  await page.getByLabel('Tabs semantic reference', { exact: true }).selectOption('context-current-more');
  const more = page.locator('#tabs-semantic-main .ant-tabs-nav-more');
  await more.focus();
  await more.press('ArrowDown');

  await expect(page.locator('[data-tabs-popup-owner="tabs-semantic-main"]'))
    .toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
});

test('open popup styles and classes update without replacing its focused option', async ({ page }) => {
  const more = page.locator('#tabs-semantic-main .ant-tabs-nav-more');
  await more.focus();
  await more.press('ArrowDown');
  const menu = page.getByRole('listbox', { name: 'expanded dropdown', exact: true });
  const option = menu.getByRole('option').first();
  await option.focus();
  const previous = await option.elementHandle();
  const surface = page.locator('[data-tabs-popup-owner="tabs-semantic-main"]');
  await expect(surface).toHaveCSS('background-color', 'rgb(70, 80, 90)');

  await page.getByLabel('Tabs semantic reference', { exact: true }).evaluate(element => {
    const select = element as HTMLSelectElement;
    select.value = 'popup-more-style';
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await check(page, 'Apply global Tabs config', false);

  await expect(surface).toHaveCSS('background-color', 'rgb(60, 70, 80)');
  await expect(surface).not.toHaveClass(/s-context-popup/);
  await expect(surface).toHaveClass(/s-local-popup/);
  await expect(menu.locator('.ant-tabs-dropdown-menu-item-remove').first())
    .not.toHaveClass(/s-context-remove/);
  await expect(option).toBeFocused();
  expect(await option.evaluate((element, original) => element === original, previous)).toBe(true);
  await expect(page.getByLabel('Semantic Tabs changes', { exact: true })).toHaveText('[]');
});
