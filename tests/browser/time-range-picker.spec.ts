import type { Page } from '@playwright/test';
import { test, expect } from './test';

const control = (page: Page, name: string) => page.getByLabel(name, { exact: true });
const button = (page: Page, name: string) => page.getByRole('button', { name, exact: true });
const start = (page: Page) => control(page, 'Interval start');
const end = (page: Page) => control(page, 'Interval end');
const owner = (page: Page) => control(page, 'Interval value');
const events = (page: Page) => control(page, 'Interval events');
const popup = (page: Page) => page.getByRole('dialog');
const unit = (page: Page, name: string) => popup(page)
  .getByRole('button', { name, exact: true });
const initial = '2024-09-15T10:23:44.567Z,2024-09-15T17:45:56.789Z';

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2024-09-15T12:34:56.789Z') });
  await page.goto('/?fixture=time-range-picker');
  await expect(start(page)).toHaveValue('10:23:44');
  await expect(end(page)).toHaveValue('17:45:56');
});

test('TimeRangePicker opens one time-only panel with separate labels and source range config', async ({ page }) => {
  const root = page.locator('.fixture-time-range');
  await expect(start(page)).toHaveAttribute('placeholder', 'Время начала');
  await expect(end(page)).toHaveAttribute('placeholder', 'Время окончания');
  await expect(control(page, 'Interval refs')).toHaveText('DIV,INPUT,INPUT');
  await expect(root).toHaveClass(/ant-picker-underlined/);
  await expect(root).toHaveClass(/range-context/);
  await expect(root).not.toHaveClass(/unused-time-context/);
  await expect(root).toHaveCSS('outline-offset', '4px');
  await start(page).click();

  await expect(popup(page)).toBeVisible();
  await expect(popup(page).locator('.ant-picker-time-panel-column')).toHaveCount(3);
  await expect(popup(page).getByRole('grid')).toHaveCount(0);
  await expect(unit(page, 'hour 10')).toHaveAttribute('aria-pressed', 'true');
  await expect(unit(page, 'Сейчас')).toHaveCount(0);
  await expect(owner(page)).toHaveText(initial);
  await expect(events(page)).toHaveText('open:true');
});

test('TimeRangePicker confirms each field and publishes the pair after the second OK', async ({ page }) => {
  await start(page).click();
  await unit(page, 'hour 13').click();
  await unit(page, 'ОК').click();

  await expect(end(page)).toBeFocused();
  await expect(popup(page)).toBeVisible();
  await expect(owner(page)).toHaveText(initial);
  await expect(events(page)).toHaveText(
    'open:true|calendar:start:2024-09-15T13:23:44.500Z,2024-09-15T17:45:56.789Z:["13:23:44","17:45:56"]|ok:2024-09-15T13:23:44.500Z,2024-09-15T17:45:56.789Z'
  );
  await unit(page, 'hour 19').click();
  await unit(page, 'ОК').click();

  await expect(owner(page)).toHaveText('2024-09-15T13:23:44.500Z,2024-09-15T19:45:56.700Z');
  await expect(popup(page)).toHaveCount(0);
  await expect(events(page)).toContainText(
    'ok:2024-09-15T13:23:44.500Z,2024-09-15T19:45:56.700Z|change:2024-09-15T13:23:44.500Z,2024-09-15T19:45:56.700Z:["13:23:44","19:45:56"]|open:false'
  );
});

test('TimeRangePicker double click confirms each first unit without footer onOk', async ({ page }) => {
  await start(page).click();

  for (const [selected, next] of [[10, 13], [17, 19]]) {
    const column = popup(page).locator('[data-type="hour"]');
    await expect.poll(() => column.evaluate((node, selected) => {
      const first = node.querySelector<HTMLElement>('li')!;
      const item = node.querySelector<HTMLElement>(`[data-value="${selected}"]`)!;
      return Math.abs(node.scrollTop - (item.offsetTop - first.offsetTop));
    }, selected)).toBeLessThanOrEqual(1);
    await unit(page, `hour ${next}`).dblclick({ delay: 80 });

    if (selected === 10) {
      await expect(end(page)).toBeFocused();
      await expect(owner(page)).toHaveText(initial);
    }
  }

  await expect(owner(page)).toHaveText('2024-09-15T13:23:44.500Z,2024-09-15T19:45:56.700Z');
  await expect(popup(page)).toHaveCount(0);
  expect((await events(page).textContent())?.match(/calendar:/g)).toHaveLength(2);
  await expect(events(page)).not.toContainText('ok:');
});

test('TimeRangePicker locks an unconfirmed field and cancels its draft on Escape', async ({ page }) => {
  await start(page).click();
  await unit(page, 'hour 13').click();
  await end(page).click();

  await expect(start(page)).toBeFocused();
  await start(page).press('Escape');

  await expect(popup(page)).toHaveCount(0);
  await expect(start(page)).toHaveValue('10:23:44');
  await expect(end(page)).toHaveValue('17:45:56');
  await expect(owner(page)).toHaveText(initial);
  await expect(events(page)).not.toContainText('change:');
});

test('TimeRangePicker sorts only on final submit while onOk and calendar retain field positions', async ({ page }) => {
  await start(page).click();
  await unit(page, 'hour 19').click();
  await unit(page, 'ОК').click();
  await unit(page, 'ОК').click();

  await expect(owner(page)).toHaveText('2024-09-15T17:45:56.789Z,2024-09-15T19:23:44.500Z');
  await expect(events(page)).toContainText(
    'ok:2024-09-15T19:23:44.500Z,2024-09-15T17:45:56.789Z|calendar:start:2024-09-15T17:45:56.789Z,2024-09-15T19:23:44.500Z:["17:45:56","19:23:44"]|change:'
  );
});

test('TimeRangePicker clears both values and emits null change values and texts', async ({ page }) => {
  await page.locator('.fixture-time-range').hover();
  await page.locator('.fixture-time-range').getByRole('button', { name: 'Очистить' }).click();

  await expect(owner(page)).toHaveText('null');
  await expect(start(page)).toHaveValue('');
  await expect(end(page)).toHaveValue('');
  await expect(events(page)).toHaveText('calendar:start:null,null:["",""]|change:null:null|clear');
});

test('TimeRangePicker empty panels stay unselected and use separate defaultOpenValue candidates', async ({ page }) => {
  await control(page, 'Default interval open values').check();
  await button(page, 'Start empty interval').click();
  await start(page).click();

  await expect(start(page)).toHaveValue('');
  await expect(unit(page, 'hour 8')).toHaveAttribute('aria-pressed', 'true');
  await unit(page, 'ОК').click();

  await expect(start(page)).toHaveValue('08:09:10');
  await expect(end(page)).toHaveValue('');
  await expect(unit(page, 'hour 18')).toHaveAttribute('aria-pressed', 'true');
  await expect(owner(page)).toHaveText('null');
  await unit(page, 'ОК').click();

  await expect(owner(page)).toHaveText('2024-02-29T08:09:10.123Z,2024-03-01T18:19:20.456Z');
});

test('TimeRangePicker rejects controlled owner changes while retaining its draft in an owned open popup', async ({ page }) => {
  await control(page, 'Accept interval changes').uncheck();
  await control(page, 'Controlled interval popup').check();
  await control(page, 'Accept interval popup changes').uncheck();
  await button(page, 'Toggle owned interval popup').click();
  await start(page).focus();
  await unit(page, 'hour 13').click();
  await unit(page, 'ОК').click();
  await unit(page, 'hour 19').click();
  await unit(page, 'ОК').click();

  await expect(owner(page)).toHaveText(initial);
  await expect(start(page)).toHaveValue('13:23:44');
  await expect(end(page)).toHaveValue('19:45:56');
  await expect(popup(page)).toBeVisible();
  await button(page, 'Toggle owned interval popup').click();

  await expect(start(page)).toHaveValue('10:23:44');
  await expect(end(page)).toHaveValue('17:45:56');
  await expect(popup(page)).toHaveCount(0);
});

test('TimeRangePicker Enter confirms each typed field without calling the footer onOk', async ({ page }) => {
  await start(page).click();
  await start(page).fill('08:09:10');
  await start(page).press('Enter');

  await expect(end(page)).toBeFocused();
  await end(page).fill('18:19:20');
  await end(page).press('Enter');

  await expect(owner(page)).toHaveText('2024-09-15T08:09:10.000Z,2024-09-15T18:19:20.000Z');
  await expect(popup(page)).toHaveCount(0);
  await expect(events(page)).not.toContainText('ok:');
});

test('TimeRangePicker order false preserves reversed field positions', async ({ page }) => {
  await control(page, 'Order interval').uncheck();
  await start(page).click();
  await start(page).fill('19:20:30');
  await start(page).press('Enter');
  await end(page).fill('08:09:10');
  await end(page).press('Enter');

  await expect(owner(page)).toHaveText('2024-09-15T19:20:30.000Z,2024-09-15T08:09:10.000Z');
  await expect(start(page)).toHaveValue('19:20:30');
  await expect(end(page)).toHaveValue('08:09:10');
});

test('TimeRangePicker closes outside with a calendar reset rather than publishing unconfirmed fields', async ({ page }) => {
  await start(page).click();
  await unit(page, 'hour 13').click();
  await button(page, 'Outside interval').click();

  await expect(popup(page)).toHaveCount(0);
  await expect(owner(page)).toHaveText(initial);
  await expect(start(page)).toHaveValue('10:23:44');
  await expect(events(page)).toContainText(
    'open:false|calendar:start:2024-09-15T10:23:44.567Z,2024-09-15T17:45:56.789Z'
  );
  await expect(events(page)).not.toContainText('change:');
});

test('TimeRangePicker without confirmation still completes both fields through Tab', async ({ page }) => {
  await control(page, 'Confirm interval').uncheck();
  await start(page).click();
  await start(page).fill('08:09:10');

  await expect(owner(page)).toHaveText(initial);
  await start(page).press('Tab');
  await expect(end(page)).toBeFocused();
  await end(page).fill('18:19:20');
  await end(page).press('Tab');

  await expect(owner(page)).toHaveText('2024-09-15T08:09:10.000Z,2024-09-15T18:19:20.000Z');
  await expect(popup(page)).toHaveCount(0);
  await expect(events(page)).not.toContainText('ok:');
});

test('TimeRangePicker without confirmation advances an unfinished panel interaction on outside close', async ({ page }) => {
  await control(page, 'Confirm interval').uncheck();
  await start(page).click();
  await unit(page, 'hour 13').click();
  await button(page, 'Outside interval').click();

  await expect(end(page)).toBeFocused();
  await expect(popup(page)).toBeVisible();
  await expect(owner(page)).toHaveText(initial);
  await button(page, 'Outside interval').click();

  await expect(popup(page)).toHaveCount(0);
  await expect(owner(page)).toHaveText('2024-09-15T13:23:44.500Z,2024-09-15T17:45:56.789Z');
});

test('TimeRangePicker keeps an empty panel unselected and uses midnight for newly selected units', async ({ page }) => {
  await button(page, 'Start empty interval').click();
  await start(page).click();

  await expect(popup(page).locator('.ant-picker-time-panel-cell-selected')).toHaveCount(0);
  await expect(unit(page, 'ОК')).toBeDisabled();
  await unit(page, 'hour 8').click();
  await unit(page, 'ОК').click();
  await unit(page, 'hour 18').click();
  await unit(page, 'ОК').click();

  await expect(owner(page)).toHaveText('2024-09-15T08:00:00.000Z,2024-09-15T18:00:00.000Z');
});

test('TimeRangePicker allowEmpty accepts an empty start through Tab but never enables an empty footer', async ({ page }) => {
  await control(page, 'Allow empty interval start').check();
  await button(page, 'Start empty interval').click();
  await end(page).click();
  await end(page).fill('18:19:20');
  await end(page).press('Enter');

  await expect(start(page)).toBeFocused();
  await expect(unit(page, 'ОК')).toBeDisabled();
  await start(page).press('Tab');

  await expect(popup(page)).toHaveCount(0);
  await expect(owner(page)).toHaveText('null,2024-09-15T18:19:20.000Z');
  await expect(events(page)).toContainText(':["","18:19:20"]');
});

test('TimeRangePicker preserves a disabled boundary on clear and completes its remaining field', async ({ page }) => {
  await control(page, 'Lock interval start').check();
  await page.locator('.fixture-time-range').hover();
  await page.locator('.fixture-time-range').getByRole('button', { name: 'Очистить' }).click();

  await expect(owner(page)).toHaveText('2024-09-15T10:23:44.567Z,null');
  await expect(start(page)).toBeDisabled();
  await end(page).click();
  await end(page).fill('18:19:20');
  await end(page).press('Enter');

  await expect(owner(page)).toHaveText('2024-09-15T10:23:44.567Z,2024-09-15T18:19:20.000Z');
  await expect(popup(page)).toHaveCount(0);
});

test('TimeRangePicker rejects a reversed interval against its locked boundary without sorting', async ({ page }) => {
  await control(page, 'Lock interval start').check();
  await end(page).click();
  await end(page).fill('08:09:10');
  await end(page).press('Enter');

  await expect(owner(page)).toHaveText(initial);
  await expect(popup(page)).toHaveCount(0);
  await expect(end(page)).toHaveValue('17:45:56');
  await expect(events(page)).not.toContainText('change:');
});

test('TimeRangePicker supplies the selected start to dependent end column restrictions', async ({ page }) => {
  await control(page, 'Restrict interval from start').check();
  await start(page).click();
  await unit(page, 'hour 13').click();
  await unit(page, 'ОК').click();
  await unit(page, 'hour 13').click();

  await expect(unit(page, 'minute 30')).toBeDisabled();
  await expect(unit(page, 'minute 45')).toBeEnabled();
  await unit(page, 'ОК').click();

  await expect(owner(page)).toHaveText('2024-09-15T13:23:44.500Z,2024-09-15T13:45:56.700Z');
});

test('TimeRangePicker revalidates a typed end with from at final submit', async ({ page }) => {
  await control(page, 'Restrict interval from start').check();
  await start(page).click();
  await start(page).fill('13:00:00');
  await start(page).press('Enter');
  await end(page).fill('13:30:00');

  await expect(unit(page, 'ОК')).toBeEnabled();
  await end(page).press('Enter');

  await expect(owner(page)).toHaveText(initial);
  await expect(popup(page)).toHaveCount(0);
  await expect(events(page)).not.toContainText('change:');
});

test('TimeRangePicker formats, readonly and invalid input preserve source input semantics', async ({ page }) => {
  await control(page, 'Interval format').selectOption('array');
  await start(page).click();
  await start(page).fill('7:8');
  await start(page).press('Enter');
  await end(page).fill('18:19');
  await end(page).press('Enter');

  await expect(start(page)).toHaveValue('07:08');
  await expect(end(page)).toHaveValue('18:19');
  await control(page, 'Interval format').selectOption('callback');

  await expect(start(page)).toHaveValue('At 07:08:00');
  await expect(start(page)).toHaveAttribute('readonly');
  await expect(end(page)).toHaveAttribute('readonly');
  await control(page, 'Interval format').selectOption('default');
  await start(page).click();
  await start(page).fill('invalid');
  await button(page, 'Outside interval').click();

  await expect(start(page)).toHaveValue('07:08:00');
  await control(page, 'Preserve invalid interval').check();
  await start(page).click();
  await start(page).fill('invalid');
  await button(page, 'Outside interval').click();

  await expect(start(page)).toHaveValue('invalid');
  await expect(start(page)).toHaveAttribute('aria-invalid', 'true');
});

test('TimeRangePicker localizes 12-hour labels and keeps full precision with millisecondStep one', async ({ page }) => {
  await control(page, 'Twelve hour interval').check();
  await control(page, 'Interval milliseconds').check();
  await control(page, 'Precise interval milliseconds').check();

  await expect(start(page)).toHaveValue('10:23:44.567 утра');
  await expect(end(page)).toHaveValue('05:45:56.789 вечера');
  await control(page, 'English locale').check();
  await end(page).click();

  await expect(unit(page, 'PM')).toHaveAttribute('aria-pressed', 'true');
  await unit(page, 'millisecond 123').click();
  await unit(page, 'OK').click();
  await unit(page, 'OK').click();

  await expect(owner(page)).toHaveText('2024-09-15T10:23:44.567Z,2024-09-15T17:45:56.123Z');
  await expect(end(page)).toHaveAttribute('placeholder', 'End time');
});

test('TimeRangePicker Escape retains unparsed text until the input blur contract restores it', async ({ page }) => {
  await start(page).click();
  await start(page).fill('invalid');
  await start(page).press('Escape');

  await expect(popup(page)).toHaveCount(0);
  await expect(start(page)).toBeFocused();
  await expect(start(page)).toHaveValue('invalid');
  await expect(start(page)).toHaveAttribute('aria-invalid', 'true');
  await button(page, 'Outside interval').click();

  await expect(start(page)).toHaveValue('10:23:44');
  await expect(start(page)).not.toHaveAttribute('aria-invalid', 'true');
  await expect(events(page)).not.toContainText('change:');
});

test('TimeRangePicker previews disabled units without callbacks and supports disabling preview', async ({ page }) => {
  await control(page, 'Restricted interval units').check();
  await start(page).click();
  await popup(page).locator('[data-type="hour"] li[data-value="11"]').hover();

  await expect(start(page)).toHaveValue('11:23:44');
  await expect(unit(page, 'hour 11')).toBeDisabled();
  await expect(events(page)).toHaveText('open:true');
  await page.mouse.move(1, 1);
  await expect(start(page)).toHaveValue('10:23:44');
  await start(page).press('Escape');
  await control(page, 'Preview interval hover').uncheck();
  await start(page).click();
  await unit(page, 'hour 13').hover();

  await expect(start(page)).toHaveValue('10:23:44');
});

test('TimeRangePicker presets submit immediately and snippets keep mode and range info', async ({ page }) => {
  await control(page, 'Interval presets').check();
  await control(page, 'Custom interval panel').check();
  await control(page, 'Custom interval cells').check();
  await control(page, 'Extra interval footer').check();
  await start(page).click();

  await expect(control(page, 'Interval panel renderer')).toBeVisible();
  await expect(popup(page)).toContainText('Interval footer time');
  await expect(popup(page).locator('.custom-interval-cell').first())
    .toHaveAttribute('data-range', 'start');
  await unit(page, 'ОК').click();
  await expect(popup(page).locator('.custom-interval-cell').first())
    .toHaveAttribute('data-range', 'end');
  await unit(page, 'Afternoon interval').click();

  await expect(owner(page)).toHaveText('2024-09-15T15:20:30.123Z,2024-09-15T18:40:50.789Z');
  await expect(popup(page)).toHaveCount(0);
});

test('TimeRangePicker Now confirms one field and applies current time restrictions without onOk', async ({ page }) => {
  await page.clock.setSystemTime(new Date('2024-09-15T12:34:00.700Z'));
  await page.clock.pauseAt(new Date('2024-09-15T12:35:00.700Z'));
  await control(page, 'Show interval Now').check();
  await start(page).click();
  await unit(page, 'Сейчас').click();
  await page.clock.runFor(20);

  await expect(end(page)).toBeFocused();
  await expect(start(page)).toHaveValue('12:35:00');
  await expect(owner(page)).toHaveText(initial);
  await unit(page, 'Сейчас').click();

  await expect(owner(page)).toHaveText('2024-09-15T12:35:00.700Z,2024-09-15T12:35:00.700Z');
  await expect(popup(page)).toHaveCount(0);
  await expect(events(page)).not.toContainText('ok:');
});

test('TimeRangePicker resolves a single semantic layer and supports nested range config replacement', async ({ page }) => {
  const root = page.locator('.fixture-time-range');
  await control(page, 'Styled interval').check();
  await control(page, 'Custom interval icons').check();
  await control(page, 'Dark interval').check();
  await control(page, 'Compact interval').check();
  await control(page, 'Right to left').check();

  await expect(root).toHaveClass(/context-interval-medium context-range-value/);
  await expect(root).toHaveClass(/local-interval-medium variant-raw/);
  await expect(root).toHaveCSS('outline-offset', '8px');
  await expect(root.locator('.local-interval-prefix')).toHaveText('At');
  await expect(root.locator('.local-interval-suffix')).toHaveText('T');
  await end(page).click();

  await expect(popup(page)).toHaveClass(/local-interval-popup/);
  await expect(popup(page)).toHaveCSS('outline-offset', '6px');
  await expect(popup(page).locator('.local-interval-content')).toHaveCSS('outline-offset', '6px');
  await end(page).press('Escape');
  await control(page, 'Styled interval').uncheck();
  await control(page, 'Replace range config').check();

  await expect(root).toHaveClass(/nested-range-context/);
  await expect(root).toHaveClass(/ant-picker-outlined/);
  await expect(root).toHaveCSS('outline-offset', '2px');
});

test('TimeRangePicker sizes, refs and native FormData preserve two display strings', async ({ page }) => {
  await control(page, 'Interval size').selectOption('small');
  await expect(page.locator('.fixture-time-range')).toHaveCSS('height', '24px');
  await control(page, 'Interval size').selectOption('large');
  await expect(page.locator('.fixture-time-range')).toHaveCSS('height', '40px');
  await button(page, 'Focus interval ref').click();

  await expect(end(page)).toBeFocused();
  expect(await end(page).evaluate(element => [
    (element as HTMLInputElement).selectionStart, (element as HTMLInputElement).selectionEnd
  ])).toEqual([0, 8]);
  await end(page).press('Escape');
  await button(page, 'Read interval FormData').click();

  await expect(control(page, 'Interval data'))
    .toHaveText('[["interval","10:23:44"],["interval","17:45:56"]]');
  await button(page, 'Focus numeric interval ref').click();

  await expect(end(page)).toBeFocused();
  await end(page).press('Escape');
  await control(page, 'Disable all components').check();

  await expect(start(page)).toBeDisabled();
  await expect(end(page)).toBeDisabled();
});

test('TimeRangePicker keeps uncontrolled defaults initial-only and clears controlled state on release', async ({ page }) => {
  await control(page, 'Controlled interval value').uncheck();

  await expect(start(page)).toHaveValue('');
  await expect(end(page)).toHaveValue('');
  await button(page, 'Start empty interval').click();
  await button(page, 'Change interval default').click();

  await expect(start(page)).toHaveValue('10:23:44');
  await start(page).click();
  await unit(page, 'hour 13').click();
  await unit(page, 'ОК').click();
  await unit(page, 'ОК').click();

  await expect(start(page)).toHaveValue('13:23:44');
  await control(page, 'Controlled interval value').check();
  await button(page, 'Set external interval').click();

  await expect(start(page)).toHaveValue('18:45:56');
  await expect(end(page)).toHaveValue('19:20:30');
});

test('TimeRangePicker Form validates null, submits Dayjs pairs and resets both fields', async ({ page }) => {
  await button(page, 'Submit interval form').click();

  await expect(page.getByRole('alert')).toHaveText('Choose a time interval');
  const form = page.locator('.interval-form');
  const first = form.getByRole('combobox').nth(0);
  const last = form.getByRole('combobox').nth(1);
  await expect(first).toBeFocused();
  await first.fill('08:09:10');
  await first.press('Enter');
  await last.fill('18:19:20');
  await last.press('Enter');
  await button(page, 'Submit interval form').click();

  await expect(control(page, 'Submitted interval'))
    .toHaveText('2024-09-15T08:09:10.000Z,2024-09-15T18:19:20.000Z');
  await button(page, 'Reset interval form').click();

  await expect(first).toHaveValue('');
  await expect(last).toHaveValue('');
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('TimeRangePicker scroll selection remains a draft and cancels timers and refs on unmount', async ({ page }) => {
  await page.clock.pauseAt(new Date('2024-09-15T12:36:00.000Z'));
  await control(page, 'Change interval on scroll').check();
  await start(page).click();
  const column = popup(page).locator('[data-type="hour"]');
  await page.clock.runFor(1000);
  await column.evaluate(element => new Promise<void>(resolve => {
    element.addEventListener('scroll', () => resolve(), { once: true });
    const first = element.querySelector('li')!;
    const target = element.querySelector<HTMLElement>('[data-value="13"]')!;
    element.scrollTop = target.offsetTop - first.offsetTop;
  }));
  await page.clock.runFor(301);

  await expect(unit(page, 'hour 13')).toHaveAttribute('aria-pressed', 'true');
  await expect(owner(page)).toHaveText(initial);
  await page.clock.runFor(1000);
  await column.evaluate(element => {
    element.scrollTop = 0;
    element.dispatchEvent(new Event('scroll'));
  });
  await control(page, 'Mount interval').evaluate(element => {
    (element as HTMLInputElement).click();
  });
  await page.clock.runFor(1000);

  await expect(popup(page)).toHaveCount(0);
  await expect(control(page, 'Interval refs')).toHaveText('none,none,none');
  await expect(owner(page)).toHaveText(initial);
});

test('TimeRangePicker controlled pickerValue supplies empty panel templates and source callback modes', async ({ page }) => {
  await control(page, 'Controlled interval panel').check();
  await button(page, 'Start empty interval').click();
  await start(page).click();
  await unit(page, 'hour 9').click();

  await expect(start(page)).toHaveValue('09:07:08');
  await expect(owner(page)).toHaveText('null');
  await expect(control(page, 'Interval panels')).toContainText(
    'panel:start:2024-09-15T09:07:08.100Z,2024-09-15T18:19:20.456Z:["time","time"]'
  );
});

test('TimeRangePicker cancels a pending strong focus transition when it unmounts', async ({ page }) => {
  await page.clock.pauseAt(new Date('2024-09-15T12:36:00.000Z'));
  await start(page).click();
  await unit(page, 'hour 13').click();
  await unit(page, 'ОК').click();
  await control(page, 'Mount interval').evaluate(element => {
    (element as HTMLInputElement).click();
  });
  await page.clock.runFor(1000);

  await expect(popup(page)).toHaveCount(0);
  await expect(control(page, 'Interval refs')).toHaveText('none,none,none');
  await expect(owner(page)).toHaveText(initial);
  expect((await events(page).textContent())?.match(/open:true/g)).toHaveLength(1);
});

test('TimeRangePicker resets defaultPickerValue on each opening without filling input values', async ({ page }) => {
  await control(page, 'Default interval panel').check();
  await button(page, 'Start empty interval').click();
  await start(page).click();

  await expect(start(page)).toHaveValue('');
  await expect(popup(page).locator('.ant-picker-time-panel-cell-selected')).toHaveCount(0);
  await unit(page, 'hour 9').click();
  await start(page).press('Escape');
  await start(page).click();

  await expect(start(page)).toHaveValue('');
  await expect(control(page, 'Interval panels')).toContainText(
    'reset:start:2024-09-15T06:07:08.123Z,2024-09-15T18:19:20.456Z:["time","time"]'
  );
});

test('TimeRangePicker forwards native input and panel focus events with the active range', async ({ page }) => {
  await end(page).click();
  await end(page).press('ArrowDown');

  await expect(unit(page, 'hour 17')).toBeFocused();
  await expect(control(page, 'Interval focus')).toContainText('focus:end:INPUT');
  await expect(control(page, 'Interval focus')).toContainText('focus:end:DIV');
  await unit(page, 'hour 17').press('Escape');

  await expect(end(page)).toBeFocused();
  await expect(popup(page)).toHaveCount(0);
  await expect(control(page, 'Interval focus')).toContainText('blur:end:DIV');
});

for (const rtl of [false, true]) {
  test(`TimeRangePicker positions its narrow panel and arrow below the active end in ${rtl ? 'RTL' : 'LTR'}`, async ({ page }) => {
    if (rtl) await control(page, 'Right to left').check();
    await end(page).click();
    const container = popup(page).locator('.ant-picker-panel-container');
    await expect.poll(() => container.evaluate(element =>
      parseFloat(getComputedStyle(element).marginInlineStart))).toBeGreaterThan(0);
    await expect.poll(() => popup(page).locator('.ant-picker-range-arrow').evaluate(element =>
      element.getAnimations().every(animation => animation.playState === 'finished'))).toBe(true);

    const root = await page.locator('.fixture-time-range').boundingBox();
    const surface = await popup(page).boundingBox();
    const panel = await container.boundingBox();
    const arrow = await popup(page).locator('.ant-picker-range-arrow').boundingBox();
    expect(surface!.width).toBeGreaterThanOrEqual(root!.width - 1);
    expect(arrow!.x + arrow!.width / 2).toBeGreaterThan(panel!.x);
    expect(arrow!.x + arrow!.width / 2).toBeLessThan(panel!.x + panel!.width);
    const hour = await popup(page).locator('[data-type="hour"]').boundingBox();
    const minute = await popup(page).locator('[data-type="minute"]').boundingBox();
    expect(hour!.x).toBeLessThan(minute!.x);
  });
}

test('TimeRangePicker supports a constrained RTL viewport with every time column visible', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await control(page, 'Fit interval width').check();
  await control(page, 'Right to left').check();
  await control(page, 'Twelve hour interval').check();
  await control(page, 'Interval milliseconds').check();
  await end(page).click();

  await expect(popup(page).locator('.ant-picker-time-panel-column')).toHaveCount(5);
  const root = await page.locator('.fixture-time-range').boundingBox();
  const surface = await popup(page).boundingBox();
  expect(root!.x + root!.width).toBeLessThanOrEqual(320);
  expect(surface!.x).toBeGreaterThanOrEqual(0);
  expect(surface!.x + surface!.width).toBeLessThanOrEqual(320);
  await unit(page, 'ОК').click();
  await expect(start(page)).toBeFocused();
});

for (const timezoneId of ['America/New_York', 'Pacific/Kiritimati']) {
  test.describe(`TimeRangePicker in ${timezoneId}`, () => {
    test.use({ timezoneId });
    test('preserves both UTC dates and milliseconds through time-column edits', async ({ page }) => {
      await control(page, 'Precise interval milliseconds').check();
      await start(page).click();
      await unit(page, 'hour 13').click();
      await unit(page, 'ОК').click();
      await unit(page, 'hour 19').click();
      await unit(page, 'ОК').click();

      await expect(owner(page)).toHaveText('2024-09-15T13:23:44.567Z,2024-09-15T19:45:56.789Z');
    });
  });
}
