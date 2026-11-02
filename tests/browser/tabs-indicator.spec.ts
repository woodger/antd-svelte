import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-tabs-indicator-metrics.json' with { type: 'json' };

const root = (page: Page) => page.locator('#tabs-indicator-main');
const ink = (page: Page) => root(page).locator('.ant-tabs-ink-bar');

async function check(page: Page, name: string, value = true) {
  await page.getByLabel(name, { exact: true }).evaluate((element, checked) => {
    const input = element as HTMLInputElement;
    input.checked = checked;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
}

async function sample(page: Page, name: string) {
  await page.getByLabel('Tabs indicator reference', { exact: true }).evaluate((element, value) => {
    const select = element as HTMLSelectElement;
    select.value = value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
  }, name);
}

async function clearScroll(page: Page) {
  await page.getByRole('button', { name: 'Clear indicator events', exact: true }).evaluate(element => {
    if (!(element instanceof HTMLButtonElement)) throw new Error('Expected a native button');
    element.click();
  });
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1500 });
  await page.goto('/?fixture=tabs-indicator');
});

for (const expected of reference.cases) {
  test(`indicator matches official geometry for ${expected.name}`, async ({ page }) => {
    await sample(page, expected.name);

    await expect.poll(() => ink(page).evaluate(element => {
      const fields = ['width', 'height', 'left', 'right', 'top', 'transform'] as const;
      return Object.fromEntries(fields.map(field => [field, element.style[field]]));
    })).toEqual(expected.style);
    if (expected.bounds.width === 0 || expected.bounds.height === 0)
      await expect(ink(page)).toBeHidden();
    else await expect(ink(page)).toBeVisible();
    await expect.poll(() => ink(page).evaluate(async element => {
      await Promise.all(element.getAnimations().map(animation => animation.finished.catch(error => {
        if (!(error instanceof DOMException) || error.name !== 'AbortError') throw error;
      })));
      const box = element.getBoundingClientRect();
      const list = element.closest('.ant-tabs-nav-list')!.getBoundingClientRect();
      return { left: box.left - list.left, top: box.top - list.top, width: box.width, height: box.height };
    }).then(bounds => Object.entries(expected.bounds).every(([key, value]) =>
      Math.abs(bounds[key as keyof typeof bounds] - value) < 0.6))).toBe(true);
    await expect(root(page).getByRole('tab', { name: 'Beta', exact: true }))
      .toHaveAttribute('aria-selected', 'true');
    await expect(page.getByLabel('Indicator changes', { exact: true })).toHaveText('[]');
  });
}

for (const expected of reference.behavior) {
  test(`scroll callbacks match source physical directions for ${expected.direction}/${expected.placement}`,
    async ({ page }) => {
      await sample(page, `${expected.direction}-${expected.placement}-center-fixed`);
      await check(page, 'Overflow indicator Tabs');
      await root(page).getByRole('tab', { name: 'Alpha', exact: true }).focus();
      await page.evaluate(() => new Promise<void>(resolve => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      }));
      await clearScroll(page);
      await root(page).getByRole('tab', { name: 'Tab 16', exact: true }).focus();

      await expect(page.getByLabel('Indicator scrolls', { exact: true }))
        .toHaveText(JSON.stringify(expected.events.slice(0, 1)));
      await root(page).getByRole('tab', { name: 'Alpha', exact: true }).focus();

      await expect(page.getByLabel('Indicator scrolls', { exact: true }))
        .toHaveText(JSON.stringify(expected.events));
      await expect(page.getByLabel('Indicator changes', { exact: true })).toHaveText('[]');
      await expect(page.getByLabel('Indicator clicks', { exact: true })).toHaveText('[]');
    });
}

test('indicator updates retain native pane state and focus through theme, axis and direction changes',
  async ({ page }) => {
    const draft = page.getByRole('textbox', { name: 'Indicator draft', exact: true });
    await draft.fill('Retained indicator draft');
    const original = await draft.elementHandle();
    for (const name of ['ltr-top-end-function', 'rtl-top-center-fixed', 'rtl-end-start-function']) {
      await sample(page, name);

      await expect(draft).toBeFocused();
      await expect(draft).toHaveValue('Retained indicator draft');
      expect(await draft.evaluate((element, previous) => element === previous, original)).toBe(true);
    }
    await check(page, 'Dark indicator Tabs');
    await check(page, 'Compact indicator Tabs');

    await expect(draft).toBeFocused();
    await expect(draft).toHaveValue('Retained indicator draft');
    await expect(page.getByLabel('Indicator changes', { exact: true })).toHaveText('[]');
    await expect(page.getByLabel('Indicator clicks', { exact: true })).toHaveText('[]');
  });

test('custom indicator changes keep the open More popup and the scrolled header in place',
  async ({ page }) => {
    await sample(page, 'ltr-top-start-fixed');
    await check(page, 'Overflow indicator Tabs');
    await root(page).getByRole('tab', { name: 'Tab 16', exact: true }).focus();
    const more = root(page).getByRole('button', { name: 'ellipsis', exact: true });
    await more.focus();
    await more.press('ArrowDown');
    const menu = page.getByRole('listbox', { name: 'expanded dropdown', exact: true });
    await expect(menu.getByRole('option', { name: 'Alpha', exact: true })).toBeVisible();
    const before = await root(page).locator('.ant-tabs-nav-wrap').evaluate(element => element.scrollLeft);
    await clearScroll(page);
    await sample(page, 'ltr-top-end-function');

    await expect(more).toBeFocused();
    await expect(menu).toBeVisible();
    await expect.poll(() => root(page).locator('.ant-tabs-nav-wrap')
      .evaluate(element => element.scrollLeft)).toBe(before);
    await expect(page.getByLabel('Indicator scrolls', { exact: true })).toHaveText('[]');
  });

test('native scrolling ignores unchanged positions and uses a replaced callback without resetting scroll',
  async ({ page }) => {
    await sample(page, 'ltr-top-center-fixed');
    await check(page, 'Overflow indicator Tabs');
    await root(page).getByRole('tab', { name: 'Alpha', exact: true }).focus();
    const viewport = root(page).locator('.ant-tabs-nav-wrap');
    await page.evaluate(() => new Promise<void>(resolve => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    }));
    await clearScroll(page);
    await viewport.evaluate(element => element.scrollLeft = 100);

    await expect(page.getByLabel('Indicator scrolls', { exact: true }))
      .toHaveText('[{"direction":"right"}]');
    await check(page, 'Replace scroll callback');
    await viewport.evaluate(element => element.dispatchEvent(new Event('scroll')));
    await viewport.evaluate(element => element.scrollLeft = 0);

    await expect(page.getByLabel('Indicator scrolls', { exact: true }))
      .toHaveText('[{"direction":"right"},{"direction":"left"}]');
    await expect(page.getByLabel('Indicator scroll owners', { exact: true }))
      .toHaveText('["original","new"]');
    await expect(root(page).getByRole('tab', { name: 'Alpha', exact: true })).toBeFocused();
    const detached = await viewport.elementHandle();
    const outside = page.getByRole('textbox', { name: 'Indicator outside', exact: true });
    await outside.focus();
    await check(page, 'Mount indicator Tabs', false);
    await detached!.evaluate(element => {
      element.scrollLeft = 50;
      element.dispatchEvent(new Event('scroll'));
    });

    await expect(outside).toBeFocused();
    await expect(page.getByLabel('Indicator scrolls', { exact: true }))
      .toHaveText('[{"direction":"right"},{"direction":"left"}]');
  });

test('empty and unavailable active headers hide the indicator and pending frames stop at unmount',
  async ({ page }) => {
    await expect(ink(page)).toBeVisible();
    await check(page, 'Empty indicator Tabs');
    await expect(ink(page)).toBeHidden();
    await check(page, 'Empty indicator Tabs', false);
    await expect(ink(page)).toBeVisible();
    await check(page, 'Disable indicator tabs');
    await expect(ink(page)).toBeHidden();
    await check(page, 'Disable indicator tabs', false);
    await expect(ink(page)).toBeVisible();
    await page.clock.install();
    await page.clock.pauseAt(new Date());
    await sample(page, 'rtl-top-end-function');
    const outside = page.getByRole('textbox', { name: 'Indicator outside', exact: true });
    await outside.focus();
    await check(page, 'Mount indicator Tabs', false);
    await page.clock.runFor(100);

    await expect(root(page)).toHaveCount(0);
    await expect(outside).toBeFocused();
  });
