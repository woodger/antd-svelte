import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-tabs-layout-metrics.json' with { type: 'json' };

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

async function gap(page: Page, value: string) {
  await page.getByLabel('Tabs layout gap', { exact: true }).evaluate(
    (element, next) => {
      const input = element as HTMLInputElement;
      input.value = next;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    },
    value
  );
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1400 });
  await page.goto('/?fixture=tabs-layout');
});

for (const sample of reference.cases) {
  test(`Tabs layout matches source metrics for ${sample.name}`, async ({ page }) => {
    await page.getByLabel('Tabs layout reference', { exact: true }).selectOption(sample.name);
    const selectors = {
      nav: '.ant-tabs-nav',
      wrap: '.ant-tabs-nav-wrap',
      list: '.ant-tabs-nav-list',
      add: '.ant-tabs-nav-add'
    };
    for (const key of ['nav', 'wrap', 'list', 'add'] as const) {
      const expected = sample.metrics[key];
      const control = root(page).locator(selectors[key]);
      await expect(control).toHaveCount(expected ? 1 : 0);
      if (!expected) continue;

      await expect.poll(
        () => control.evaluate(
          (element, fields) => {
            const style = getComputedStyle(element);
            return Object.fromEntries(
              fields.map(name => [name, style[name as keyof CSSStyleDeclaration]])
            );
          },
          Object.keys(expected)
        ),
        { message: `${sample.name}/${key}` }
      ).toEqual(expected);
    }
    await expect.poll(
      () => root(page).locator('.ant-tabs-tab').evaluateAll(
        (elements, fields) => elements.map(element => {
          const style = getComputedStyle(element);
          return Object.fromEntries(
            fields.map(name => [name, style[name as keyof CSSStyleDeclaration]])
          );
        }),
        Object.keys(sample.metrics.nav)
      ),
      { message: `${sample.name}/tabs` }
    ).toEqual(sample.metrics.tabs);
    await expect.poll(() => root(page).evaluate(element => {
      const wrap = element.querySelector('.ant-tabs-nav-wrap')!.getBoundingClientRect();
      const list = element.querySelector('.ant-tabs-nav-list')!.getBoundingClientRect();
      return { left: list.left - wrap.left, top: list.top - wrap.top };
    })).toEqual(sample.metrics.listOffset);
  });
}

test('Tabs changes logical gutters without replacing panes or changing the selected key',
  async ({ page }) => {
    await check(page, 'Interactive Tabs layout');
    const draft = page.getByRole('textbox', { name: 'Layout Alpha draft', exact: true });
    await draft.fill('Retained draft');
    const original = await draft.elementHandle();
    await draft.focus();

    await gap(page, '0');
    await expect(tab(page, 'Beta')).toHaveCSS('margin-inline-start', '0px');
    await gap(page, '12.5');
    await expect(tab(page, 'Beta')).toHaveCSS('margin-inline-start', '12.5px');
    await expect(tab(page, 'Locked')).toHaveCSS('margin-inline-start', '12.5px');
    await expect(tab(page, 'Alpha')).not.toHaveAttribute('style');
    await expect(draft).toBeFocused();

    await check(page, 'Center Tabs layout');
    await check(page, 'RTL Tabs layout');

    await expect(tab(page, 'Beta')).toHaveCSS('margin-right', '12.5px');
    await expect(root(page)).toHaveClass(/ant-tabs-centered/);
    await expect(draft).toBeFocused();
    await expect(draft).toHaveValue('Retained draft');
    expect(await draft.evaluate((element, previous) => element === previous, original)).toBe(true);
    await expect(page.getByLabel('Tabs layout changes', { exact: true })).toHaveText('[]');
    await expect(page.getByLabel('Tabs layout clicks', { exact: true })).toHaveText('[]');

    await gap(page, '');

    await expect.poll(() => tab(page, 'Beta').evaluate(element => element.style.marginInlineStart))
      .toBe('');
    await expect(draft).toBeFocused();
  });

test('Tabs applies vertical gaps to outer editable cells and the add button, including zero',
  async ({ page }) => {
    await check(page, 'Interactive Tabs layout');
    await page.getByLabel('Tabs layout type', { exact: true }).selectOption('editable-card');
    await page.getByLabel('Tabs layout placement', { exact: true }).selectOption('start');
    await gap(page, '12.5');
    const betaCell = root(page).locator('[data-tabs-cell="beta"]');
    const add = root(page).getByRole('button', { name: 'Add tab', exact: true });

    await expect(betaCell).toHaveCSS('margin-top', '12.5px');
    await expect(tab(page, 'Beta')).not.toHaveAttribute('style');
    await expect(add).toHaveCSS('margin-top', '12.5px');
    await expect(root(page).locator('[data-tabs-cell=""]')).not.toHaveAttribute('style');
    await gap(page, '0');

    await expect(betaCell).toHaveCSS('margin-top', '0px');
    await expect(add).toHaveCSS('margin-top', '0px');
    await check(page, 'RTL Tabs layout');

    await expect(root(page)).toHaveClass(/ant-tabs-right/);
    await expect(betaCell).toHaveCSS('margin-top', '0px');
  });

test('centered overflowing Tabs retain native scrolling, focus and the active indicator',
  async ({ page }) => {
    await check(page, 'Interactive Tabs layout');
    await check(page, 'Center Tabs layout');
    await gap(page, '80');
    await check(page, 'Narrow Tabs layout');
    await tab(page, 'Alpha').focus();
    await page.keyboard.press('ArrowRight');

    await expect(tab(page, 'Beta')).toBeFocused();
    await expect(tab(page, 'Alpha')).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('Enter');

    await expect(tab(page, 'Beta')).toHaveAttribute('aria-selected', 'true');
    await expect.poll(() => root(page).evaluate(element => {
      const tab = element.querySelector('[role="tab"][aria-selected="true"]')!;
      const wrap = element.querySelector('.ant-tabs-nav-wrap')!.getBoundingClientRect();
      const box = tab.getBoundingClientRect();
      return box.left >= wrap.left - 1 && box.right <= wrap.right + 1;
    })).toBe(true);
    await gap(page, '0');

    await expect.poll(() => root(page).evaluate(async element => {
      const ink = element.querySelector<HTMLElement>('.ant-tabs-ink-bar')!;
      await Promise.all(ink.getAnimations().map(animation => animation.finished));
      const selected = element.querySelector('[role="tab"][aria-selected="true"]')!
        .getBoundingClientRect();
      const actual = ink.getBoundingClientRect();
      return Math.abs(selected.left - actual.left) < 1 && Math.abs(selected.width - actual.width) < 1;
    })).toBe(true);
  });

test('Tabs keeps header styles on the header through theme changes and releases layout observers',
  async ({ page }) => {
    await check(page, 'Interactive Tabs layout');
    await page.getByLabel('Tabs header style', { exact: true }).fill(
      'background-color:rgb(9, 10, 11);padding:6px;border-top:3px solid red'
    );
    await check(page, 'Center Tabs layout');
    await check(page, 'Dark Tabs layout');
    await check(page, 'Compact Tabs layout');

    await expect(root(page).locator('.ant-tabs-nav')).toHaveCSS('background-color', 'rgb(9, 10, 11)');
    await expect(root(page).locator('.ant-tabs-nav')).toHaveCSS('padding-top', '6px');
    await expect(root(page)).toHaveCSS('color', 'rgb(170, 20, 30)');
    await expect(root(page)).toHaveCSS('border-top-width', '0px');
    const outside = page.getByRole('textbox', { name: 'Tabs layout outside', exact: true });
    await outside.focus();
    await check(page, 'Mount Tabs layout', false);
    await page.setViewportSize({ width: 900, height: 900 });
    await page.evaluate(() => new Promise<void>(resolve => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    }));

    await expect(root(page)).toHaveCount(0);
    await expect(outside).toBeFocused();
    await expect(page.getByLabel('Tabs layout changes', { exact: true })).toHaveText('[]');
  });

for (const type of ['line', 'editable-card']) {
  test(`Tabs changes the ${type} gutter axis at the native mobile breakpoint`, async ({ page }) => {
    await check(page, 'Interactive Tabs layout');
    await page.getByLabel('Tabs layout type', { exact: true }).selectOption(type);
    await page.getByLabel('Tabs layout placement', { exact: true }).selectOption('start');
    await check(page, 'RTL Tabs layout');
    await gap(page, '12.5');
    const cell = root(page).locator(type === 'line'
      ? '[role="tab"][data-tabs-key="beta"]' : '[data-tabs-cell="beta"]');

    await expect(root(page)).toHaveClass(/ant-tabs-right/);
    await expect(cell).toHaveCSS('margin-top', '12.5px');
    await page.setViewportSize({ width: 575, height: 1000 });

    await expect(root(page)).toHaveClass(/ant-tabs-top/);
    await expect(cell).toHaveCSS('margin-inline-start', '12.5px');
    expect(await cell.evaluate(element => element.style.marginTop)).toBe('');
    await page.setViewportSize({ width: 576, height: 1000 });

    await expect(root(page)).toHaveClass(/ant-tabs-right/);
    await expect(cell).toHaveCSS('margin-top', '12.5px');
    expect(await cell.evaluate(element => element.style.marginInlineStart)).toBe('');
    await expect(tab(page, 'Alpha')).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByLabel('Tabs layout changes', { exact: true })).toHaveText('[]');
  });
}

test('centered vertical Tabs keep overflowing headers reachable by native keyboard scrolling',
  async ({ page }) => {
    await check(page, 'Interactive Tabs layout');
    await check(page, 'Center Tabs layout');
    await page.getByLabel('Tabs layout placement', { exact: true }).selectOption('start');
    await gap(page, '200');
    await tab(page, 'Alpha').focus();
    await page.keyboard.press('ArrowDown');

    await expect(tab(page, 'Beta')).toBeFocused();
    await expect.poll(() => root(page).evaluate(element => {
      const beta = element.querySelector('[role="tab"][data-tabs-key="beta"]')!
        .getBoundingClientRect();
      const wrap = element.querySelector('.ant-tabs-nav-wrap')!.getBoundingClientRect();
      return beta.top >= wrap.top - 1 && beta.bottom <= wrap.bottom + 1;
    })).toBe(true);
    await expect(tab(page, 'Alpha')).toHaveAttribute('aria-selected', 'true');
  });
