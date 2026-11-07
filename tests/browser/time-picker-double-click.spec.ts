import type { Page } from '@playwright/test';
import { test, expect } from './test';

type UnitPointerEvent = { type: string; tagName: string; value: string | null; };

async function observeColumn(page: Page) {
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 100));
  await page.evaluate(() => {
    const events: UnitPointerEvent[] = [];
    (window as typeof window & { unitPointerEvents: UnitPointerEvent[] }).unitPointerEvents = events;
    for (const type of ['pointerdown', 'pointerup', 'click', 'dblclick']) {
      document.addEventListener(type, event => {
        const target = event.target as Element;
        if (!target.closest('[data-type="hour"]')) return;
        events.push({ type, tagName: target.tagName,
          value: target.closest('li[data-value]')?.getAttribute('data-value') ?? null });
      }, { capture: true });
    }
  });
}

async function doubleClickWhileScrolling(page: Page, selected: number, next: number) {
  await page.clock.runFor(500);
  const column = page.getByRole('dialog').locator('ul[data-type="hour"]');
  expect(await column.evaluate((node, selected) => {
    const first = node.querySelector<HTMLElement>('li')!;
    const item = node.querySelector<HTMLElement>(`[data-value="${selected}"]`)!;
    return Math.abs(node.scrollTop - (item.offsetTop - first.offsetTop));
  }, selected)).toBeLessThanOrEqual(1);
  const button = column.getByRole('button', { name: `hour ${next}`, exact: true });
  const box = (await button.boundingBox())!;
  const point = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  await page.mouse.click(point.x, point.y);
  await page.clock.runFor(16);
  await page.mouse.down({ clickCount: 2 });
  // Между down/up второго клика колонка подставляет разные ячейки под указатель.
  await page.clock.runFor(64);
  await page.mouse.up({ clickCount: 2 });
  await page.clock.runFor(100);

  const last = await page.evaluate(() =>
    (window as typeof window & { unitPointerEvents: UnitPointerEvent[] }).unitPointerEvents.at(-1)
  );
  expect(last).toEqual({ type: 'dblclick', tagName: 'UL', value: null });
}

for (const custom of [false, true]) {
  test(`TimePicker confirms its first unit when scrolling retargets double click, custom=${custom}`,
    async ({ page }) => {
      await page.clock.install({ time: new Date('2024-09-15T12:34:56.789Z') });
      await page.goto('/?fixture=time-picker');
      if (custom) await page.getByLabel('Custom time cells', { exact: true }).check();
      await page.getByLabel('Meeting time', { exact: true }).click();
      await observeColumn(page);

      await doubleClickWhileScrolling(page, 10, 13);

      await expect(page.getByRole('dialog')).toHaveCount(0);
      await expect(page.getByLabel('Time value', { exact: true }))
        .toHaveText('2024-09-15T13:23:44.500Z');
      const events = await page.getByLabel('Time events', { exact: true }).textContent();
      expect(events?.match(/calendar:/g)).toHaveLength(1);
      expect(events).not.toContain('ok:');
    });
}

test('TimeRangePicker confirms each first unit when the second click lands on its column',
  async ({ page }) => {
    await page.clock.install({ time: new Date('2024-09-15T12:34:56.789Z') });
    await page.goto('/?fixture=time-range-picker');
    await page.getByLabel('Interval start', { exact: true }).click();
    await observeColumn(page);

    await doubleClickWhileScrolling(page, 10, 13);

    await expect(page.getByLabel('Interval end', { exact: true })).toBeFocused();
    await expect(page.getByLabel('Interval value', { exact: true }))
      .toHaveText('2024-09-15T10:23:44.567Z,2024-09-15T17:45:56.789Z');

    await doubleClickWhileScrolling(page, 17, 20);

    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByLabel('Interval value', { exact: true }))
      .toHaveText('2024-09-15T13:23:44.500Z,2024-09-15T20:45:56.700Z');
    const events = await page.getByLabel('Interval events', { exact: true }).textContent();
    expect(events?.match(/calendar:/g)).toHaveLength(2);
    expect(events).not.toContain('ok:');
  });

test('TimePicker does not confirm a previous unit on a new double click in column whitespace',
  async ({ page }) => {
    await page.clock.install({ time: new Date('2024-09-15T12:34:56.789Z') });
    await page.goto('/?fixture=time-picker');
    await page.getByLabel('Meeting time', { exact: true }).click();
    await observeColumn(page);
    await page.clock.runFor(500);
    await page.getByRole('dialog').getByRole('button', { name: 'hour 13', exact: true }).click();
    await page.clock.runFor(500);
    const column = page.getByRole('dialog').locator('ul[data-type="hour"]');
    await column.evaluate(node => { node.scrollTop = node.scrollHeight; });
    const point = await column.evaluate(node => {
      const box = node.getBoundingClientRect();
      const point = { x: box.x + box.width / 2, y: box.bottom - 10 };
      if (node.ownerDocument.elementFromPoint(point.x, point.y) !== node) {
        throw new Error('Expected column whitespace');
      }
      return point;
    });

    await page.mouse.dblclick(point.x, point.y);
    await page.clock.runFor(500);

    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByLabel('Time value', { exact: true }))
      .toHaveText('2024-09-15T10:23:44.567Z');
    const events = await page.getByLabel('Time events', { exact: true }).textContent();
    expect(events?.match(/calendar:/g)).toHaveLength(1);
    expect(events).not.toContain('change:');
  });
