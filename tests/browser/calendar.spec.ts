import type { Page } from '@playwright/test';
import { test, expect } from './test';

const root = (page: Page) => page.locator('.fixture-calendar');
const cell = (page: Page, date: string) => root(page)
  .getByRole('gridcell', { name: date, exact: true });
const control = (page: Page, name: string) => page.getByLabel(name, { exact: true });
const select = (page: Page, name: string) => page.getByRole('combobox', { name, exact: true });
const yearSelect = (page: Page) => root(page)
  .locator('.ant-picker-calendar-year-select').getByRole('combobox');
const monthSelect = (page: Page) => root(page)
  .locator('.ant-picker-calendar-month-select').getByRole('combobox');
const mode = (page: Page, index: number) => root(page)
  .locator('.ant-picker-calendar-mode-switch > label').nth(index);
const events = (page: Page) => control(page, 'Calendar events');
const button = (page: Page, name: string) => page.getByRole('button', { name, exact: true });

async function chooseMonth(page: Page, name: string) {
  await monthSelect(page).click();
  await root(page).getByRole('option', { name, exact: true }).click();
}

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2024-09-15T03:00:00.000Z') });
  await page.goto('/?fixture=calendar');
  await expect(cell(page, '2024-09-15')).toHaveAttribute('aria-selected', 'true');
});

test('Calendar renders the source date grid, selected/today cells and separate header controls', async ({ page }) => {
  await expect(root(page)).toHaveClass(/ant-picker-calendar-full/);
  await expect(root(page).getByRole('gridcell')).toHaveCount(42);
  await expect(root(page).getByRole('gridcell').first()).toHaveAttribute('title', '2024-08-26');
  await expect(root(page).getByRole('columnheader').first()).toHaveText('Пн');
  await expect(cell(page, '2024-09-15')).toHaveClass(/ant-picker-cell-today/);
  await expect(cell(page, '2024-09-15').locator('.ant-picker-calendar-date-value'))
    .toHaveText('15');
  await expect(cell(page, '2024-09-01').locator('.ant-picker-calendar-date-value'))
    .toHaveText('01');
  await expect(yearSelect(page)).toHaveValue('2024');
  await expect(monthSelect(page)).toHaveValue('Сен');
  await expect(control(page, 'Calendar ref')).toHaveText('DIV');
  await expect(events(page)).toHaveText('');
});

test('Calendar emits change before select for a new date and only select for the same day', async ({ page }) => {
  await cell(page, '2024-09-16').click();

  await expect(cell(page, '2024-09-16')).toHaveAttribute('aria-selected', 'true');
  await expect(events(page)).toHaveText(
    'change:2024-09-16T12:34:56.789Z|select:2024-09-16T12:34:56.789Z:date'
  );
  await button(page, 'Clear Calendar events').click();
  await cell(page, '2024-09-16').click();

  await expect(events(page)).toHaveText('select:2024-09-16T12:34:56.789Z:date');
});

test('Calendar selects a neighboring month and emits panel, change and select in source order', async ({ page }) => {
  await cell(page, '2024-08-26').click();

  await expect(events(page)).toHaveText(
    'panel:2024-08-26T12:34:56.789Z:month|change:2024-08-26T12:34:56.789Z|select:2024-08-26T12:34:56.789Z:date'
  );
  await expect(monthSelect(page)).toHaveValue('Авг');
  await expect(cell(page, '2024-08-26')).toHaveAttribute('aria-selected', 'true');
  await expect(root(page).getByRole('grid')).toHaveAttribute('aria-label', '2024-08');
});

test('Calendar retains a rejected controlled value while PickerPanel moves its displayed month', async ({ page }) => {
  await control(page, 'Controlled Calendar value').check();
  await control(page, 'Accept Calendar value').uncheck();
  await cell(page, '2024-08-26').click();

  await expect(monthSelect(page)).toHaveValue('Сен');
  await expect(root(page).getByRole('grid')).toHaveAttribute('aria-label', '2024-08');
  await expect(root(page).locator('.ant-picker-cell-selected')).toHaveCount(0);
  await expect(control(page, 'Calendar owner')).toContainText('2024-09-15T12:34:56.789Z');
  await control(page, 'Calendar external date').fill('2024-02-29T23:45:12.345Z');
  await button(page, 'Set Calendar date').click();

  await expect(cell(page, '2024-02-29')).toHaveAttribute('aria-selected', 'true');
  await expect(monthSelect(page)).toHaveValue('Фев');
  await expect(events(page)).toHaveText(
    'panel:2024-08-26T12:34:56.789Z:month|change:2024-08-26T12:34:56.789Z|select:2024-08-26T12:34:56.789Z:date'
  );
});

test('Calendar keeps defaultValue initial-only and accepts later controlled values without callbacks', async ({ page }) => {
  await button(page, 'Set Calendar date').click();

  await expect(cell(page, '2024-09-15')).toHaveAttribute('aria-selected', 'true');
  await expect(events(page)).toHaveText('');
  await control(page, 'Controlled Calendar value').check();

  await expect(cell(page, '2024-02-29')).toHaveAttribute('aria-selected', 'true');
  await expect(events(page)).toHaveText('');
});

test('Calendar changes mode without selecting a month and keeps year mode after a month choice', async ({ page }) => {
  await mode(page, 1).click();

  await expect(root(page).locator('.ant-picker-month-panel')).toBeVisible();
  await expect(root(page).getByRole('gridcell')).toHaveCount(12);
  await expect(events(page)).toHaveText('panel:2024-09-15T12:34:56.789Z:year');
  await expect(monthSelect(page)).toHaveCount(0);
  await button(page, 'Clear Calendar events').click();
  await cell(page, '2024-02').click();

  await expect(events(page)).toHaveText(
    'change:2024-02-15T12:34:56.789Z|select:2024-02-15T12:34:56.789Z:month'
  );
  await expect(root(page).locator('.ant-picker-month-panel')).toBeVisible();
  await expect(cell(page, '2024-02')).toHaveAttribute('aria-selected', 'true');
});

test('Calendar releases controlled value and mode without restoring their initial defaults', async ({ page }) => {
  await control(page, 'Controlled Calendar mode').check();
  await button(page, 'Set Calendar mode').click();

  await expect(root(page).locator('.ant-picker-month-panel')).toBeVisible();
  await expect(events(page)).toHaveText('');
  await control(page, 'Controlled Calendar mode').uncheck();

  await expect(root(page).locator('.ant-picker-date-panel')).toBeVisible();
  await expect(root(page).locator('.ant-picker-calendar-mode-switch input:checked')).toHaveCount(0);
  await expect(monthSelect(page)).toHaveCount(0);
  await control(page, 'Controlled Calendar value').check();
  await button(page, 'Set Calendar date').click();

  await expect(cell(page, '2024-02-29')).toHaveAttribute('aria-selected', 'true');
  await control(page, 'Controlled Calendar value').uncheck();

  await expect(root(page).locator('.ant-picker-cell-selected')).toHaveCount(0);
  await expect(root(page).getByRole('grid')).toHaveAttribute('aria-label', '2024-02');
});

test('Calendar restores native radios after a rejected controlled mode and accepts a later request', async ({ page }) => {
  await control(page, 'Controlled Calendar mode').check();
  await control(page, 'Accept Calendar mode').uncheck();
  await mode(page, 1).click();

  await expect(root(page).locator('.ant-picker-date-panel')).toBeVisible();
  await expect(mode(page, 0).getByRole('radio')).toBeChecked();
  await expect(mode(page, 1).getByRole('radio')).not.toBeChecked();
  await expect(events(page)).toHaveText('panel:2024-09-15T12:34:56.789Z:year');
  await control(page, 'Accept Calendar mode').check();
  await mode(page, 1).click();

  await expect(root(page).locator('.ant-picker-month-panel')).toBeVisible();
  await expect(mode(page, 1).getByRole('radio')).toBeChecked();
});

test('Calendar header month and year preserve the day and source timestamps', async ({ page }) => {
  await chooseMonth(page, 'Окт');

  await expect(events(page)).toHaveText(
    'panel:2024-10-15T12:34:56.789Z:month|change:2024-10-15T12:34:56.789Z|select:2024-10-15T12:34:56.789Z:month'
  );
  await button(page, 'Clear Calendar events').click();
  await yearSelect(page).click();

  await expect(root(page).getByRole('option')).toHaveCount(20);
  await root(page).getByRole('option', { name: '2025', exact: true }).click();

  await expect(events(page)).toHaveText(
    'panel:2025-10-15T12:34:56.789Z:month|change:2025-10-15T12:34:56.789Z|select:2025-10-15T12:34:56.789Z:year'
  );
});

test('Calendar combines inclusive date bounds and disabledDate while retaining the selected value', async ({ page }) => {
  await select(page, 'Calendar range').selectOption('window');
  await control(page, 'Block Calendar sixteenth').check();

  await expect(cell(page, '2024-09-09')).toHaveAttribute('aria-disabled', 'true');
  await expect(cell(page, '2024-09-16')).toHaveAttribute('aria-disabled', 'true');
  await cell(page, '2024-09-09').click({ force: true });
  await cell(page, '2024-09-16').click({ force: true });

  await expect(events(page)).toHaveText('');
  await expect(cell(page, '2024-09-15')).toHaveAttribute('aria-selected', 'true');
  await cell(page, '2024-09-20').click();

  await expect(cell(page, '2024-09-20')).toHaveAttribute('aria-selected', 'true');
  await expect(cell(page, '2024-09-21')).toHaveAttribute('aria-disabled', 'true');
  await monthSelect(page).click();

  await expect(root(page).getByRole('option')).toHaveCount(1);
  await page.keyboard.press('Escape');
});

test('Calendar repeats the source endpoint-only disabled rule in month mode', async ({ page }) => {
  await mode(page, 1).click();
  await select(page, 'Calendar range').selectOption('window');

  await expect(cell(page, '2024-09')).toHaveAttribute('aria-disabled', 'true');
  await expect(cell(page, '2024-09')).toHaveAttribute('aria-selected', 'true');
  await select(page, 'Calendar range').selectOption('months');

  await expect(cell(page, '2024-09')).not.toHaveAttribute('aria-disabled', 'true');
  await expect(cell(page, '2024-11')).not.toHaveAttribute('aria-disabled', 'true');
  await expect(cell(page, '2024-12')).toHaveAttribute('aria-disabled', 'true');
});

test('Calendar year header clamps boundary months but does not normalize an out-of-range day', async ({ page }) => {
  await control(page, 'Controlled Calendar value').check();
  await control(page, 'Calendar external date').fill('2018-12-31T12:34:56.789Z');
  await button(page, 'Set Calendar date').click();
  await select(page, 'Calendar range').selectOption('years');
  await yearSelect(page).click();

  await expect(root(page).getByRole('option')).toHaveCount(2);
  await root(page).getByRole('option', { name: '2019', exact: true }).click();

  await expect(events(page)).toHaveText(
    'panel:2019-03-31T12:34:56.789Z:month|change:2019-03-31T12:34:56.789Z|select:2019-03-31T12:34:56.789Z:year'
  );
  await expect(cell(page, '2019-03-31')).toHaveAttribute('aria-disabled', 'true');
  await expect(cell(page, '2019-03-31')).toHaveAttribute('aria-selected', 'true');
});

test('Calendar week numbers select row starts as dates and omit custom renderers for week cells', async ({ page }) => {
  await control(page, 'Show Calendar weeks').check();
  await select(page, 'Calendar renderer').selectOption('cell');

  await expect(root(page).getByRole('gridcell')).toHaveCount(48);
  await expect(root(page).locator('.custom-calendar-content')).toHaveCount(42);
  await root(page).locator('.ant-picker-cell-week').nth(3).click();

  await expect(events(page)).toHaveText(
    'change:2024-09-16T12:34:56.789Z|select:2024-09-16T12:34:56.789Z:date'
  );
  await expect(cell(page, '2024-09-16')).toHaveAttribute('aria-selected', 'true');
});

test('Calendar custom header actions use customize source and same-date time changes only select', async ({ page }) => {
  await control(page, 'Custom Calendar header').check();
  await button(page, 'Custom Calendar same date time').click();

  await expect(events(page)).toHaveText('select:2024-09-15T13:34:56.789Z:customize');
  await expect(control(page, 'Custom Calendar header state'))
    .toHaveText('2024-09-15T13:34:56.789Z:month');
  await button(page, 'Clear Calendar events').click();
  await button(page, 'Custom Calendar mode').click();

  await expect(events(page)).toHaveText('panel:2024-09-15T13:34:56.789Z:year');
  await button(page, 'Clear Calendar events').click();
  await button(page, 'Custom Calendar next date').click();

  await expect(events(page)).toHaveText(
    'change:2024-09-16T13:34:56.789Z|select:2024-09-16T13:34:56.789Z:customize'
  );
});

test('Calendar snippets preserve originNode, renderer priorities and date versus month locale info', async ({ page }) => {
  await select(page, 'Calendar renderer').selectOption('cell');

  await expect(root(page).locator('.custom-calendar-content')).toHaveCount(42);
  await expect(root(page).locator('.custom-calendar-content').first()).toContainText(':D');
  await expect(root(page).locator('.ant-picker-calendar-date-content > .ant-picker-cell-inner'))
    .toHaveCount(42);
  await mode(page, 1).click();

  await expect(root(page).locator('.custom-calendar-content')).toHaveCount(12);
  await expect(root(page).locator('.custom-calendar-content').first()).toContainText(':raw');
  await select(page, 'Calendar renderer').selectOption('precedence');

  await expect(root(page).locator('.custom-calendar-full')).toHaveCount(12);
  await expect(root(page).locator('.custom-calendar-content'))
    .toHaveCount(0);
  await expect(root(page).locator('.ant-picker-calendar-date-value')).toHaveCount(0);
  await select(page, 'Calendar renderer').selectOption('empty');

  await expect(root(page).getByRole('gridcell').first()).toBeEmpty();
});

test('Calendar custom interactive cells stop selection and retain drafts by panel position', async ({ page }) => {
  await select(page, 'Calendar renderer').selectOption('full');
  const first = root(page).getByRole('gridcell').first().getByRole('textbox');
  const original = await first.elementHandle();
  await first.fill('Cell draft');
  await first.press('ArrowRight');

  await expect(first).toBeFocused();
  await expect(events(page)).toHaveText('');
  await root(page).getByRole('gridcell').first().getByRole('button').click();

  await expect(events(page)).toHaveText('');
  await expect(control(page, 'Calendar embedded actions')).toHaveText('1');
  await chooseMonth(page, 'Окт');

  await expect(first).toHaveValue('Cell draft');
  expect(await first.evaluate((node, old) => node === old, original)).toBe(true);
});

test('Calendar grid keyboard moves focus without selection, skips disabled cells and activates with Enter or Space', async ({ page }) => {
  await control(page, 'Block Calendar sixteenth').check();
  await cell(page, '2024-09-15').focus();
  await page.keyboard.press('ArrowRight');

  await expect(cell(page, '2024-09-17')).toBeFocused();
  await expect(cell(page, '2024-09-15')).toHaveAttribute('aria-selected', 'true');
  await expect(events(page)).toHaveText('');
  await page.keyboard.press('Enter');

  await expect(cell(page, '2024-09-17')).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('End');

  await expect(cell(page, '2024-09-22')).toBeFocused();
  await page.keyboard.press(' ');

  await expect(cell(page, '2024-09-22')).toHaveAttribute('aria-selected', 'true');
  await expect(root(page).locator('[data-calendar-position][tabindex="0"]')).toHaveCount(1);
});

test('Calendar keeps positional date cells when adding weeks and recreates them when changing panel type', async ({ page }) => {
  await select(page, 'Calendar renderer').selectOption('full');
  const first = root(page).locator('td:not(.ant-picker-cell-week)').first().getByRole('textbox');
  const original = await first.elementHandle();
  await first.fill('Date panel draft');
  await control(page, 'Show Calendar weeks').check();

  await expect(first).toHaveValue('Date panel draft');
  expect(await first.evaluate((node, old) => node === old, original)).toBe(true);
  await mode(page, 1).click();

  await expect(first).toHaveValue('');
  expect(await original?.evaluate(node => node.isConnected)).toBe(false);
});

test('Calendar deep-merges locale, inherits RTL and disables header controls without disabling date cells', async ({ page }) => {
  await control(page, 'English locale').check();

  await expect(root(page).getByRole('columnheader').first()).toHaveText('Su');
  await expect(root(page).getByRole('gridcell').first()).toHaveAttribute('title', '2024-09-01');
  await control(page, 'Partial Calendar locale').check();

  await expect(root(page).getByRole('combobox', { name: 'My year selector', exact: true }))
    .toHaveValue('2024');
  await expect(mode(page, 0)).toHaveText('My month');
  await control(page, 'Right to left').check();
  await control(page, 'Disable all components').check();

  await expect(root(page)).toHaveCSS('direction', 'rtl');
  await expect(yearSelect(page)).toBeDisabled();
  await expect(mode(page, 0).getByRole('radio')).toBeDisabled();
  await cell(page, '2024-09-17').click();

  await expect(cell(page, '2024-09-17')).toHaveAttribute('aria-selected', 'true');
  await cell(page, '2024-09-17').focus();
  await page.keyboard.press('ArrowLeft');

  await expect(cell(page, '2024-09-18')).toBeFocused();
});

test('Calendar semantic root styles follow context/local priority and keep raw mode props', async ({ page }) => {
  await expect(root(page)).toHaveClass(/context-full/);
  await expect(root(page)).toHaveClass(/local-mode-unset/);
  await expect(root(page)).toHaveCSS('outline-offset', '4px');
  await control(page, 'Styled Calendar').check();

  await expect(root(page)).toHaveCSS('outline-offset', '8px');
  for (const selector of ['.local-calendar-header', '.local-calendar-body', '.local-calendar-grid',
    '.local-calendar-cell', '.local-calendar-content']) {
    await expect(root(page).locator(selector).first()).toHaveCSS('outline-offset', '6px');
  }
  await mode(page, 1).click();

  await expect(root(page)).toHaveClass(/local-mode-unset/);
  await control(page, 'Replace Calendar config').check();

  await expect(root(page)).toHaveClass(/nested-calendar-context/);
  await expect(root(page)).not.toHaveClass(/context-full/);
  await expect(root(page)).toHaveCSS('outline-offset', '8px');
});

test('Calendar mini/full, dark and compact appearances follow source tokens', async ({ page }) => {
  await control(page, 'Fullscreen Calendar').uncheck();

  await expect(root(page)).toHaveClass(/ant-picker-calendar-mini/);
  await expect(root(page).getByRole('grid')).toHaveCSS('height', '256px');
  await expect(mode(page, 0)).toHaveCSS('height', '24px');
  await expect(root(page)).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await control(page, 'Dark Calendar').check();

  await expect(root(page)).toHaveCSS('background-color', 'rgb(20, 20, 20)');
  await expect(cell(page, '2024-09-15').locator('.ant-picker-cell-inner').first())
    .toHaveCSS('background-color', 'rgb(114, 46, 209)');
  await control(page, 'Compact Calendar').check();

  await expect(mode(page, 0)).toHaveCSS('height', '21px');
});

test('Calendar clears native refs on removal while preserving external owner values and focus', async ({ page }) => {
  await control(page, 'Mount Calendar').uncheck();

  await expect(root(page)).toHaveCount(0);
  await expect(control(page, 'Calendar ref')).toHaveText('none');
  await expect(control(page, 'Mount Calendar')).toBeFocused();
  await expect(control(page, 'Calendar owner')).toHaveText('2024-09-15T12:34:56.789Z:month');
  await control(page, 'Mount Calendar').check();

  await expect(cell(page, '2024-09-15')).toHaveAttribute('aria-selected', 'true');
  await expect(events(page)).toHaveText('');
});

test('generateCalendar keeps Date values, reactive props and ref setters through its adapter', async ({ page }) => {
  const generated = page.locator('.generated-calendar');
  await expect(generated.getByRole('gridcell', { name: '2024-02-29', exact: true }))
    .toHaveAttribute('aria-selected', 'true');
  await button(page, 'Set generated Calendar date').click();

  await expect(generated.getByRole('gridcell', { name: '2025-01-31', exact: true }))
    .toHaveAttribute('aria-selected', 'true');
  await button(page, 'Set generated Calendar mode').click();

  await expect(generated.getByRole('gridcell')).toHaveCount(12);
  await generated.getByRole('gridcell', { name: '2025-02', exact: true }).click();

  await expect(control(page, 'Generated Calendar owner')).toHaveText('2025-02-28T23:45:12.345Z');
  await expect(control(page, 'Generated Calendar ref')).toHaveText('DIV');
  await control(page, 'Mount generated Calendar').uncheck();

  await expect(control(page, 'Generated Calendar ref')).toHaveText('none');
});

test('Calendar header does not inherit native field association or required from its FormItem', async ({ page }) => {
  const form = page.locator('.calendar-form');

  await expect(form.locator('[name="calendar-field"],[required]')).toHaveCount(0);
  await expect(form.locator('input[type="hidden"]')).toHaveCount(0);
  const ids = await form.locator('input[id]').evaluateAll(nodes => nodes.map(node => node.id));
  expect(new Set(ids).size).toBe(ids.length);
  await button(page, 'Read Calendar form').click();

  await expect(control(page, 'Calendar form data')).toHaveText(/\[\["ant-radio-name-[^"]+","month"\]\]/);
});

test('Calendar mobile header uses the source stacked layout without overflowing the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  await expect(root(page).locator('.ant-picker-calendar-header')).toHaveCSS('display', 'block');
  await expect(root(page).locator('.ant-picker-calendar-mode-switch')).toHaveCSS('width', '342px');
  const dimensions = await root(page).evaluate(node => ({
    left: node.getBoundingClientRect().left,
    right: node.getBoundingClientRect().right,
    scroll: node.scrollWidth,
    width: node.clientWidth
  }));

  expect(dimensions.left).toBeGreaterThanOrEqual(0);
  expect(dimensions.right).toBeLessThanOrEqual(390);
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.width + 1);
});
