import type { Page } from '@playwright/test';
import { test, expect } from './test';

const control = (page: Page, name: string) => page.getByLabel(name, { exact: true });
const button = (page: Page, name: string) => page.getByRole('button', { name, exact: true });
const input = (page: Page) => control(page, 'Meeting time');
const owner = (page: Page) => control(page, 'Time value');
const events = (page: Page) => control(page, 'Time events');
const popup = (page: Page) => page.getByRole('dialog');
const unit = (page: Page, name: string) => popup(page)
  .getByRole('button', { name, exact: true });

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2024-09-15T12:34:56.789Z') });
  await page.goto('/?fixture=time-picker');
  await expect(input(page)).toHaveValue('10:23:44');
});

test('TimePicker renders the source clock columns and opens without changing the value', async ({ page }) => {
  await expect(control(page, 'Time ref')).toHaveText('DIV');
  await expect(input(page)).toHaveAttribute('placeholder', 'Выберите время');
  await input(page).click();

  await expect(popup(page)).toBeVisible();
  await expect(popup(page).locator('.ant-picker-time-panel-column')).toHaveCount(3);
  await expect(unit(page, 'hour 10')).toHaveAttribute('aria-pressed', 'true');
  await expect(unit(page, 'minute 23')).toHaveAttribute('aria-pressed', 'true');
  await expect(unit(page, 'second 44')).toHaveAttribute('aria-pressed', 'true');
  await expect(events(page)).toHaveText('open:true');
  await expect(owner(page)).toHaveText('2024-09-15T10:23:44.567Z');
});

test('TimePicker retains a draft until OK and preserves the source callback order and UTC date', async ({ page }) => {
  await input(page).click();
  await unit(page, 'hour 13').click();
  await page.mouse.move(1, 1);

  await expect(input(page)).toHaveValue('13:23:44');
  await expect(owner(page)).toHaveText('2024-09-15T10:23:44.567Z');
  await expect(events(page)).toHaveText(
    'open:true|calendar:2024-09-15T13:23:44.500Z:13:23:44:{}|select:2024-09-15T13:23:44.500Z'
  );
  await unit(page, 'ОК').click();

  await expect(popup(page)).toHaveCount(0);
  await expect(owner(page)).toHaveText('2024-09-15T13:23:44.500Z');
  await expect(control(page, 'Time mode')).toHaveText('UTC');
  await expect(events(page)).toHaveText(
    'open:true|calendar:2024-09-15T13:23:44.500Z:13:23:44:{}|select:2024-09-15T13:23:44.500Z|ok:2024-09-15T13:23:44.500Z|change:2024-09-15T13:23:44.500Z:"13:23:44"|open:false'
  );
});

test('TimePicker cancels a modified confirmed panel on outside close and emits the calendar reset', async ({ page }) => {
  await input(page).click();
  await unit(page, 'hour 13').click();
  await button(page, 'Clear time events').click();

  await expect(popup(page)).toHaveCount(0);
  await expect(owner(page)).toHaveText('2024-09-15T10:23:44.567Z');
  await expect(input(page)).toHaveValue('10:23:44');
  await expect(events(page)).not.toContainText('change:');
});

test('TimePicker without confirmation submits on outside close rather than on a column click', async ({ page }) => {
  await control(page, 'Confirm time').uncheck();
  await input(page).click();
  await unit(page, 'hour 13').click();

  await expect(owner(page)).toHaveText('2024-09-15T10:23:44.567Z');
  await expect(unit(page, 'ОК')).toHaveCount(0);
  await button(page, 'Read time FormData').click();

  await expect(owner(page)).toHaveText('2024-09-15T13:23:44.500Z');
  await expect(popup(page)).toHaveCount(0);
  await expect(events(page)).not.toContainText('ok:');
});

test('TimePicker Tab submits a valid typed value even with confirmation enabled', async ({ page }) => {
  await input(page).click();
  await input(page).fill('18:05:09');
  await input(page).press('Tab');

  await expect(owner(page)).toHaveText('2024-09-15T18:05:09.000Z');
  await expect(popup(page)).toHaveCount(0);
  await expect(events(page)).not.toContainText('ok:');
});

test('TimePicker Escape restores the owner and keeps input focus', async ({ page }) => {
  await input(page).click();
  await input(page).fill('18:05:09');
  await input(page).press('Escape');

  await expect(owner(page)).toHaveText('2024-09-15T10:23:44.567Z');
  await expect(input(page)).toHaveValue('10:23:44');
  await expect(input(page)).toBeFocused();
  await expect(popup(page)).toHaveCount(0);
});

test('TimePicker clearing emits null for both onChange arguments and empty calendar text', async ({ page }) => {
  await page.locator('.fixture-time-picker').hover();
  await page.locator('.fixture-time-picker').getByRole('button', { name: 'Очистить' }).click();

  await expect(owner(page)).toHaveText('null');
  await expect(input(page)).toHaveValue('');
  await expect(events(page)).toHaveText('calendar:null::{}|select:null|change:null:null|clear');
  await expect(input(page)).toBeFocused();
});

test('TimePicker starts empty without selecting the current time and uses midnight as its template', async ({ page }) => {
  await button(page, 'Start empty time picker').click();
  await input(page).click();

  await expect(input(page)).toHaveValue('');
  await expect(popup(page).locator('.ant-picker-time-panel-cell-selected')).toHaveCount(0);
  await expect(unit(page, 'ОК')).toBeDisabled();
  await unit(page, 'hour 1').click();
  await unit(page, 'ОК').click();

  await expect(owner(page)).toHaveText('2024-09-15T01:00:00.000Z');
  await expect(control(page, 'Time mode')).toHaveText('local');
});

test('TimePicker defaultOpenValue fills the panel but leaves the input empty until confirmation', async ({ page }) => {
  await control(page, 'Default open time').check();
  await button(page, 'Start empty time picker').click();
  await input(page).click();

  await expect(unit(page, 'hour 15')).toHaveAttribute('aria-pressed', 'true');
  await expect(input(page)).toHaveValue('');
  await expect(events(page)).toHaveText('open:true');
  await unit(page, 'ОК').click();

  await expect(owner(page)).toHaveText('2024-02-29T15:16:17.123Z');
  await expect(control(page, 'Time mode')).toHaveText('UTC');
});

test('TimePicker keyboard opens the panel and native unit buttons select with arrows', async ({ page }) => {
  await input(page).focus();
  await input(page).press('ArrowDown');

  await expect(unit(page, 'hour 10')).toBeFocused();
  await unit(page, 'hour 10').press('ArrowDown');

  await expect(unit(page, 'hour 11')).toBeFocused();
  await expect(unit(page, 'hour 11')).toHaveAttribute('aria-pressed', 'true');
  await unit(page, 'hour 11').press('Escape');

  await expect(input(page)).toBeFocused();
  await expect(input(page)).toHaveValue('10:23:44');
  await expect(popup(page)).toHaveCount(0);
});

test('TimePicker changes input formats and visible columns without changing the owned value', async ({ page }) => {
  await control(page, 'Time format').selectOption('short');

  await expect(input(page)).toHaveValue('10:23');
  await input(page).click();
  await expect(popup(page).locator('.ant-picker-time-panel-column')).toHaveCount(2);
  await input(page).press('Escape');
  await control(page, 'Time format').selectOption('callback');

  await expect(input(page)).toHaveValue('Time 10:23:44');
  await expect(input(page)).toHaveAttribute('readonly');
  await expect(owner(page)).toHaveText('2024-09-15T10:23:44.567Z');
  await expect(events(page)).not.toContainText('change:');
});

test('TimePicker parses a secondary input format and submits canonical time text with Enter', async ({ page }) => {
  await control(page, 'Time format').selectOption('array');
  await input(page).click();
  await input(page).fill('7:8');
  await input(page).press('Enter');

  await expect(input(page)).toHaveValue('07:08');
  await expect(owner(page)).toHaveText('2024-09-15T07:08:00.000Z');
  await expect(events(page)).toContainText('change:2024-09-15T07:08:00.000Z:"07:08"');
  await expect(events(page)).not.toContainText('ok:');
});

test('TimePicker previews disabled and unaligned units without selecting them', async ({ page }) => {
  await control(page, 'Restricted time').check();
  await input(page).click();
  const disabled = popup(page).locator('[data-type="hour"] li[data-value="11"]');
  await disabled.hover();

  await expect(input(page)).toHaveValue('11:23:44');
  await expect(unit(page, 'hour 11')).toBeDisabled();
  await expect(owner(page)).toHaveText('2024-09-15T10:23:44.567Z');
  await expect(events(page)).toHaveText('open:true');
  await page.mouse.move(1, 1);

  await expect(input(page)).toHaveValue('10:23:44');
});

test('TimePicker can disable hover preview and hide disabled stepped options', async ({ page }) => {
  await control(page, 'Preview time hover').uncheck();
  await control(page, 'Restricted time').check();
  await control(page, 'Hide disabled time units').check();
  await control(page, 'Stepped time').check();
  await input(page).click();
  await unit(page, 'hour 14').hover();

  await expect(input(page)).toHaveValue('10:23:44');
  await expect(unit(page, 'hour 12')).toHaveCount(0);
  await expect(unit(page, 'minute 30')).toHaveCount(0);
  await expect(popup(page).locator('[data-type="minute"] li')).toHaveCount(3);
  await unit(page, 'hour 14').click();
  await unit(page, 'ОК').click();

  await expect(owner(page)).toHaveText('2024-09-15T14:15:40.500Z');
});

test('TimePicker localizes 12-hour labels and changes meridiem without changing the date', async ({ page }) => {
  await control(page, 'Twelve hour time').check();
  await expect(input(page)).toHaveValue('10:23:44 утра');
  await input(page).click();
  await unit(page, 'дня').click();
  await unit(page, 'ОК').click();

  await expect(owner(page)).toHaveText('2024-09-15T22:23:44.500Z');
  await expect(input(page)).toHaveValue('10:23:44 вечера');
  await expect(input(page)).not.toHaveAttribute('aria-invalid', 'true');
  await control(page, 'English locale').check();

  await expect(input(page)).toHaveValue('10:23:44 PM');
  await expect(input(page)).toHaveAttribute('placeholder', 'Select time');
  await input(page).click();

  await expect(unit(page, 'PM')).toHaveAttribute('aria-pressed', 'true');
});

test('TimePicker retains full millisecond precision when the step is one', async ({ page }) => {
  await control(page, 'Time milliseconds').check();
  await control(page, 'Precise time milliseconds').check();
  await expect(input(page)).toHaveValue('10:23:44.567');
  await input(page).click();
  await expect(popup(page).locator('[data-type="millisecond"] li')).toHaveCount(1000);
  await unit(page, 'millisecond 789').click();
  await unit(page, 'ОК').click();

  await expect(owner(page)).toHaveText('2024-09-15T10:23:44.789Z');
  await expect(control(page, 'Time mode')).toHaveText('UTC');
});

test('TimePicker rejects restricted typed times while keeping raw invalid text only when requested', async ({ page }) => {
  await control(page, 'Restricted time').check();
  await input(page).click();
  await input(page).fill('11:00:00');

  await expect(input(page)).toHaveAttribute('aria-invalid', 'true');
  await expect(unit(page, 'ОК')).toBeDisabled();
  await input(page).press('Enter');

  await expect(owner(page)).toHaveText('2024-09-15T10:23:44.567Z');
  await input(page).click();
  await input(page).fill('invalid');
  await button(page, 'Read time FormData').click();

  await expect(input(page)).toHaveValue('10:23:44');
  await control(page, 'Preserve invalid time').check();
  await input(page).click();
  await input(page).fill('invalid');
  await button(page, 'Read time FormData').click();

  await expect(input(page)).toHaveValue('invalid');
  await expect(input(page)).toHaveAttribute('aria-invalid', 'true');
  await expect(owner(page)).toHaveText('2024-09-15T10:23:44.567Z');
});

test('TimePicker retains a rejected controlled draft while the owner keeps the popup open', async ({ page }) => {
  await control(page, 'Accept time changes').uncheck();
  await control(page, 'Controlled time popup').check();
  await control(page, 'Accept time popup changes').uncheck();
  await button(page, 'Toggle owned time popup').click();
  await unit(page, 'hour 13').click();
  await unit(page, 'ОК').click();

  await expect(popup(page)).toBeVisible();
  await expect(input(page)).toHaveValue('13:23:44');
  await expect(owner(page)).toHaveText('2024-09-15T10:23:44.567Z');
  await button(page, 'Toggle owned time popup').click();

  await expect(popup(page)).toHaveCount(0);
  await expect(input(page)).toHaveValue('10:23:44');
  await button(page, 'Set external time').click();

  await expect(input(page)).toHaveValue('18:45:56');
  await expect(owner(page)).toHaveText('2025-02-28T18:45:56.789Z');
});

test('TimePicker presets commit immediately and footer snippets preserve modern precedence', async ({ page }) => {
  await control(page, 'Time presets').check();
  await control(page, 'Time footer').selectOption('modern');
  await control(page, 'Custom time panel').check();
  await input(page).click();

  await expect(control(page, 'Custom time panel')).toHaveCount(2);
  await expect(unit(page, 'Legacy time footer')).toHaveCount(0);
  await unit(page, 'Modern time footer').click();

  await expect(control(page, 'Time footer clicks')).toHaveText('1');
  await unit(page, 'Afternoon time preset').click();

  await expect(owner(page)).toHaveText('2024-09-15T15:20:30.456Z');
  await expect(popup(page)).toHaveCount(0);
  await expect(events(page)).not.toContainText('ok:');
});

test('TimePicker combines source semantic layers, themes, RTL and nested config replacement', async ({ page }) => {
  await control(page, 'Styled time picker').check();
  await control(page, 'Custom time icons').check();
  await control(page, 'Custom time cells').check();
  await control(page, 'Dark time picker').check();
  await control(page, 'Compact time picker').check();
  await control(page, 'Right to left').check();
  const root = page.locator('.fixture-time-picker');

  await expect(root).toHaveClass(/context-time-middle context-time-raw local-time-raw/);
  await expect(root).toHaveClass(/ant-picker-filled/);
  await expect(root).toHaveCSS('outline-offset', '8px');
  await expect(root).toHaveAttribute('dir', 'rtl');
  await expect(root.locator('.local-time-prefix')).toHaveText('At');
  await expect(root.locator('.local-time-suffix')).toHaveText('T');
  await input(page).click();

  await expect(popup(page)).toHaveClass(/context-time-popup/);
  await expect(popup(page)).toHaveClass(/local-time-popup/);
  await expect(popup(page)).toHaveCSS('outline-offset', '6px');
  await expect(popup(page).locator('.local-time-content')).toHaveCSS('outline-offset', '6px');
  await expect(popup(page).locator('.custom-time-cell').first()).toHaveAttribute('data-type', 'time');
  await unit(page, 'hour 13').click();
  await unit(page, 'ОК').click();
  await control(page, 'Replace time picker config').check();

  await expect(root).toHaveClass(/nested-time-context/);
  await expect(root).not.toHaveClass(/context-time-middle/);
  await expect(root).toHaveClass(/ant-picker-outlined/);
});

test('TimePicker refs preserve native focus/selection and FormData uses displayed time text', async ({ page }) => {
  await button(page, 'Focus time ref').click();

  await expect(input(page)).toBeFocused();
  expect(await input(page).evaluate(element => [
    (element as HTMLInputElement).selectionStart,
    (element as HTMLInputElement).selectionEnd
  ])).toEqual([0, 8]);
  await button(page, 'Read time FormData').click();

  await expect(control(page, 'Time data')).toHaveText('[["time","10:23:44"]]');
  await control(page, 'Disable all components').check();

  await expect(input(page)).toBeDisabled();
  await expect(page.locator('.fixture-time-picker .ant-picker-clear')).toHaveCount(0);
});

test('TimePicker clear replaces the suffix in the input and restores it when clearing is disabled', async ({ page }) => {
  const root = page.locator('.fixture-time-picker');
  const suffix = root.locator('.ant-picker-suffix');
  const clear = root.getByRole('button', { name: 'Очистить' });
  await root.hover();

  await expect(suffix).toHaveCSS('opacity', '0');
  await expect(clear).toHaveCSS('opacity', '1');
  expect(await root.evaluate(element => {
    const suffix = element.querySelector('.ant-picker-suffix')!.getBoundingClientRect();
    const clear = element.querySelector('.ant-picker-clear')!.getBoundingClientRect();
    return Math.abs(suffix.right - clear.right);
  })).toBeLessThan(1);
  await control(page, 'Clearable time').uncheck();
  await root.hover();

  await expect(clear).toHaveCount(0);
  await expect(suffix).toHaveCSS('opacity', '1');
});

test('TimePicker keeps its full time panel inside a narrow RTL viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await control(page, 'Right to left').check();
  await control(page, 'Twelve hour time').check();
  await control(page, 'Time milliseconds').check();
  await input(page).click();

  await expect(popup(page).locator('.ant-picker-time-panel-column')).toHaveCount(5);
  const rect = await popup(page).boundingBox();
  expect(rect!.x).toBeGreaterThanOrEqual(0);
  expect(rect!.x + rect!.width).toBeLessThanOrEqual(320);
  await expect(popup(page)).toHaveClass(/ant-picker-dropdown-rtl/);
  await unit(page, 'ОК').click();

  await expect(popup(page)).toHaveCount(0);
});

test('TimePicker integrates with Form validation, labels and reset without serializing Dayjs', async ({ page }) => {
  await button(page, 'Submit time form').click();

  await expect(page.getByRole('alert')).toHaveText('Choose a time');
  const required = control(page, 'Required time');
  await expect(required).toBeFocused();
  await required.fill('08:09:10');
  await required.press('Enter');
  await button(page, 'Submit time form').click();

  await expect(control(page, 'Submitted time')).toHaveText('2024-09-15T08:09:10.000Z');
  await button(page, 'Reset time form').click();

  await expect(required).toHaveValue('');
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('TimePicker uses Now without OK and aligns the source millisecond step', async ({ page }) => {
  await page.clock.pauseAt(new Date('2024-09-15T12:35:00.789Z'));
  await input(page).click();
  await unit(page, 'Сейчас').click();

  await expect(owner(page)).toHaveText('2024-09-15T12:35:00.700Z');
  await expect(popup(page)).toHaveCount(0);
  await expect(events(page)).not.toContainText('ok:');
});

test('TimePicker selects the nearest enabled unit after manual scrolling settles', async ({ page }) => {
  await page.clock.pauseAt(new Date('2024-09-15T12:36:00.000Z'));
  await control(page, 'Change time on scroll').check();
  await control(page, 'Restricted time').check();
  await input(page).click();
  const column = popup(page).locator('[data-type="hour"]');
  await page.clock.runFor(1000);
  await column.evaluate(element => new Promise<void>(resolve => {
    element.addEventListener('scroll', () => resolve(), { once: true });
    const first = element.querySelector('li')!;
    const target = element.querySelector<HTMLElement>('[data-value="12"]')!;
    element.scrollTop = target.offsetTop - first.offsetTop + 1;
  }));
  await page.clock.runFor(299);

  await expect(input(page)).toHaveValue('10:23:44');
  await page.clock.runFor(2);

  await expect(unit(page, 'hour 13')).toHaveAttribute('aria-pressed', 'true');
  await expect(owner(page)).toHaveText('2024-09-15T10:23:44.567Z');
  await unit(page, 'ОК').click();

  await expect(owner(page)).toHaveText('2024-09-15T13:23:44.500Z');
});

test('TimePicker cancels delayed scroll selection when its value changes or it unmounts', async ({ page }) => {
  await page.clock.pauseAt(new Date('2024-09-15T12:36:00.000Z'));
  await control(page, 'Change time on scroll').check();
  await input(page).click();
  const column = popup(page).locator('[data-type="hour"]');
  await page.clock.runFor(1000);
  await column.evaluate(element => {
    const first = element.querySelector('li')!;
    const target = element.querySelector<HTMLElement>('[data-value="13"]')!;
    element.scrollTop = target.offsetTop - first.offsetTop;
    element.dispatchEvent(new Event('scroll'));
  });
  await button(page, 'Set external time').evaluate(element => {
    (element as HTMLButtonElement).click();
  });
  await page.clock.runFor(1000);

  await expect(popup(page)).toBeVisible();
  await expect(owner(page)).toHaveText('2025-02-28T18:45:56.789Z');
  await expect(input(page)).toHaveValue('18:45:56');
  await expect(events(page)).not.toContainText('calendar:2024-09-15T13:');
  await column.evaluate(element => {
    element.scrollTop = 0;
    element.dispatchEvent(new Event('scroll'));
  });
  await control(page, 'Mount time picker').evaluate(element => {
    (element as HTMLInputElement).click();
  });
  await page.clock.runFor(1000);

  await expect(input(page)).toHaveCount(0);
  await expect(popup(page)).toHaveCount(0);
  await expect(control(page, 'Time ref')).toHaveText('none');
  await expect(owner(page)).toHaveText('2025-02-28T18:45:56.789Z');
});

test('TimePicker keeps defaultValue initial-only and retains later uncontrolled selections', async ({ page }) => {
  const local = control(page, 'Uncontrolled time');
  await button(page, 'Change default time').click();

  await expect(local).toHaveValue('10:23:44');
  await local.click();
  await unit(page, 'hour 13').click();
  await unit(page, 'ОК').click();

  await expect(local).toHaveValue('13:23:44');
  await expect(control(page, 'Uncontrolled time value')).toHaveText('2024-09-15T13:23:44.500Z');
  await local.click();

  await expect(unit(page, 'hour 13')).toHaveAttribute('aria-pressed', 'true');
});

test('TimePicker double click confirms a unit without triggering the footer onOk callback', async ({ page }) => {
  await input(page).click();
  await unit(page, 'hour 13').dblclick();

  await expect(popup(page)).toHaveCount(0);
  await expect(owner(page)).toHaveText('2024-09-15T13:23:44.500Z');
  await expect(events(page)).not.toContainText('ok:');
});

for (const timezoneId of ['America/New_York', 'Pacific/Kiritimati']) {
  test.describe(`TimePicker in ${timezoneId}`, () => {
    test.use({ timezoneId });

    test('preserves an owned UTC date and milliseconds when selecting in the panel', async ({ page }) => {
      await control(page, 'Precise time milliseconds').check();
      await input(page).click();
      await unit(page, 'hour 13').click();
      await unit(page, 'ОК').click();

      await expect(owner(page)).toHaveText('2024-09-15T13:23:44.567Z');
      await expect(control(page, 'Time mode')).toHaveText('UTC');
    });
  });
}
