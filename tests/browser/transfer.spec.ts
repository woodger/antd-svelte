import type { Page } from '@playwright/test';
import { test, expect } from './test';

const control = (page: Page, name: string) => page.getByLabel(name, { exact: true });
const button = (page: Page, name: string) => page.getByRole('button', { name, exact: true });
const root = (page: Page) => page.getByTestId('transfer-root');
const source = (page: Page) => root(page).locator('.ant-transfer-section').nth(0);
const target = (page: Page) => root(page).locator('.ant-transfer-section').nth(1);
const rows = (page: Page, right = false) => (right ? target(page) : source(page))
  .locator('.ant-transfer-list-content-item');
const check = (page: Page, name: string, right = false) => (right ? target(page) : source(page))
  .getByRole('checkbox', { name, exact: true });
const search = (page: Page, right = false) => (right ? target(page) : source(page))
  .locator('.ant-transfer-list-body-search-wrapper input');
const header = (page: Page, right = false) => (right ? target(page) : source(page))
  .locator('.ant-transfer-list-header input');
const dropdown = (page: Page, right = false) => (right ? target(page) : source(page))
  .locator('button.ant-transfer-list-header-dropdown');
const move = (page: Page, right = true) => root(page).getByRole('button', {
  name: right ? 'right' : 'left', exact: true
});
const events = (page: Page) => control(page, 'Transfer events');
const targets = (page: Page) => control(page, 'Transfer targets');
const selection = (page: Page, right = false) => control(page,
  right ? 'Transfer target selection' : 'Transfer source selection');
const next = (page: Page, right = false) => (right ? target(page) : source(page))
  .getByRole('button', { name: 'Следующая страница', exact: true });

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=transfer');
  await expect(root(page)).toBeVisible();
});

test('Transfer default icon-only actions retain the upstream 24px geometry', async ({ page }) => {
  await expect(source(page)).toHaveCSS('width', '180px');
  await expect(source(page)).toHaveCSS('height', '200px');
  await expect(move(page)).toHaveCSS('width', '24px');
  await expect(move(page)).toHaveCSS('height', '24px');
  await expect(move(page, false)).toHaveCSS('width', '24px');
});

test(
  'Transfer keeps source/target order, primitive keys, root attributes and a native ref',
  async ({ page }) => {
    await expect(rows(page)).toHaveCount(31);
    await expect(rows(page, true)).toHaveText(['Charlie', 'Locked']);
    await expect(control(page, 'Transfer ref')).toHaveText('DIV');
    await expect(root(page)).not.toHaveAttribute('id');
    await expect(root(page)).not.toHaveAttribute('title');
    await expect(root(page)).toHaveAttribute('aria-label', 'Transfer lists');
    await expect(check(page, 'Disabled')).toBeDisabled();
    await expect(check(page, 'Locked', true)).toBeDisabled();
    expect(await page.getByTestId('transfer-form').evaluate(form =>
      [...new FormData(form as HTMLFormElement)])).toEqual([]);
  }
);

test(
  'Transfer selects by label and keyboard, prepends move keys and clears selection first',
  async ({ page }) => {
    await source(page).getByText('Beta', { exact: true }).click();
    await check(page, 'Alpha').focus();
    await page.keyboard.press('Space');
    await expect(selection(page)).toHaveText('string:b,string:a');
    await button(page, 'Clear transfer events').click();
    await move(page).click();

    await expect(targets(page)).toHaveText(
      'string:b,string:a,string:c,string:locked,string:missing'
    );
    await expect(rows(page, true)).toHaveText(['Beta', 'Alpha', 'Charlie', 'Locked']);
    await expect(events(page)).toHaveText(
      'select:/|change:right:string:b,string:a=>string:b,string:a,string:c,string:locked,string:missing'
    );
    await expect(move(page)).toBeDisabled();
  }
);

test(
  'Transfer returns target rows to their original source order and preserves unknown targets',
  async ({ page }) => {
    await check(page, 'Charlie', true).click();
    await move(page, false).click();

    await expect(targets(page)).toHaveText('string:locked,string:missing');
    await expect(rows(page).nth(2)).toHaveText('Charlie');
    await expect(move(page, false)).toBeDisabled();
  }
);

test(
  'Transfer leaves rejected controlled target keys intact while clearing departing selection',
  async ({ page }) => {
    await control(page, 'Accept transfer').uncheck();
    await check(page, 'Alpha').click();
    await move(page).click();

    await expect(targets(page)).toHaveText('string:c,string:locked,string:missing');
    await expect(check(page, 'Alpha')).not.toBeChecked();
    await expect(rows(page, true)).toHaveCount(2);
    await expect(move(page)).toBeDisabled();
  }
);

test(
  'Transfer restores native checkbox and wrapper state after rejected controlled selection',
  async ({ page }) => {
    await control(page, 'Controlled selection').check();
    await control(page, 'Accept selection').uncheck();
    await check(page, 'Alpha').click();

    await expect(selection(page)).toHaveText('string:a');
    await expect(check(page, 'Alpha')).not.toBeChecked();
    await expect(rows(page).first()).not.toHaveClass(/content-item-checked/);
    await expect(header(page)).not.toBeChecked();
    await expect(move(page)).toBeDisabled();
  }
);

test(
  'Transfer ignores disabled selected keys on move and keeps number/string zero distinct',
  async ({ page }) => {
    await button(page, 'Preselect transfer').click();
    await expect(check(page, 'Locked', true)).toBeChecked();
    await expect(move(page, false)).toBeDisabled();
    await check(page, 'Zero string').click();
    await move(page).click();

    await expect(targets(page)).toHaveText(
      'string:a,number:0,string:0,string:c,string:locked,string:missing'
    );
    await expect(rows(page, true)).toHaveText(
      ['Alpha', 'Zero number', 'Zero string', 'Charlie', 'Locked']
    );
    await expect(check(page, 'Locked', true)).toBeChecked();
  }
);

test('Transfer releases controlled selection into empty local state', async ({ page }) => {
  await button(page, 'Preselect transfer').click();
  await control(page, 'Controlled selection').uncheck();

  await expect(check(page, 'Alpha')).not.toBeChecked();
  await expect(check(page, 'Zero number')).not.toBeChecked();
  await check(page, 'Beta').click();
  await expect(selection(page)).toHaveText('string:b');
});

test('Transfer Shift selects and deselects only enabled rows in the range', async ({ page }) => {
  await check(page, 'Alpha').click();
  await check(page, 'Echo').click({ modifiers: ['Shift'] });

  await expect(selection(page)).toHaveText('string:a,string:b,string:e');
  await expect(check(page, 'Disabled')).not.toBeChecked();
  await check(page, 'Alpha').click({ modifiers: ['Shift'] });
  await expect(selection(page)).toHaveText('');
  await expect(move(page)).toBeDisabled();
});

test(
  'Transfer resets Shift anchors after changing a search and preserves hidden selection',
  async ({ page }) => {
    await check(page, 'Alpha').click();
    await check(page, 'Beta').click({ modifiers: ['Shift'] });
    await search(page).fill('Echo');
    await check(page, 'Echo').click({ modifiers: ['Shift'] });

    await expect(selection(page)).toHaveText('string:a,string:b,string:e');
    await expect(header(page)).toBeChecked();
    await search(page).fill('');
    await expect(check(page, 'Alpha')).toBeChecked();
    await expect(header(page)).toHaveJSProperty('indeterminate', true);
  }
);

test(
  'Transfer header toggles filtered enabled rows while retaining hidden selections',
  async ({ page }) => {
    await search(page).fill('Alpha');
    await header(page).click();
    await search(page).fill('Beta');
    await header(page).click();
    await header(page).click();

    await expect(selection(page)).toHaveText('string:a');
    await search(page).fill('');
    await expect(check(page, 'Alpha')).toBeChecked();
    await expect(check(page, 'Beta')).not.toBeChecked();
  }
);

test(
  'Transfer default search is case sensitive and clear emits exactly one logical-side callback',
  async ({ page }) => {
    await search(page).fill('alpha');
    await expect(rows(page)).toHaveCount(0);
    await button(page, 'Clear transfer events').click();
    await source(page).getByRole('button', { name: 'Очистить', exact: true }).click();

    await expect(rows(page)).toHaveCount(31);
    await expect(events(page)).toHaveText('search:left:');
  }
);

test(
  'Transfer render metadata drives search/title while snippets retain rich labels',
  async ({ page }) => {
    await control(page, 'Rich transfer content').check();
    await search(page).fill('alpha');

    await expect(rows(page)).toHaveCount(1);
    await expect(rows(page).first()).toHaveAttribute('title', 'alpha');
    await expect(rows(page).locator('strong')).toHaveText('Alpha');
    await expect(rows(page).locator('small')).toHaveText(' first');
  }
);

test(
  'Transfer reads initial search once per list and applies placeholder changes reactively',
  async ({ page }) => {
    await control(page, 'Initial search').fill('Alpha');
    await button(page, 'Remount transfer').click();
    await expect(rows(page)).toHaveCount(1);
    await expect(search(page, true)).toHaveValue('Alpha');
    await control(page, 'Initial search').fill('Beta');
    await expect(search(page)).toHaveValue('Alpha');
    await control(page, 'Search placeholder').fill('Find records');
    await expect(search(page)).toHaveAttribute('placeholder', 'Find records');
    await button(page, 'Remount transfer').click();
    await expect(rows(page)).toHaveText(['Beta']);
  }
);

test(
  'Transfer custom filters receive physical sides while onSearch keeps logical sides in RTL',
  async ({ page }) => {
    await control(page, 'Transfer filter').selectOption('physical');
    await control(page, 'Right to left').check();
    await search(page).fill('x');
    await search(page, true).fill('x');

    await expect(rows(page)).toHaveCount(0);
    await expect(rows(page, true)).toHaveCount(2);
    await expect(events(page)).toHaveText('search:left:x|search:right:x');
  }
);

test(
  'Transfer preserves bigint and rowKey-derived primitive values on transfer',
  async ({ page }) => {
    await control(page, 'Custom row key').check();
    await check(page, 'Bigint nine').click();
    await move(page).click();

    await expect(targets(page)).toHaveText('bigint:9,string:c,string:locked,string:missing');
    await expect(rows(page, true).first()).toHaveText('Bigint nine');
    await expect(check(page, 'Zero number')).toBeVisible();
    await expect(check(page, 'Zero string')).toBeVisible();
  }
);

test('Transfer oneWay removes enabled targets and hides the reverse action', async ({ page }) => {
  await control(page, 'One way').check();
  await expect(move(page, false)).toHaveCount(0);
  await expect(target(page).getByRole('checkbox')).toHaveCount(0);
  await expect(target(page).getByRole('button', { name: 'Удалить', exact: true }).nth(1))
    .toBeDisabled();
  await target(page).getByRole('button', { name: 'Удалить', exact: true }).first().click();

  await expect(targets(page)).toHaveText('string:locked,string:missing');
  await expect(events(page)).toHaveText('change:left:string:c=>string:locked,string:missing');
});

test(
  'Transfer oneWay remove-all clears selected target keys before publishing removal',
  async ({ page }) => {
    await button(page, 'Preselect transfer').click();
    await control(page, 'One way').check();
    await button(page, 'Clear transfer events').click();
    await dropdown(page, true).click();
    await page.getByRole('menuitem', { name: 'Удалить все данные', exact: true }).click();

    await expect(events(page)).toHaveText(
      'select:string:a,number:0/|change:left:string:c=>string:locked,string:missing'
    );
    await expect(targets(page)).toHaveText('string:locked,string:missing');
  }
);

test(
  'Transfer pagination defaults to ten rows and keeps each list page independent',
  async ({ page }) => {
    await control(page, 'Transfer pagination').selectOption('simple');
    await expect(rows(page)).toHaveCount(10);
    await expect(source(page).getByRole('textbox', { name: 'Страница', exact: true })).toHaveValue(
      '1'
    );
    await expect(header(page)).toHaveCount(0);
    await next(page).click();

    await expect(source(page).getByRole('textbox', { name: 'Страница', exact: true })).toHaveValue(
      '2'
    );
    await expect(rows(page).first()).toHaveText('Item 04');
    await expect(target(page).getByRole('textbox', { name: 'Страница', exact: true })).toHaveValue(
      '1'
    );
  }
);

test(
  'Transfer resets pagination after empty search and clamps pages when result count shrinks',
  async ({ page }) => {
    await control(page, 'Transfer pagination').selectOption('simple');
    await next(page).click();
    await next(page).click();
    await search(page).fill('absent');
    await expect(rows(page)).toHaveCount(0);
    await expect(source(page).locator('.ant-pagination')).toHaveCount(0);
    await search(page).fill('');

    await expect(source(page).getByRole('textbox', { name: 'Страница', exact: true })).toHaveValue(
      '1'
    );
    await expect(rows(page).first()).toHaveText('Alpha');
  }
);

test(
  'Transfer select-current skips disabled rows and select-all spans every filtered page',
  async ({ page }) => {
    await control(page, 'Transfer pagination').selectOption('simple');
    await dropdown(page).click();
    await page.getByRole('menuitem', { name: 'Выбрать текущую страницу', exact: true }).click();
    await expect(selection(page)).toHaveText(
      'string:a,string:b,string:e,number:0,string:0,bigint:9,string:item-1,string:item-2,string:item-3'
    );
    await dropdown(page).click();
    await page.getByRole('menuitem', { name: 'Выбрать все данные', exact: true }).click();

    await expect(source(page).locator('.ant-transfer-list-header-selected')).toHaveText(
      '30/31 элем.'
    );
    await expect(check(page, 'Disabled')).not.toBeChecked();
  }
);

test('Transfer invert-current preserves selections outside the visible page', async ({ page }) => {
  await control(page, 'Transfer pagination').selectOption('simple');
  await check(page, 'Alpha').click();
  await next(page).click();
  await dropdown(page).click();
  await page.getByRole('menuitem', { name: 'Инвертировать выбор', exact: true }).click();
  await expect(source(page).locator('.ant-transfer-list-header-selected')).toHaveText(
    '11/31 элем.'
  );
  await dropdown(page).click();
  await page.getByRole('menuitem', { name: 'Инвертировать выбор', exact: true }).click();

  await expect(selection(page)).toHaveText('string:a');
});

test(
  'Transfer simple pager supports Enter, ArrowUp, ArrowDown and clamped blur',
  async ({ page }) => {
    await control(page, 'Transfer pagination').selectOption('simple');
    const input = source(page).getByRole('textbox', { name: 'Страница', exact: true });
    await input.fill('3');
    await input.press('Enter');
    await expect(rows(page).first()).toHaveText('Item 14');
    await input.press('ArrowUp');
    await expect(input).toHaveValue('2');
    await input.press('ArrowDown');
    await expect(input).toHaveValue('3');
    await input.fill('999');
    await input.blur();
    await expect(input).toHaveValue('4');
    await expect(rows(page)).toHaveText(['Item 24']);
  }
);

test(
  'Transfer normal pagination supports compact buffers and three-page jumps',
  async ({ page }) => {
    await control(page, 'Fixed page size').check();
    await control(page, 'Transfer pagination').selectOption('normal');
    await expect(source(page).locator('.ant-pagination-item')).toHaveText(
      ['1', '2', '3', '4', '5', '11']
    );
    await control(page, 'Fewer page items').check();
    await expect(source(page).locator('.ant-pagination-item')).toHaveText(['1', '2', '3', '11']);
    await source(page).getByRole('button', { name: 'Следующие страницы', exact: true }).click();

    await expect(source(page).getByRole('button', { name: 'Страница 4', exact: true }))
      .toHaveAttribute('aria-current', 'page');
    await expect(rows(page).first()).toHaveText('Item 03');
  }
);

test(
  'Transfer changes uncontrolled page size through its native Select composition',
  async ({ page }) => {
    await control(page, 'Page size changer').check();
    await control(page, 'Transfer pagination').selectOption('simple');
    await source(page).getByRole('combobox', { name: 'Записей на странице', exact: true }).click();
    await page.getByRole('option', { name: '50 / стр.', exact: true }).click();

    await expect(rows(page)).toHaveCount(31);
    await expect(next(page)).toBeDisabled();
  }
);

test(
  'Transfer custom body receives filtered data, callbacks and selected keys without pagination',
  async ({ page }) => {
    await control(page, 'Transfer pagination').selectOption('simple');
    await control(page, 'Custom transfer body').check();
    await expect(root(page).locator('.ant-pagination')).toHaveCount(0);
    await expect(page.getByTestId('custom-left')).toContainText('left:31/0');
    await button(page, 'Custom Alpha').click();
    await expect(button(page, 'Custom Alpha')).toHaveAttribute('aria-pressed', 'true');
    await search(page).fill('Beta');
    await expect(page.getByTestId('custom-left')).toContainText('left:1/1');
    await button(page, 'Custom select all left').click();
    await move(page).click();

    await expect(targets(page)).toHaveText(
      'string:a,string:b,string:c,string:locked,string:missing'
    );
  }
);

test(
  'Transfer custom body invert keeps selection because default page items are absent',
  async ({ page }) => {
    await control(page, 'Custom transfer body').check();
    await button(page, 'Custom Alpha').click();
    await dropdown(page).click();
    await page.getByRole('menuitem', { name: 'Инвертировать выбор', exact: true }).click();

    await expect(selection(page)).toHaveText('string:a');
    await expect(button(page, 'Custom Alpha')).toHaveAttribute('aria-pressed', 'true');
  }
);

test(
  'Transfer retains the current page while pagination is temporarily hidden',
  async ({ page }) => {
    await control(page, 'Transfer pagination').selectOption('simple');
    await next(page).click();
    await control(page, 'Transfer pagination').selectOption('off');
    await expect(rows(page)).toHaveCount(31);
    await control(page, 'Transfer pagination').selectOption('simple');

    await expect(source(page).getByRole('textbox', { name: 'Страница', exact: true }))
      .toHaveValue('2');
    await expect(rows(page).first()).toHaveText('Item 04');
  }
);

test(
  'Transfer resets uncontrolled page size after an empty default list unmounts',
  async ({ page }) => {
    await control(page, 'Page size changer').check();
    await control(page, 'Transfer pagination').selectOption('simple');
    await source(page).getByRole('combobox', { name: 'Записей на странице', exact: true }).click();
    await page.getByRole('option', { name: '50 / стр.', exact: true }).click();
    await expect(rows(page)).toHaveCount(31);
    await search(page).fill('absent');
    await expect(rows(page)).toHaveCount(0);
    await search(page).fill('');

    await expect(rows(page)).toHaveCount(10);
    await expect(source(page).getByRole('combobox', { name: 'Записей на странице', exact: true }))
      .toHaveValue('10 / стр.');
  }
);

test(
  'Transfer fixed page size rejects inner size changes until its owner updates the prop',
  async ({ page }) => {
    await control(page, 'Fixed page size').check();
    await control(page, 'Page size changer').check();
    await control(page, 'Transfer pagination').selectOption('simple');
    await source(page).getByRole('combobox', { name: 'Записей на странице', exact: true }).click();
    await page.getByRole('option', { name: '50 / стр.', exact: true }).click();

    await expect(rows(page)).toHaveCount(3);
    await expect(source(page).getByRole('combobox', { name: 'Записей на странице', exact: true }))
      .toHaveValue('3 / стр.');
    await control(page, 'Transfer page size').fill('5');
    await expect(rows(page)).toHaveCount(5);
  }
);

test('Transfer footer receives physical direction and full per-section props', async ({ page }) => {
  await control(page, 'Transfer footer').check();
  await button(page, 'Preselect transfer').click();
  await expect(page.getByTestId('footer-left')).toHaveText('left:31/2');
  await expect(page.getByTestId('footer-right')).toHaveText('right:2/1');
  await control(page, 'Right to left').check();

  await expect(source(page).getByTestId('footer-right')).toHaveText('right:31/2');
  await expect(target(page).getByTestId('footer-left')).toHaveText('left:2/1');
});

test(
  'Transfer custom actions preserve own disabled and callback-before-move even after preventDefault',
  async ({ page }) => {
    await control(page, 'Custom transfer actions').check();
    await control(page, 'Disable custom action').check();
    await check(page, 'Alpha').click();
    await expect(button(page, 'Custom move')).toBeDisabled();
    await control(page, 'Disable custom action').uncheck();
    await control(page, 'Prevent custom click').check();
    await button(page, 'Clear transfer events').click();
    await button(page, 'Custom move').click();

    await expect(events(page)).toHaveText(
      'custom-action|select:/|change:right:string:a=>string:a,string:c,string:locked,string:missing'
    );
    await button(page, 'Extra action').click();
    await expect(events(page)).toContainText('|extra-action');
  }
);

test('Transfer showSelectAll hides both controls and keeps counts/titles', async ({ page }) => {
  await control(page, 'Header selection').uncheck();

  await expect(header(page)).toHaveCount(0);
  await expect(dropdown(page)).toHaveCount(0);
  await expect(source(page).locator('.ant-transfer-list-header-selected')).toHaveText('31 элем.');
  await expect(source(page).locator('.ant-transfer-list-header-title')).toHaveText('Source');
});

test(
  'Transfer handles custom count callbacks, zero labels and false/empty fallbacks',
  async ({ page }) => {
    await control(page, 'Transfer label').selectOption('zero');
    await expect(source(page).locator('.ant-transfer-list-header-selected')).toHaveText('0');
    await expect(target(page).locator('.ant-transfer-list-header-selected')).toHaveText('0');
    await control(page, 'Transfer label').selectOption('false');
    await expect(source(page).locator('.ant-transfer-list-header-selected')).toHaveText('31 элем.');
    await control(page, 'Transfer label').selectOption('custom');
    await check(page, 'Alpha').click();
    await expect(source(page).locator('.ant-transfer-list-header-selected')).toHaveText('1 of 31');
  }
);

test(
  'Transfer semantic classes/styles preserve source nested-slot and root style priorities',
  async ({ page }) => {
    await control(page, 'Transfer semantics').check();

    await expect(root(page)).toHaveClass(/context-root/);
    await expect(root(page)).toHaveClass(/local-disabled-false/);
    await expect(root(page)).toHaveCSS('padding', '4px');
    await expect(root(page)).toHaveCSS('color', 'rgb(0, 128, 0)');
    await expect(source(page)).toHaveCSS('width', '215px');
    await expect(target(page)).toHaveCSS('width', '214px');
    await expect(rows(page).first()).toHaveClass(
      /context-item.*local-item.*context-source.*local-source/
    );
    await expect(rows(page, true).first()).toHaveClass(/local-target/);
    await expect(rows(page).first()).toHaveCSS('color', 'rgb(0, 0, 255)');
  }
);

test(
  'Transfer inherits locale and disabled but lets explicit false enable native controls',
  async ({ page }) => {
    await control(page, 'English locale').check();
    await expect(search(page)).toHaveAttribute('placeholder', 'Search here');
    await expect(source(page).locator('.ant-transfer-list-header-selected')).toHaveText('31 items');
    await control(page, 'Disable all components').check();
    await expect(check(page, 'Alpha')).toBeDisabled();
    await expect(search(page)).toBeDisabled();
    await expect(dropdown(page)).toBeDisabled();
    await control(page, 'Transfer disabled').selectOption('false');
    await check(page, 'Alpha').click();

    await expect(move(page)).toBeEnabled();
    await expect(check(page, 'Disabled')).toBeDisabled();
  }
);

test(
  'Transfer cleans selection after data removal without publishing selection events',
  async ({ page }) => {
    await check(page, 'Alpha').click();
    await button(page, 'Clear transfer events').click();
    await button(page, 'Drop Alpha').click();

    await expect(check(page, 'Alpha')).toHaveCount(0);
    await expect(move(page)).toBeDisabled();
    await expect(events(page)).toHaveText('');
  }
);

test(
  'Transfer follows externally reordered target keys while retaining source data order',
  async ({ page }) => {
    await button(page, 'Reorder transfer targets').click();

    await expect(rows(page, true)).toHaveText(['Locked', 'Charlie', 'Alpha']);
    await expect(rows(page).first()).toHaveText('Beta');
  }
);

test(
  'Transfer empty content arrays follow physical sides in RTL and disable selection',
  async ({ page }) => {
    await control(page, 'Empty transfer').check();
    await control(page, 'Custom empty content').check();
    await expect(source(page)).toContainText('Empty physical left');
    await expect(target(page)).toContainText('Empty physical right');
    await expect(header(page)).toBeDisabled();
    await control(page, 'Right to left').check();

    await expect(source(page)).toContainText('Empty physical right');
    await expect(target(page)).toContainText('Empty physical left');
  }
);

test(
  'Transfer dropdown supports native keyboard entry, Escape and focus return',
  async ({ page }) => {
    await dropdown(page).focus();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('menuitem', { name: 'Выбрать все данные', exact: true }))
      .toBeFocused();
    await page.keyboard.press('Escape');

    await expect(dropdown(page)).toBeFocused();
    await expect(page.getByRole('menu')).toHaveCount(0);
  }
);

test('Transfer search and list scrolling keep distinct logical callbacks', async ({ page }) => {
  await source(page).locator('ul.ant-transfer-list-content').evaluate(list => list.scrollTop = 300);
  await expect(events(page)).toContainText('scroll:left');
  await search(page, true).fill('Charlie');

  await expect(events(page)).toContainText('search:right:Charlie');
  await expect(rows(page, true)).toHaveText(['Charlie']);
});

test('Transfer native form reset preserves model selection and the current search', async ({ page }) => {
  await check(page, 'Alpha').click();
  await search(page).fill('Alpha');
  await button(page, 'Clear transfer events').click();
  await page.getByTestId('transfer-form').evaluate(form => (form as HTMLFormElement).reset());

  await expect(search(page)).toHaveValue('Alpha');
  await expect(rows(page)).toHaveText(['Alpha']);
  await expect(events(page)).toHaveText('');
  await expect(move(page)).toBeEnabled();
  // В upstream native reset сбрасывает checked DOM, но не React selection/checked class.
  await expect(check(page, 'Alpha')).not.toBeChecked();
  await expect(rows(page).first()).toHaveClass(/content-item-checked/);
});

test(
  'Transfer preserves FormItem status while isolating internal native names and IDs',
  async ({ page }) => {
    const field = page.getByTestId('transfer-field-root');
    await button(page, 'Validate transfer').click();
    await expect(field).toHaveClass(/ant-transfer-status-error/);
    await expect(field.locator('.ant-input-status-error')).toHaveCount(2);
    await expect(field.locator('input[name], input[id], input[required]')).toHaveCount(0);
    expect(await page.getByTestId('transfer-library-form').evaluate(form =>
      [...new FormData(form as HTMLFormElement)])).toEqual([]);
    await control(page, 'Disable transfer form').check();
    await expect(field.getByRole('checkbox', { name: 'Form row', exact: true })).toBeDisabled();
  }
);

test(
  'Transfer status, dark tokens, compact height and RTL arrows update in place',
  async ({ page }) => {
    await expect(rows(page).first()).toHaveCSS('min-height', '32px');
    const light = await source(page).locator('.ant-transfer-list-header')
      .evaluate(node => getComputedStyle(node).backgroundColor);
    await control(page, 'Dark transfer').check();
    await expect.poll(() => source(page).locator('.ant-transfer-list-header')
      .evaluate(node => getComputedStyle(node).backgroundColor)).not.toBe(light);
    await control(page, 'Compact transfer').check();
    await expect(rows(page).first()).toHaveCSS('min-height', '28px');
    for (const status of ['success', 'validating']) {
      await control(page, 'Transfer status').selectOption(status);
      await expect(root(page)).toHaveClass(new RegExp(`ant-transfer-status-${status}`));
    }
    await control(page, 'Transfer status').selectOption('error');
    await expect(root(page)).toHaveClass(/ant-transfer-status-error/);
    await control(page, 'Right to left').check();
    await expect(root(page)).toHaveCSS('direction', 'rtl');
    await expect(move(page).locator('path')).toHaveAttribute('d', 'm15 6-6 6 6 6');
  }
);
