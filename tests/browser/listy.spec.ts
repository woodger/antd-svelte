import type { Locator, Page } from '@playwright/test';
import { test, expect } from './test';

const root = (page: Page) => page.locator('#listy-under-test');
const holder = (page: Page) => root(page).locator(':scope > .ant-listy-holder');
const rows = (page: Page) => root(page).locator('.ant-listy-item');
const label = (page: Page, name: string) => page.getByLabel(name, { exact: true });
const select = (page: Page, name: string) => page.getByRole('combobox', { name, exact: true });
const button = (page: Page, name: string) => page.getByRole('button', { name, exact: true });
const record = (page: Page, key: string) => root(page).locator('[data-record]')
  .filter({ has: page.getByRole('link', { name: `Record ${key}`, exact: true }) });
const header = (page: Page, group: number) => root(page).locator('.ant-listy-holder-inner')
  .locator('.ant-listy-group-header').filter({ has: page.locator(`[data-group="${group}"]`) });

async function top(element: Locator) { return element.evaluate(node => node.scrollTop); }

async function edges(element: Locator) {
  return element.evaluate(node => {
    const rect = node.getBoundingClientRect();
    return { top: rect.top, bottom: rect.bottom, height: rect.height };
  });
}

async function virtual(page: Page) { await select(page, 'Listy mode').selectOption('virtual'); }

async function groups(page: Page) {
  await label(page, 'Listy groups').check();
  await label(page, 'Listy sticky').check();
}

async function scrollItem(page: Page, key: string) {
  await label(page, 'Listy target key').fill(key);
  await button(page, 'Scroll Listy item').click();
}

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=listy');
  await expect(root(page)).toBeVisible();
});

test('Listy renders native raw rows, stable ref and focusable content by default', async ({ page }) => {
  await expect(rows(page)).toHaveCount(20);
  await expect(root(page)).toHaveAttribute('dir', 'ltr');
  await expect(root(page)).toHaveCSS('max-height', '200px');
  await expect(holder(page)).toHaveCount(0);
  await expect(label(page, 'Listy refs')).toHaveText('scrollTo:DIV');
  await expect(rows(page).first()).toHaveAttribute('data-key', 'item:row-000');

  await rows(page).first().getByRole('link').focus();
  await page.keyboard.press('Tab');
  await expect(button(page, 'Action row-000')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(label(page, 'Listy actions')).toHaveText('1');
});

test('Listy groups noncontiguous records while retaining original render indexes', async ({ page }) => {
  await label(page, 'Listy groups').check();

  await expect(root(page).locator('.ant-listy-group-section')).toHaveCount(4);
  const first = root(page).locator('.ant-listy-group-section').first();
  await expect(first.locator('[data-record]').first()).toHaveAttribute('data-source-index', '0');
  expect(await first.locator('[data-record]').evaluateAll(nodes => nodes.map(node =>
    node.getAttribute('data-source-index')))).toEqual(['0', '4', '8', '12', '16']);
  await expect(first.getByText('Group 0 (5)', { exact: true })).toBeVisible();
});

test('Listy raw item alignment leaves room for the measured sticky header and offset', async ({ page }) => {
  await groups(page);
  await label(page, 'Listy offset').fill('7');
  await scrollItem(page, 'row-012');

  await expect.poll(async () => {
    const bounds = await edges(root(page));
    const item = await edges(record(page, 'row-012').locator('..'));
    const group = await edges(root(page).locator('.ant-listy-group-header').first());
    return Math.abs(item.top - bounds.top - group.height - 7);
  }).toBeLessThan(1.1);
  await expect(record(page, 'row-012').locator('..')).toHaveCSS('scroll-margin-top', '0px');
  await expect(record(page, 'row-012').locator('..')).toHaveCSS('scroll-margin-bottom', '0px');
});

test('Listy raw group bottom alignment targets the entire section', async ({ page }) => {
  await groups(page);
  await select(page, 'Listy align').selectOption('bottom');
  await button(page, 'Scroll Listy group').click();

  await expect.poll(async () => {
    const section = await edges(root(page).locator('[data-key="group:2"]'));
    return Math.abs(section.bottom - (await edges(root(page))).bottom);
  }).toBeLessThan(1.1);
});

test('Listy raw scrollTo preserves missing and null requests and reports native root events', async ({ page }) => {
  await button(page, 'Scroll Listy number').click();
  await expect.poll(() => top(root(page))).toBe(400);
  await expect(label(page, 'Listy events')).toContainText('ant-listy');
  await scrollItem(page, 'missing');
  await button(page, 'Scroll Listy null').click();
  await button(page, 'Flash Listy scrollbar').click();

  await expect.poll(() => top(root(page))).toBe(400);
  await label(page, 'Listy position').fill('120');
  await button(page, 'Scroll Listy position').click();
  await expect.poll(() => top(root(page))).toBe(120);
});

test('Listy raw item keys take priority over a simultaneous group key', async ({ page }) => {
  await groups(page);
  await label(page, 'Listy target key').fill('row-012');
  await button(page, 'Scroll Listy both keys').click();

  await expect.poll(async () => {
    const bounds = await edges(root(page));
    const item = await edges(record(page, 'row-012').locator('..'));
    const group = await edges(root(page).locator('.ant-listy-group-header').first());
    return Math.abs(item.top - bounds.top - group.height);
  }).toBeLessThan(1.1);
});

test('Listy raw key selectors escape quotes, brackets and backslashes', async ({ page }) => {
  await label(page, 'Listy special keys').check();
  await scrollItem(page, 'a:"b]\\c');

  await expect.poll(() => top(root(page))).toBeGreaterThan(0);
  await expect(rows(page).nth(2)).toHaveAttribute('data-key', 'item:a:"b]\\c');
  await scrollItem(page, '');
  await expect(rows(page).nth(1)).toHaveAttribute('data-key', 'item:');
});

test('Listy inherits virtual from ConfigProvider with an explicit local override', async ({ page }) => {
  await label(page, 'Listy context virtual').check();
  await expect(holder(page)).toHaveCount(0);
  await select(page, 'Listy mode').selectOption('inherit');

  await expect(holder(page)).toBeVisible();
  await expect.poll(() => rows(page).count()).toBeLessThan(20);
  await expect(rows(page).first()).not.toHaveAttribute('data-key');
  await expect(root(page)).not.toHaveAttribute('dir');
  await expect(holder(page)).toHaveCSS('overflow-y', 'hidden');
});

test('Listy switches raw and virtual branches with fresh scroll state and bindings', async ({ page }) => {
  await button(page, 'Scroll Listy number').click();
  await expect.poll(() => top(root(page))).toBe(400);
  await virtual(page);
  await expect.poll(() => top(holder(page))).toBe(0);
  await expect(label(page, 'Listy refs')).toHaveText('scrollTo:DIV');
  await select(page, 'Listy mode').selectOption('raw');

  await expect.poll(() => top(root(page))).toBe(0);
  await expect(rows(page)).toHaveCount(20);
});

for (const height of ['0', 'none']) {
  test(`Listy virtual branch renders every record with height=${height}`, async ({ page }) => {
    await virtual(page);
    await select(page, 'Listy height').selectOption(height);

    await expect(rows(page)).toHaveCount(20);
    await expect(root(page).locator('.ant-listy-scrollbar')).toHaveCount(0);
    await expect(holder(page)).toHaveCSS('max-height', 'none');
    await expect(rows(page).last()).toBeVisible();
  });
}

test('Listy raw height zero collapses the viewport', async ({ page }) => {
  await select(page, 'Listy height').selectOption('0');

  await expect(root(page)).toHaveCSS('max-height', '0px');
  expect((await edges(root(page))).height).toBe(0);
  await expect(rows(page)).toHaveCount(20);
});

test('Listy fitting virtual datasets render all items without a scrollbar', async ({ page }) => {
  await select(page, 'Listy count').selectOption('2');
  await virtual(page);

  await expect(rows(page)).toHaveCount(2);
  await expect(root(page).locator('.ant-listy-scrollbar')).toHaveCount(0);
  await expect(holder(page)).toHaveCSS('max-height', '200px');
  expect((await edges(holder(page))).height).toBeLessThan(200);
});

test('Listy fractional viewports preserve scrollbar geometry after measurement', async ({ page }) => {
  await select(page, 'Listy height').selectOption('200.5');
  await virtual(page);

  expect((await edges(holder(page))).height).toBe(200.5);
  await expect(root(page).locator('.ant-listy-scrollbar-thumb')).toHaveCSS('height', '42px');
});

test('Listy virtual scrollTo reaches distant measured rows with a bounded DOM', async ({ page }) => {
  await select(page, 'Listy count').selectOption('2000');
  await virtual(page);
  await scrollItem(page, 'row-1500');

  await expect(record(page, 'row-1500')).toBeVisible();
  await expect(record(page, 'row-1500')).toHaveAttribute('data-source-index', '1500');
  await expect.poll(async () => Math.abs((await edges(record(page, 'row-1500').locator('..'))).top
    - (await edges(holder(page))).top)).toBeLessThan(1.1);
  await expect.poll(() => rows(page).count()).toBeLessThan(10);
  await expect(label(page, 'Listy events')).toContainText('ant-listy-holder:');
});

test('Listy virtual top alignment uses actual sticky header height', async ({ page }) => {
  await groups(page);
  await virtual(page);
  await button(page, 'Scroll Listy group').click();
  await expect(header(page, 2)).toHaveCSS('height', '38px');
  await label(page, 'Listy offset').fill('9');
  await scrollItem(page, 'row-014');

  await expect.poll(async () => {
    const fixed = root(page).locator('.ant-listy-group-header-fixed');
    const item = await edges(record(page, 'row-014').locator('..'));
    return Math.abs(item.top - (await edges(holder(page))).top - (await edges(fixed)).height - 9);
  }).toBeLessThan(1.1);
  await expect(root(page).locator('.ant-listy-group-header-fixed')).toHaveText('Group 2 (5)');
});

test('Listy virtual top alignment retains the estimate for an unmeasured group header', async ({ page }) => {
  await groups(page);
  await virtual(page);
  await label(page, 'Listy offset').fill('9');
  await scrollItem(page, 'row-014');

  await expect.poll(async () => Math.abs((await edges(record(page, 'row-014').locator('..'))).top
    - (await edges(holder(page))).top - 55)).toBeLessThan(1.1);
  await expect(root(page).locator('.ant-listy-group-header-fixed')).toHaveCSS('height', '38px');
});

test('Listy virtual bottom alignment applies offset without sticky header padding', async ({ page }) => {
  await groups(page);
  await virtual(page);
  await select(page, 'Listy align').selectOption('bottom');
  await label(page, 'Listy offset').fill('10');
  await scrollItem(page, 'row-014');

  await expect.poll(async () => Math.abs((await edges(holder(page))).bottom - 10
    - (await edges(record(page, 'row-014').locator('..'))).bottom)).toBeLessThan(1.1);
});

test('Listy virtual auto alignment keeps visible targets still and reveals offscreen ones', async ({ page }) => {
  await virtual(page);
  await select(page, 'Listy align').selectOption('auto');
  await scrollItem(page, 'row-001');
  await expect.poll(() => top(holder(page))).toBe(0);
  await scrollItem(page, 'row-010');
  await expect(record(page, 'row-010')).toBeVisible();
  await expect.poll(async () => Math.abs((await edges(holder(page))).bottom
    - (await edges(record(page, 'row-010').locator('..'))).bottom)).toBeLessThan(1.1);
  await scrollItem(page, 'row-000');
  await expect.poll(() => top(holder(page))).toBe(0);
});

test('Listy virtual group bottom alignment targets the header row', async ({ page }) => {
  await groups(page);
  await virtual(page);
  await select(page, 'Listy align').selectOption('bottom');
  await button(page, 'Scroll Listy group').click();

  await expect.poll(async () => Math.abs((await edges(header(page, 2))).bottom
    - (await edges(holder(page))).bottom)).toBeLessThan(1.1);
});

test('Listy virtual group keys take priority over simultaneous item keys', async ({ page }) => {
  await groups(page);
  await virtual(page);
  await button(page, 'Scroll Listy both keys').click();

  await expect.poll(async () => Math.abs((await edges(header(page, 2))).top
    - (await edges(holder(page))).top)).toBeLessThan(1.1);
  await expect(root(page).locator('.ant-listy-group-header-fixed')).toHaveText('Group 2 (5)');
});

test('Listy virtual missing keys retain the current position after alignment retries', async ({ page }) => {
  await virtual(page);
  await button(page, 'Scroll Listy number').click();
  await expect.poll(() => top(holder(page))).toBe(400);
  await scrollItem(page, 'missing');

  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() =>
    requestAnimationFrame(() => resolve()))));
  await expect.poll(() => top(holder(page))).toBe(400);
});

test('Listy virtual scrollTo resolves a key arriving in the same update', async ({ page }) => {
  await virtual(page);
  await button(page, 'Scroll Listy arriving record').click();

  await expect(record(page, 'row-020')).toBeVisible();
  await expect.poll(() => top(holder(page))).toBeGreaterThan(400);
});

test('Listy virtual scrollTo keeps the latest request after pending measurements', async ({ page }) => {
  await virtual(page);
  await button(page, 'Scroll Listy latest request').click();

  await expect.poll(async () => Math.abs((await edges(record(page, 'row-006').locator('..'))).top
    - (await edges(holder(page))).top)).toBeLessThan(1.1);
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() =>
    requestAnimationFrame(() => resolve()))));
  await expect(record(page, 'row-006')).toBeVisible();
});

test('Listy virtual variable-height rows settle scrollTo after measurement', async ({ page }) => {
  await label(page, 'Listy variable heights').check();
  await virtual(page);
  await scrollItem(page, 'row-012');

  await expect.poll(async () => Math.abs((await edges(record(page, 'row-012').locator('..'))).top
    - (await edges(holder(page))).top)).toBeLessThan(1.1);
  await label(page, 'Listy variable heights').uncheck();
  await expect.poll(() => rows(page).first().locator('[data-record]')
    .evaluate(node => node.style.height)).toBe('');
  await scrollItem(page, 'row-012');
  await expect.poll(async () => Math.abs((await edges(record(page, 'row-012').locator('..'))).top
    - (await edges(holder(page))).top)).toBeLessThan(1.1);
});

test('Listy virtual clamps numeric positions and recovers when the dataset shrinks', async ({ page }) => {
  await virtual(page);
  await label(page, 'Listy position').fill('100000');
  await button(page, 'Scroll Listy number').click();
  await expect(record(page, 'row-019')).toBeVisible();
  await select(page, 'Listy count').selectOption('2');

  await expect(rows(page)).toHaveCount(2);
  await expect.poll(() => top(holder(page))).toBe(0);
  await expect(root(page).locator('.ant-listy-scrollbar')).toHaveCount(0);
});

test('Listy virtual wheel scrolls rows and Shift-wheel keeps vertical position', async ({ page }) => {
  await virtual(page);
  await holder(page).hover();
  await page.mouse.wheel(0, 300);
  await expect.poll(() => top(holder(page))).toBeGreaterThan(0);
  await expect.poll(() => rows(page).first().locator('[data-record]')
    .getAttribute('data-source-index').then(value => Number(value))).toBeGreaterThan(0);
  const previous = await top(holder(page));
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() =>
    requestAnimationFrame(() => resolve()))));
  await holder(page).dispatchEvent('wheel', { deltaY: 120, deltaX: 0, shiftKey: true });
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => resolve())));

  expect(await top(holder(page))).toBe(previous);
});

test('Listy virtual wheel releases a boundary gesture to the parent after its lock expires', async ({ page }) => {
  await page.clock.install();
  await virtual(page);
  const wheel = (deltaY: number) => holder(page).evaluate((node, delta) => {
    const event = new WheelEvent('wheel', { deltaY: delta, bubbles: true, cancelable: true });
    node.dispatchEvent(event);
    return event.defaultPrevented;
  }, deltaY);

  expect(await wheel(-120)).toBe(false);
  expect(await wheel(120)).toBe(true);
  await page.clock.runFor(32);
  await expect.poll(() => top(holder(page))).toBe(120);
  await label(page, 'Listy position').fill('100000');
  await button(page, 'Scroll Listy number').click();
  await expect(record(page, 'row-019')).toBeVisible();
  await button(page, 'Scroll Listy number').click();
  await expect.poll(() => holder(page).evaluate(node =>
    Math.abs(node.scrollHeight - node.clientHeight - node.scrollTop))).toBeLessThan(1);
  await page.clock.runFor(64);

  expect(await wheel(120)).toBe(false);
});

test('Listy nested virtual lists consume a wheel event once', async ({ page }) => {
  await label(page, 'Listy nested').check();
  await virtual(page);
  const nested = page.locator('#nested-listy > .ant-listy-holder');
  await nested.hover();
  await page.mouse.wheel(0, 120);

  await expect.poll(() => top(nested)).toBeGreaterThan(0);
  expect(await top(holder(page))).toBe(0);
});

test('Listy virtual touch scrolls with momentum after finger release', async ({ page }) => {
  await select(page, 'Listy count').selectOption('2000');
  await virtual(page);
  await holder(page).scrollIntoViewIfNeeded();
  const bounds = await holder(page).boundingBox();
  if (!bounds) throw new Error('Missing touch viewport');
  const session = await page.context().newCDPSession(page);
  try {
    await session.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 });
    const point = { x: bounds.x + bounds.width / 2, y: bounds.y + 170 };
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point] });
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchMove', touchPoints: [{ ...point, y: bounds.y + 40 }]
    });
    await expect.poll(() => top(holder(page))).toBeGreaterThan(50);
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    const previous = await top(holder(page));

    await expect.poll(() => top(holder(page))).toBeGreaterThan(previous + 50);
  } finally {
    await session.send('Emulation.setTouchEmulationEnabled', { enabled: false });
    await session.detach();
  }
});

test('Listy scrollbar track clicks and dragging update the virtual viewport', async ({ page }) => {
  await virtual(page);
  const track = root(page).locator('.ant-listy-scrollbar');
  const thumb = track.locator('.ant-listy-scrollbar-thumb');
  await track.click({ position: { x: 4, y: 130 } });
  await expect.poll(() => top(holder(page))).toBeGreaterThan(300);
  const previous = await top(holder(page));
  const bounds = await thumb.boundingBox();
  if (!bounds) throw new Error('Missing scrollbar thumb');
  await page.mouse.move(bounds.x + 4, bounds.y + bounds.height / 2);
  await page.mouse.down();
  await expect(holder(page)).toHaveCSS('pointer-events', 'none');
  await page.mouse.move(bounds.x + 4, bounds.y + bounds.height / 2 - 40);
  await expect.poll(() => top(holder(page))).toBeLessThan(previous);
  await page.mouse.up();

  await expect(holder(page)).toHaveCSS('pointer-events', 'auto');
  await expect(thumb).not.toHaveClass(/thumb-moving/);
});

test('Listy scrollbar hides after its timeout and imperative null requests flash it', async ({ page }) => {
  await page.clock.install();
  await virtual(page);
  const track = root(page).locator('.ant-listy-scrollbar');
  await expect(track).toBeVisible();
  await page.clock.runFor(3100);
  await expect(track).toBeHidden();
  await button(page, 'Scroll Listy null').click();
  await expect(track).toBeVisible();
  await page.clock.runFor(3100);
  await expect(track).toBeHidden();
  await button(page, 'Flash Listy scrollbar').click();
  await expect(track).toBeVisible();
});

test('Listy visible scrollbars inherit a hidden ancestor instead of overriding its visibility', async ({ page }) => {
  await virtual(page);
  const track = root(page).locator('.ant-listy-scrollbar');
  await expect(track).toBeVisible();
  await label(page, 'Listy hidden').check();

  await expect(track).toHaveCSS('visibility', 'hidden');
  await expect(track).toBeHidden();
  await label(page, 'Listy hidden').uncheck();
  await expect(track).toBeVisible();
});

test('Listy virtual mouse selection drag scrolls outside the viewport and stops on release', async ({ page }) => {
  await virtual(page);
  const bounds = await holder(page).boundingBox();
  if (!bounds) throw new Error('Missing viewport');
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + 100);
  await page.mouse.down();
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height + 50);
  await expect.poll(() => top(holder(page))).toBeGreaterThan(50);
  await page.mouse.up();
  const previous = await top(holder(page));
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() =>
    requestAnimationFrame(() => resolve()))));

  expect(await top(holder(page))).toBe(previous);
});

test('Listy merges semantic slots and forces relative positioning only in virtual mode', async ({ page }) => {
  await label(page, 'Listy semantic styles').check();
  await expect(root(page)).toHaveClass(/provider-listy provider-height-200 root-listy local-listy/);
  await expect(rows(page).first()).toHaveClass(/provider-item local-item/);
  await expect(rows(page).first()).toHaveCSS('padding-top', '7px');
  await expect(root(page)).toHaveCSS('color', 'rgb(0, 0, 90)');
  await expect(root(page)).toHaveCSS('position', 'static');
  await virtual(page);

  await expect(root(page)).toHaveCSS('position', 'relative');
});

test('Listy computed sticky push offset wins over user top styles', async ({ page }) => {
  await label(page, 'Listy semantic styles').check();
  await groups(page);
  await virtual(page);
  const fixed = root(page).locator('.ant-listy-group-header-fixed');

  await expect(fixed).toHaveCSS('top', '0px');
  await expect(fixed).toHaveClass(/provider-header local-header/);
});

test('Listy sticky virtual headers push out before the following group takes over', async ({ page }) => {
  await groups(page);
  await virtual(page);
  await label(page, 'Listy position').fill('260');
  await button(page, 'Scroll Listy number').click();
  const fixed = root(page).locator('.ant-listy-group-header-fixed');

  await expect(fixed).toHaveText('Group 0 (5)');
  await expect.poll(async () => Number.parseFloat(await fixed.evaluate(node => node.style.top)))
    .toBeLessThan(0);
  await expect.poll(async () => Math.abs((await edges(fixed)).bottom
    - (await edges(header(page, 1))).top)).toBeLessThan(1.1);
  const next = (await edges(header(page, 1))).top - (await edges(holder(page))).top
    + await top(holder(page));
  await label(page, 'Listy position').fill(String(next));
  await button(page, 'Scroll Listy number').click();
  await expect(fixed).toHaveText('Group 1 (5)');
});

test('Listy empty datasets keep a mounted ref without rendering an invented empty state', async ({ page }) => {
  await virtual(page);
  await select(page, 'Listy count').selectOption('0');

  await expect(rows(page)).toHaveCount(0);
  await expect(root(page).locator('.ant-empty')).toHaveCount(0);
  await expect(root(page).locator('.ant-listy-scrollbar')).toHaveCount(0);
  await expect(label(page, 'Listy refs')).toHaveText('scrollTo:DIV');
});

test('Listy preserves stable item content through reorder and appended records', async ({ page }) => {
  await select(page, 'Listy height').selectOption('none');
  await rows(page).first().getByRole('button').focus();
  await button(page, 'Reverse Listy records').dispatchEvent('click');
  await expect(button(page, 'Action row-000')).toBeFocused();
  await expect(record(page, 'row-000')).toHaveAttribute('data-source-index', '19');
  await button(page, 'Append Listy records').click();

  await expect(rows(page)).toHaveCount(22);
});

test('Listy virtual branch uses RTL scrollbars and native content direction', async ({ page }) => {
  await label(page, 'Right to left').check();
  await virtual(page);

  await expect(root(page)).toHaveAttribute('dir', 'rtl');
  await expect(root(page)).toHaveClass(/ant-listy-rtl/);
  await expect(root(page).locator('.ant-listy-scrollbar')).toHaveCSS('left', '0px');
  expect((await edges(root(page).locator('.ant-listy-scrollbar'))).height).toBe(200);
  expect(await root(page).locator('.ant-listy-scrollbar').evaluate(node => node.style.right)).toBe('');
});

test('Listy uses dark and compact tokens without affecting virtual alignment', async ({ page }) => {
  await label(page, 'Listy dark').check();
  await label(page, 'Listy compact').check();
  await virtual(page);

  await expect(root(page)).toHaveCSS('font-size', '12px');
  await expect(rows(page).first()).toHaveCSS('padding-top', '8px');
  await expect(rows(page).first()).toHaveCSS('padding-left', '8px');
  await expect(root(page)).toHaveCSS('color', 'rgba(255, 255, 255, 0.85)');
  await scrollItem(page, 'row-012');
  await expect.poll(async () => Math.abs((await edges(record(page, 'row-012').locator('..'))).top
    - (await edges(holder(page))).top)).toBeLessThan(1.1);
});

test('Listy remains within a narrow viewport and honors reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await groups(page);
  await virtual(page);

  await expect(rows(page).first()).toHaveCSS('transition-duration', '0s');
  expect((await root(page).boundingBox())!.width).toBeLessThanOrEqual(312);
  await expect(root(page).getByRole('link').first()).toBeVisible();
});

test('Listy unmount cancels wheel, drag and scrollbar resources and clears refs', async ({ page }) => {
  await page.clock.install();
  await virtual(page);
  await holder(page).dispatchEvent('wheel', { deltaY: 200, deltaX: 0 });
  await label(page, 'Mount Listy').uncheck();
  await expect(label(page, 'Listy refs')).toHaveText('none:none');
  await page.clock.runFor(3500);
  await label(page, 'Mount Listy').check();

  await expect(label(page, 'Listy refs')).toHaveText('scrollTo:DIV');
  await expect.poll(() => top(holder(page))).toBe(0);
  await expect(rows(page).first().locator('[data-record]')).toHaveAttribute('data-source-index', '0');
});
