import type { Page } from '@playwright/test';
import { test, expect } from './test';

const root = (page: Page) => page.locator('#list-under-test');
const rows = (page: Page) => root(page).locator('.ant-list-item');
const control = (page: Page, name: string) => page.getByLabel(name, { exact: true });
const select = (page: Page, name: string) => page.getByRole('combobox', { name, exact: true });
const button = (page: Page, name: string) => page.getByRole('button', { name, exact: true });
const pages = (page: Page) => root(page).locator('.ant-pagination');
const pageButton = (page: Page, number: number) => pages(page).first()
  .getByRole('button', { name: `Страница ${number}`, exact: true });
const events = (page: Page) => control(page, 'List events');
const labels = (page: Page) => rows(page).locator('.ant-list-item-meta-title');

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=list');
  await expect(root(page)).toBeVisible();
});

test('List renders native rows, Meta links and default end pagination', async ({ page }) => {
  await expect(labels(page)).toHaveText(['Alpha', 'Beta']);
  await expect(root(page)).toHaveClass(/ant-list-split.*ant-list-bordered/);
  await expect(root(page).locator('.ant-list-items > li.ant-list-item')).toHaveCount(2);
  await expect(rows(page).first()).toHaveCSS('height', '73px');
  await expect(root(page)).toHaveCSS('height', '259px');
  await expect(pages(page)).toHaveClass(/ant-pagination-end/);
  await expect(control(page, 'List refs')).toHaveText('DIV:LI:DIV:same');
  await expect(events(page)).toHaveText('');
});

test('List paginates readonly data and restarts render indices on each page', async ({ page }) => {
  await pageButton(page, 2).click();

  await expect(labels(page)).toHaveText(['Gamma', 'Delta']);
  await expect(rows(page).locator('.ant-list-item-meta-description'))
    .toHaveText(['Index 0', 'Index 1']);
  await expect(events(page)).toHaveText('change:2:2');
});

test('List size changes publish the source callback order and repaginate', async ({ page }) => {
  await pageButton(page, 2).click();
  await button(page, 'Clear list events').click();
  await root(page).getByRole('combobox').click();
  await page.getByRole('listbox').getByRole('option', { name: '3 / стр.', exact: true }).click();

  await expect(labels(page)).toHaveText(['Delta', 'Epsilon', 'Zeta']);
  await expect(events(page)).toHaveText('size:2:3|change:2:3');
});

test('List synchronizes both pagers and forwards their alignment', async ({ page }) => {
  await select(page, 'List page position').selectOption('both');
  await select(page, 'List page align').selectOption('center');
  await pages(page).last().getByRole('button', { name: 'Страница 3', exact: true }).click();

  await expect(labels(page)).toHaveText(['Epsilon', 'Zeta']);
  await expect(pages(page).locator('[aria-current="page"]')).toHaveText(['3', '3']);
  await expect(pages(page).first()).toHaveCSS('justify-content', 'center');
  await expect(events(page)).toHaveText('change:3:2');
});

test('List loadMore replaces only bottom pagination', async ({ page }) => {
  await select(page, 'List page position').selectOption('both');
  await control(page, 'List load more').check();

  await expect(pages(page)).toHaveCount(1);
  await expect(button(page, 'Load more records')).toBeVisible();
  await select(page, 'List page position').selectOption('bottom');
  await expect(pages(page)).toHaveCount(0);
});

test('List preserves page state when pagination toggles through false, true and null', async ({ page }) => {
  await pageButton(page, 2).click();
  await select(page, 'List pagination').selectOption('off');
  await expect(rows(page)).toHaveCount(6);
  await select(page, 'List pagination').selectOption('true');
  await expect(labels(page)).toHaveText(['Gamma', 'Delta']);
  await select(page, 'List pagination').selectOption('null');
  await expect(pages(page)).toHaveCount(0);
  await select(page, 'List pagination').selectOption('config');

  await expect(labels(page)).toHaveText(['Gamma', 'Delta']);
});

test('List controlled pagination can reject a page request', async ({ page }) => {
  await control(page, 'Controlled list paging').check();
  await control(page, 'Accept list pages').uncheck();
  await pageButton(page, 2).click();

  await expect(labels(page)).toHaveText(['Alpha', 'Beta']);
  await expect(control(page, 'List owner')).toHaveText('1:2');
  await expect(events(page)).toHaveText('change:2:2');
  await expect(pageButton(page, 1)).toHaveAttribute('aria-current', 'page');
});

test('List controlled size rejection keeps the selected size and records unchanged', async ({ page }) => {
  await control(page, 'Controlled list paging').check();
  await control(page, 'Accept list pages').uncheck();
  await root(page).getByRole('combobox').click();
  await page.getByRole('listbox').getByRole('option', { name: '3 / стр.', exact: true }).click();

  await expect(labels(page)).toHaveText(['Alpha', 'Beta']);
  await expect(root(page).getByRole('combobox')).toHaveValue('2 / стр.');
  await expect(events(page)).toHaveText('size:1:3|change:1:3');
});

test('List accepts external paging without publishing callbacks', async ({ page }) => {
  await control(page, 'Controlled list paging').check();
  await control(page, 'List owner page').fill('3');
  await expect(labels(page)).toHaveText(['Epsilon', 'Zeta']);
  await control(page, 'List owner size').fill('3');

  await expect(labels(page)).toHaveText(['Delta', 'Epsilon', 'Zeta']);
  await expect(events(page)).toHaveText('');
  await expect(control(page, 'List owner')).toHaveText('3:3');
});

test('List reads defaults once and applies changed defaults after remount', async ({ page }) => {
  await pageButton(page, 2).click();
  await control(page, 'List default page').fill('3');
  await control(page, 'List default size').fill('3');
  await expect(labels(page)).toHaveText(['Gamma', 'Delta']);
  await control(page, 'Mount list').uncheck();
  await control(page, 'Mount list').check();

  await expect(labels(page)).toHaveText(['Delta', 'Epsilon', 'Zeta']);
});

test('List keeps a supplied server page outside its local offset', async ({ page }) => {
  await select(page, 'List data').selectOption('remote');

  await expect(labels(page)).toHaveText(['Epsilon', 'Zeta']);
  await expect(pageButton(page, 4)).toHaveAttribute('aria-current', 'page');
  await expect(events(page)).toHaveText('');
});

test('List clamps empty controlled pages without correcting the owner', async ({ page }) => {
  await control(page, 'Controlled list paging').check();
  await control(page, 'List owner page').fill('3');
  await select(page, 'List data').selectOption('empty');

  await expect(root(page).locator('.ant-empty-normal')).toBeVisible();
  await expect(pageButton(page, 1)).toBeDisabled();
  await expect(control(page, 'List owner')).toHaveText('3:2');
  await expect(events(page)).toHaveText('');
});

test('List preserves keyed component state for zero and empty keys during reordering', async ({ page }) => {
  await select(page, 'List pagination').selectOption('off');
  await button(page, 'Count Alpha').click();
  await button(page, 'Count Alpha').click();
  await button(page, 'Count Beta').click();
  await button(page, 'Reverse list').click();

  await expect(labels(page)).toHaveText(['Zeta', 'Epsilon', 'Delta', 'Gamma', 'Beta', 'Alpha']);
  await expect(button(page, 'Count Alpha')).toHaveText('2');
  await expect(button(page, 'Count Beta')).toHaveText('1');
});

test('List retains duplicate source records without a runtime key collision', async ({ page }) => {
  await select(page, 'List pagination').selectOption('off');
  await select(page, 'List data').selectOption('duplicates');

  await expect(labels(page)).toHaveText(['Alpha', 'Alpha copy', 'Beta']);
});

test('List keeps an empty data container when renderItem is absent', async ({ page }) => {
  await select(page, 'List data').selectOption('no-render');

  await expect(root(page).locator('.ant-list-items')).toHaveCount(1);
  await expect(rows(page)).toHaveCount(0);
  await expect(root(page).locator('.ant-list-empty-text')).toHaveCount(0);
});

test('List appends children after records and lets children suppress Empty', async ({ page }) => {
  await control(page, 'List appended children').check();
  const appended = root(page).getByTestId('list-appended');
  await expect(appended).toBeVisible();
  expect(await root(page).locator('.ant-list-items').evaluate(node =>
    node.nextElementSibling?.matches('[data-testid="list-appended"]'))).toBe(true);
  await select(page, 'List data').selectOption('empty');

  await expect(appended).toBeVisible();
  await expect(root(page).locator('.ant-list-empty-text')).toHaveCount(0);
});

test('List renders numeric header and footer and preserves true wrapper presence', async ({ page }) => {
  await select(page, 'List pagination').selectOption('off');
  await select(page, 'List header').selectOption('zero');
  await select(page, 'List footer').selectOption('zero');

  await expect(root(page).locator('.ant-list-header')).toHaveText('0');
  await expect(root(page).locator('.ant-list-footer')).toHaveText('0');
  await expect(root(page)).toHaveClass(/something-after-last-item/);
  await select(page, 'List header').selectOption('true');
  await expect(root(page).locator('.ant-list-header')).toBeEmpty();
  await select(page, 'List footer').selectOption('off');
  await expect(root(page)).not.toHaveClass(/something-after-last-item/);
});

test('List locale empty content takes priority and zero falls through to renderEmpty', async ({ page }) => {
  await select(page, 'List data').selectOption('empty');
  await select(page, 'List global empty').selectOption('text');
  await expect(root(page).locator('.ant-list-empty-text')).toHaveText('Global empty List');
  await select(page, 'List locale empty').selectOption('text');
  await expect(root(page).locator('.ant-list-empty-text')).toHaveText('Local empty');
  await select(page, 'List locale empty').selectOption('zero');

  await expect(root(page).locator('.ant-list-empty-text')).toHaveText('Global empty List');
  await select(page, 'List locale empty').selectOption('true');
  await expect(root(page).locator('.ant-list-empty-text')).toBeEmpty();
});

test('List renderEmpty accepts snippets and preserves false or zero fallbacks', async ({ page }) => {
  await select(page, 'List data').selectOption('empty');
  await select(page, 'List global empty').selectOption('snippet');
  await expect(root(page).locator('.ant-list-empty-text strong')).toHaveText('Snippet empty');
  await select(page, 'List global empty').selectOption('zero');
  await expect(root(page).locator('.ant-empty-normal')).toBeVisible();
  await select(page, 'List global empty').selectOption('false');

  await expect(root(page).locator('.ant-empty-normal')).toBeVisible();
});

test('List inherits the global Empty locale through its own provider', async ({ page }) => {
  await select(page, 'List data').selectOption('empty');
  await control(page, 'English locale').check();

  await expect(root(page).locator('.ant-empty-description')).toHaveText('No data');
  await expect(root(page).getByRole('button', { name: 'Page 1', exact: true })).toBeDisabled();
});

test('List calls renderEmpty only when the empty state is rendered', async ({ page }) => {
  await select(page, 'List global empty').selectOption('text');
  await button(page, 'Read empty calls').click();
  await expect(control(page, 'Empty calls')).toHaveText('0');
  await select(page, 'List data').selectOption('empty');
  await button(page, 'Read empty calls').click();

  await expect(control(page, 'Empty calls')).not.toHaveText('0');
});

test('List loading hides Empty, keeps the stub and isolates busy children', async ({ page }) => {
  await select(page, 'List data').selectOption('empty');
  await select(page, 'List loading').selectOption('boolean');

  await expect(root(page)).toHaveClass(/ant-list-loading/);
  await expect(root(page).locator('.ant-list-empty-text')).toHaveCount(0);
  await expect(root(page).locator('[style="min-height:53px"]')).toHaveCSS('min-height', '53px');
  await expect(root(page).locator('.ant-spin-container')).toHaveJSProperty('inert', true);
});

test('List preserves the source empty loading-object distinction', async ({ page }) => {
  await select(page, 'List data').selectOption('empty');
  await select(page, 'List loading').selectOption('default');

  await expect(root(page)).not.toHaveClass(/ant-list-loading/);
  await expect(root(page).locator('.ant-spin-spinning')).toHaveCount(1);
  await expect(root(page).locator('.ant-list-empty-text')).toHaveCount(1);
});

test('List forwards loading description and delay without delaying its root state', async ({ page }) => {
  await page.clock.install();
  await select(page, 'List loading').selectOption('delay');
  await expect(root(page)).toHaveClass(/ant-list-loading/);
  await expect(root(page).locator('.ant-spin-spinning')).toHaveCount(0);
  await page.clock.runFor(250);

  await expect(root(page).getByRole('status', { name: 'Loading list', exact: true })).toBeVisible();
});

test('List pagination remains interactive outside the busy content', async ({ page }) => {
  await select(page, 'List loading').selectOption('boolean');
  await pageButton(page, 2).click();

  await expect(labels(page)).toHaveText(['Gamma', 'Delta']);
  await expect(events(page)).toHaveText('change:2:2');
});

test('List mixed snippets and arrays select the source block layout', async ({ page }) => {
  await select(page, 'List children mode').selectOption('mixed');
  await expect(rows(page).first()).toHaveClass(/ant-list-item-no-flex/);
  await expect(rows(page).first()).toHaveCSS('display', 'block');
  await select(page, 'List children mode').selectOption('array');

  await expect(rows(page).first()).toHaveClass(/ant-list-item-no-flex/);
  await select(page, 'List children mode').selectOption('numeric');
  await expect(rows(page).first()).not.toHaveClass(/ant-list-item-no-flex/);
});

test('List text inspection excludes actions and horizontal extra content', async ({ page }) => {
  await select(page, 'List extra').selectOption('text');

  await expect(rows(page).first()).not.toHaveClass(/ant-list-item-no-flex/);
  await expect(rows(page).first().locator('.ant-list-item-action')).toBeVisible();
  await expect(rows(page).first().locator('.ant-list-item-extra')).toHaveCount(0);
  await select(page, 'List children mode').selectOption('single');
  await expect(rows(page).first()).not.toHaveClass(/ant-list-item-no-flex/);
});

test('List vertical rows use main and extra wrappers including numeric zero', async ({ page }) => {
  await select(page, 'List layout').selectOption('vertical');
  await expect(rows(page).first()).toHaveClass(/ant-list-item-no-flex/);
  await select(page, 'List extra').selectOption('zero');

  await expect(rows(page).first()).not.toHaveClass(/ant-list-item-no-flex/);
  await expect(rows(page).first().locator('.ant-list-item-main')).toHaveCount(1);
  await expect(rows(page).first().locator('.ant-list-item-extra')).toHaveText('0');
});

test('List merges provider and local action and extra semantic slots', async ({ page }) => {
  await select(page, 'List layout').selectOption('vertical');
  await select(page, 'List extra').selectOption('text');
  await control(page, 'List semantics').check();
  await expect(root(page)).toHaveClass(/context-list/);
  await expect(root(page)).toHaveCSS('padding', '4px');
  await expect(root(page)).toHaveCSS('color', 'rgb(0, 128, 0)');
  await expect(rows(page).first().locator('.ant-list-item-action'))
    .toHaveClass(/context-actions.*local-actions/);
  await expect(rows(page).first().locator('.ant-list-item-extra'))
    .toHaveCSS('color', 'rgb(255, 192, 203)');
  await control(page, 'List local styles').check();

  await expect(rows(page).first().locator('.ant-list-item-extra'))
    .toHaveCSS('color', 'rgb(0, 0, 255)');
});

test('List Meta preserves numeric zero and clears its refs after unmount', async ({ page }) => {
  await control(page, 'Zero Meta').check();
  await expect(rows(page).first().locator('.ant-list-item-meta-title')).toHaveText('0');
  await expect(rows(page).first().locator('.ant-list-item-meta-avatar')).toHaveText('0');
  await expect(rows(page).first().locator('.ant-list-item-meta-description')).toHaveText('0');
  await control(page, 'Mount list').uncheck();

  await expect(control(page, 'List refs')).toHaveText('none:none:none:none');
  await control(page, 'Mount list').check();
  await expect(control(page, 'List refs')).toHaveText('DIV:LI:DIV:same');
});

test('List explicit default size overrides a small provider size', async ({ page }) => {
  await select(page, 'List context size').selectOption('small');
  await expect(root(page)).toHaveClass(/ant-list-sm/);
  await expect(rows(page).first()).toHaveCSS('padding-top', '8px');
  await select(page, 'List size').selectOption('default');
  await expect(root(page)).not.toHaveClass(/ant-list-sm/);
  await expect(rows(page).first()).toHaveCSS('padding-top', '12px');
  await select(page, 'List size').selectOption('large');

  await expect(rows(page).first()).toHaveCSS('padding-top', '16px');
});

test('List split restores the last separator when a renderable footer follows', async ({ page }) => {
  await select(page, 'List pagination').selectOption('off');
  await expect(rows(page).last()).toHaveCSS('border-bottom-width', '0px');
  await select(page, 'List footer').selectOption('zero');
  await expect(rows(page).last()).toHaveCSS('border-bottom-width', '1px');
  await control(page, 'Split list').uncheck();

  await expect(rows(page).last()).toHaveCSS('border-bottom-width', '0px');
});

test('List grid uses outer width wrappers and native Col refs', async ({ page }) => {
  await select(page, 'List grid').selectOption('fixed');
  const column = root(page).locator('.ant-row > div').first();

  await expect(root(page)).toHaveClass(/ant-list-grid/);
  await expect(column).toHaveCSS('max-width', '50%');
  const ratio = await column.evaluate(node =>
    node.getBoundingClientRect().width / node.parentElement!.getBoundingClientRect().width);
  expect(ratio).toBeCloseTo(0.5, 3);
  await expect(column.locator(':scope > .ant-col > div.ant-list-item')).toHaveCount(1);
  await expect(column.locator(':scope > .ant-col')).toHaveCSS('padding-inline-start', '8px');
  await expect(control(page, 'List refs')).toHaveAttribute('data-column', 'true');
});

test('List responsive grid follows xs, md and xxxl column counts', async ({ page }) => {
  await select(page, 'List grid').selectOption('responsive');
  const column = root(page).locator('.ant-row > div').first();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(column).toHaveCSS('max-width', '100%');
  await page.setViewportSize({ width: 800, height: 900 });
  await expect(column).toHaveCSS('max-width', '33.3333%');
  await page.setViewportSize({ width: 2000, height: 1000 });

  await expect(column).toHaveCSS('max-width', '16.6667%');
});

test('List grid uses the base column when its largest active breakpoint is not configured', async ({ page }) => {
  await select(page, 'List grid').selectOption('fallback');
  const column = root(page).locator('.ant-row > div').first();
  await expect(column).toHaveCSS('max-width', '50%');
  await page.setViewportSize({ width: 600, height: 844 });

  await expect(column).toHaveCSS('max-width', '33.3333%');
});

test('List vertical extra moves above main content on a narrow screen', async ({ page }) => {
  await select(page, 'List layout').selectOption('vertical');
  await select(page, 'List extra').selectOption('picture');
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(rows(page).first()).toHaveCSS('flex-wrap', 'wrap-reverse');
  const extra = await rows(page).first().locator('.ant-list-item-extra').boundingBox();
  const main = await rows(page).first().locator('.ant-list-item-main').boundingBox();

  expect(extra && main && extra.y < main.y).toBe(true);
});

test('List RTL preserves logical page direction and native links', async ({ page }) => {
  await control(page, 'Right to left').check();
  await root(page).getByRole('button', { name: 'Следующая страница', exact: true }).click();

  await expect(root(page)).toHaveAttribute('dir', 'rtl');
  await expect(root(page)).toHaveClass(/ant-list-rtl/);
  await expect(labels(page)).toHaveText(['Gamma', 'Delta']);
  await root(page).getByRole('link', { name: 'Gamma', exact: true }).click();
  await expect(page).toHaveURL(/#Gamma$/);
});

test('List dark and compact themes change colors and density without hiding focus', async ({ page }) => {
  const before = await rows(page).first().evaluate(node => ({
    color: getComputedStyle(node).color,
    padding: getComputedStyle(node).paddingTop
  }));
  await control(page, 'Dark list').check();
  await control(page, 'Compact list').check();
  await expect.poll(() => rows(page).first().evaluate(node => getComputedStyle(node).color))
    .not.toBe(before.color);
  await expect.poll(() => rows(page).first().evaluate(node => getComputedStyle(node).paddingTop))
    .not.toBe(before.padding);
  const link = root(page).getByRole('link', { name: 'Alpha', exact: true });
  await link.focus();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Shift+Tab');

  await expect(link).toBeFocused();
  await expect(link).toHaveCSS('outline-style', 'solid');
});

test('List reconnects text inspection and responsive layout after remount', async ({ page }) => {
  await select(page, 'List children mode').selectOption('mixed');
  await select(page, 'List grid').selectOption('responsive');
  await control(page, 'Mount list').uncheck();
  await page.setViewportSize({ width: 390, height: 844 });
  await control(page, 'Mount list').check();

  await expect(rows(page).first()).toHaveClass(/ant-list-item-no-flex/);
  await expect(root(page).locator('.ant-row > div').first()).toHaveCSS('max-width', '100%');
  await select(page, 'List children mode').selectOption('meta');
  await expect(rows(page).first()).not.toHaveClass(/ant-list-item-no-flex/);
});
