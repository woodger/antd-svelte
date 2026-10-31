import type { Page } from '@playwright/test';
import { test, expect } from './test';

const control = (page: Page, name: string) => page.getByLabel(name, { exact: true });
const button = (page: Page, name: string) => page.getByRole('button', { name, exact: true });
const root = (page: Page) => page.getByTestId('pagination-root');
const pager = (page: Page) => root(page).locator('ul.ant-pagination');
const pageButton = (page: Page, value: number) => root(page).getByRole('button', {
  name: `Страница ${value}`,
  exact: true
});
const next = (page: Page) => root(page).getByRole('button', {
  name: 'Следующая страница',
  exact: true
});
const events = (page: Page) => control(page, 'Pager events');
const owner = (page: Page) => control(page, 'Pager owner');
const quick = (page: Page) => root(page).locator('.ant-pagination-options-quick-jumper input');
const simple = (page: Page) => root(page).locator('.ant-pagination-simple-pager input');
const changer = (page: Page) => root(page).getByRole('combobox');

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=pagination-features');
  await expect(root(page)).toBeVisible();
});

test('Pagination uses the source middle window and bound native navigation', async ({ page }) => {
  await expect(pager(page).locator('.ant-pagination-item')).toHaveText(['1', '5', '6', '7', '20']);
  await next(page).click();

  await expect(owner(page)).toHaveText('7:10');
  await expect(pageButton(page, 7)).toHaveAttribute('aria-current', 'page');
  await expect(events(page)).toHaveText('change:7:10');
  await expect(next(page)).toBeFocused();
});

test('Pagination jumps five pages or three with showLessItems', async ({ page }) => {
  await button(page, 'Следующие страницы').click();
  await expect(owner(page)).toHaveText('11:10');
  await control(page, 'Less page items').check();
  await button(page, 'Предыдущие страницы').click();

  await expect(owner(page)).toHaveText('8:10');
  await expect(pager(page).locator('.ant-pagination-item')).toHaveText(['1', '7', '8', '9', '20']);
});

test('Pagination can remove jump controls while preserving its end pages', async ({ page }) => {
  await control(page, 'Page jump buttons').uncheck();

  await expect(pager(page).locator('.ant-pagination-jump-prev')).toHaveCount(0);
  await expect(pager(page).locator('.ant-pagination-item'))
    .toHaveText(['1', '4', '5', '6', '7', '8', '20']);
});

test('Pagination showTitle removes titles without removing accessible names', async ({ page }) => {
  await control(page, 'Pagination titles').uncheck();

  await expect(root(page).locator('[title]')).toHaveCount(0);
  await expect(pageButton(page, 6)).toBeVisible();
});

test('Pagination simple mode commits Enter and native arrow keys', async ({ page }) => {
  await control(page, 'Pager mode').selectOption('simple');
  await expect(simple(page)).toHaveValue('6');
  await simple(page).fill('9');
  await simple(page).press('Enter');
  await expect(owner(page)).toHaveText('9:10');
  await simple(page).press('ArrowUp');
  await expect(owner(page)).toHaveText('8:10');
  await simple(page).press('ArrowDown');

  await expect(owner(page)).toHaveText('9:10');
  await expect(events(page)).toHaveText('change:9:10|change:8:10|change:9:10');
});

test('Pagination simple input restores invalid text and clamps numeric blur', async ({ page }) => {
  await control(page, 'Pager mode').selectOption('simple');
  await simple(page).fill('wrong');
  await expect(simple(page)).toHaveValue('6');
  await simple(page).fill('999');
  await button(page, 'Outside pager').click();

  await expect(owner(page)).toHaveText('20:10');
  await expect(simple(page)).toHaveValue('20');
});

test('Pagination source read-only simple mode contains no text input', async ({ page }) => {
  await control(page, 'Pager mode').selectOption('readonly');

  await expect(simple(page)).toHaveCount(0);
  await expect(pager(page).locator('.ant-pagination-simple-pager')).toHaveText('6/20');
  await next(page).click();
  await expect(pager(page).locator('.ant-pagination-simple-pager')).toHaveText('7/20');
});

test('Pagination keeps simple input drafts when unrelated paging props change', async ({ page }) => {
  await control(page, 'Pager mode').selectOption('simple');
  await simple(page).fill('9');

  // Внешнее обновление не должно подтверждать draft через blur.
  await control(page, 'Owner page size').evaluate(node => {
    (node as HTMLInputElement).value = '20';
    node.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await control(page, 'Pagination total').evaluate(node => {
    (node as HTMLInputElement).value = '250';
    node.dispatchEvent(new Event('input', { bubbles: true }));
  });

  await expect(simple(page)).toHaveValue('9');
  await expect(events(page)).toHaveText('');
  await simple(page).press('Enter');

  await expect(owner(page)).toHaveText('9:20');
  await expect(events(page)).toHaveText('change:9:20');
});

test('Pagination quick jumper commits Enter and clears the input', async ({ page }) => {
  await control(page, 'Quick jumper').selectOption('blur');
  await quick(page).fill('13');
  await quick(page).press('Enter');

  await expect(owner(page)).toHaveText('13:10');
  await expect(quick(page)).toHaveValue('');
  await expect(control(page, 'Pager range')).toHaveText('121–130 / 200');
});

test('Pagination quick blur commits outside and skips a direct page click', async ({ page }) => {
  await control(page, 'Quick jumper').selectOption('blur');
  await quick(page).fill('11');
  await button(page, 'Outside pager').click();
  await expect(owner(page)).toHaveText('11:10');
  await button(page, 'Clear pager events').click();
  await quick(page).fill('18');
  await pageButton(page, 12).click();

  await expect(owner(page)).toHaveText('12:10');
  await expect(events(page)).toHaveText('change:12:10');
  await expect(quick(page)).toHaveValue('');
});

test('Pagination quick jumper accepts digits only and keeps leading zero input', async ({ page }) => {
  await control(page, 'Quick jumper').selectOption('blur');
  await quick(page).fill('abc');
  await expect(quick(page)).toHaveValue('');
  await quick(page).fill('0009');
  await expect(quick(page)).toHaveValue('0009');
  await quick(page).press('Enter');

  await expect(owner(page)).toHaveText('9:10');
});

test('Pagination go button defers blur and commits its current quick value', async ({ page }) => {
  await control(page, 'Quick jumper').selectOption('button');
  await quick(page).fill('12');
  await button(page, 'Outside pager').click();
  await expect(owner(page)).toHaveText('6:10');
  await button(page, 'подтвердить').click();

  await expect(owner(page)).toHaveText('12:10');
  await expect(events(page)).toHaveText('change:12:10');
});

test('Pagination simple confirmation renders a custom Svelte label', async ({ page }) => {
  await control(page, 'Pager mode').selectOption('simple');
  await control(page, 'Quick jumper').selectOption('custom');
  await simple(page).fill('8');
  await button(page, 'Go now').click();

  await expect(owner(page)).toHaveText('8:10');
  await expect(events(page)).toHaveText('change:8:10');
});

test('Pagination simple mode retains the source quick jumper and confirmation', async ({ page }) => {
  await control(page, 'Pager mode').selectOption('simple');
  await control(page, 'Quick jumper').selectOption('button');
  await expect(simple(page)).toHaveValue('6');
  await quick(page).fill('11');
  await button(page, 'подтвердить').click();

  await expect(owner(page)).toHaveText('11:10');
  await expect(simple(page)).toHaveValue('11');
  await expect(quick(page)).toHaveValue('');
  await expect(events(page)).toHaveText('change:11:10');
});

test('Pagination read-only simple mode keeps editable quick navigation', async ({ page }) => {
  await control(page, 'Pager mode').selectOption('readonly');
  await control(page, 'Quick jumper').selectOption('blur');
  await quick(page).fill('12');
  await quick(page).press('Enter');

  await expect(owner(page)).toHaveText('12:10');
  await expect(pager(page).locator('.ant-pagination-simple-pager')).toHaveText('12/20');
  await expect(events(page)).toHaveText('change:12:10');
});

test('Pagination hides simple quick confirmation when the collection fits one page', async ({ page }) => {
  await control(page, 'Pager mode').selectOption('simple');
  await control(page, 'Quick jumper').selectOption('button');
  await control(page, 'Pagination total').fill('10');

  await expect(simple(page)).toHaveValue('1');
  await expect(quick(page)).toHaveCount(0);
  await expect(button(page, 'подтвердить')).toHaveCount(0);
});

test('Pagination size threshold and explicit flags preserve config precedence', async ({ page }) => {
  await control(page, 'Pagination total').fill('30');
  await expect(changer(page)).toHaveCount(0);
  await control(page, 'Pager semantics').check();
  await expect(changer(page)).toBeVisible();
  await expect(changer(page)).toHaveJSProperty('readOnly', true);
  await control(page, 'Size changer').selectOption('no');
  await expect(changer(page)).toHaveCount(0);
  await control(page, 'Size changer').selectOption('yes');
  await expect(changer(page)).toHaveJSProperty('readOnly', false);
});

test('Pagination string sizes retain the established normalization contract', async ({ page }) => {
  await control(page, 'String size options').check();
  await changer(page).click();

  await expect(page.getByRole('listbox').getByRole('option'))
    .toHaveText(['10 / стр.', '20 / стр.', '50 / стр.']);
});

test('Pagination size Select props retain source callback order', async ({ page }) => {
  await control(page, 'Size changer').selectOption('props');
  await control(page, 'Search size options').uncheck();
  await expect(changer(page)).toHaveJSProperty('readOnly', true);
  await changer(page).click();
  await page.getByRole('option', { name: '20 / стр.', exact: true }).click();

  await expect(owner(page)).toHaveText('6:20');
  await expect(events(page)).toHaveText('size:6:20|change:6:20|select:20');
});

test('Pagination size overrides Select props for built-in and legacy changers', async ({ page }) => {
  await control(page, 'Size changer').selectOption('props');
  await control(page, 'Pagination size').selectOption('large');

  await expect(root(page).locator('.ant-select')).toHaveClass(/ant-select-lg/);
  await expect(root(page).locator('.ant-select')).not.toHaveClass(/ant-select-sm/);
  await control(page, 'Legacy size changer').check();

  await expect(control(page, 'Custom page size')).toHaveAttribute('data-size', 'large');
});

test('Pagination custom size changer receives value, disabled and callback', async ({ page }) => {
  await control(page, 'Custom size changer').check();
  await control(page, 'Custom page size').fill('50');

  await expect(owner(page)).toHaveText('4:50');
  await expect(events(page)).toHaveText('size:6:50|change:4:50');
  await control(page, 'Disable all components').check();
  await expect(control(page, 'Custom page size')).toBeDisabled();
});

test('Pagination retains the deprecated custom size changer adapter', async ({ page }) => {
  await control(page, 'Legacy size changer').check();
  await expect(control(page, 'Custom page size')).toBeVisible();
  await control(page, 'Custom page size').fill('20');

  await expect(owner(page)).toHaveText('6:20');
});

test('Pagination legacy size adapter retains the configured Select callback', async ({ page }) => {
  await control(page, 'Legacy size changer').check();
  await control(page, 'Size changer').selectOption('props');
  await control(page, 'Custom page size').fill('20');

  await expect(events(page)).toHaveText('size:6:20|change:6:20|select:20');
});

test('Pagination itemRender receives working original controls and source pages', async ({ page }) => {
  await control(page, 'Custom pager items').check();
  await expect(page.getByTestId('render-prev-5')).toBeVisible();
  await expect(page.getByTestId('render-jump-next-11')).toBeVisible();
  await next(page).click();

  await expect(owner(page)).toHaveText('7:10');
  await expect(page.getByTestId('render-page-7')).toBeVisible();
});

test('Pagination custom native controls bind the provided handlers and disabled', async ({ page }) => {
  await control(page, 'Custom pager items').check();
  await control(page, 'Replace pager controls').check();
  await button(page, 'Custom Следующая страница').click();
  await expect(owner(page)).toHaveText('7:10');
  await control(page, 'Disable all components').check();

  await expect(button(page, 'Custom Следующая страница')).toBeDisabled();
});

test('Pagination supports controlled owner rejection through functional bindings', async ({ page }) => {
  await control(page, 'Strict owner pager').check();
  await control(page, 'Accept pager changes').uncheck();
  await next(page).click();

  await expect(owner(page)).toHaveText('6:10');
  await expect(pageButton(page, 6)).toHaveAttribute('aria-current', 'page');
  await expect(events(page)).toHaveText('change:7:10');
});

test('Pagination responds to external changes without publishing callbacks', async ({ page }) => {
  await control(page, 'Owner page').fill('18');
  await control(page, 'Owner page size').fill('20');

  await expect(pageButton(page, 10)).toHaveAttribute('aria-current', 'page');
  await expect(control(page, 'Pager range')).toHaveText('181–200 / 200');
  await expect(events(page)).toHaveText('');
});

test('Pagination restores focus when the next control becomes disabled', async ({ page }) => {
  await control(page, 'Owner page').fill('19');
  await next(page).click();

  await expect(pageButton(page, 20)).toBeFocused();
  await expect(next(page)).toBeDisabled();
});

test('Pagination align and custom icons update without affecting logical moves', async ({ page }) => {
  await control(page, 'Pagination alignment').selectOption('end');
  await control(page, 'Custom pager icons').check();
  await expect(pager(page)).toHaveCSS('justify-content', 'end');
  await expect(next(page)).toHaveText('→');
  await control(page, 'Right to left').check();
  await next(page).click();

  await expect(owner(page)).toHaveText('7:10');
  await expect(pager(page)).toHaveClass(/ant-pagination-rtl/);
});

test('Pagination locale aliases control navigation, quick fields and size labels', async ({ page }) => {
  await control(page, 'Source locale aliases').check();
  await control(page, 'Quick jumper').selectOption('button');
  await expect(root(page).getByRole('button', { name: 'Forward one', exact: true })).toBeVisible();
  await expect(root(page)).toContainText('Jump to');
  await expect(changer(page)).toHaveAttribute('aria-label', 'Batch size');
  await expect(changer(page)).toHaveValue('10 per batch');
  await expect(quick(page)).toHaveAttribute('aria-label', 'pages');
  await expect(button(page, 'Confirm page')).toBeVisible();
});

test('Pagination semantic slots preserve root and per-page priorities', async ({ page }) => {
  await control(page, 'Pager semantics').check();

  await expect(root(page)).toHaveClass(/context-root/);
  await expect(root(page)).toHaveClass(/local-size-none/);
  await expect(root(page)).toHaveCSS('padding', '4px');
  await expect(root(page)).toHaveCSS('color', 'rgb(0, 128, 0)');
  await expect(pager(page).locator('.ant-pagination-item').first())
    .toHaveClass(/context-page.*local-page/);
  await expect(pager(page).locator('.ant-pagination-item').first())
    .toHaveCSS('color', 'rgb(0, 0, 255)');
  await expect(pager(page).locator('.ant-pagination-prev'))
    .toHaveClass(/context-page.*local-page/);
  await expect(pager(page).locator('.ant-pagination-next'))
    .toHaveCSS('color', 'rgb(0, 0, 255)');
  await expect(pager(page).locator('.ant-pagination-jump-next'))
    .not.toHaveClass(/local-page/);
});

test('Pagination empty and one-page collections preserve normalized state', async ({ page }) => {
  await control(page, 'Pagination total').fill('0');

  await expect(pageButton(page, 1)).toBeDisabled();
  await expect(root(page).locator('[aria-current]')).toHaveCount(0);
  await expect(control(page, 'Pager range')).toHaveText('0–0 / 0');
  await control(page, 'Pager mode').selectOption('simple');
  await expect(pager(page).locator('.ant-pagination-simple-pager')).toHaveAttribute('title', '1/0');
  await control(page, 'Hide one-page pager').check();
  await expect(root(page)).toHaveCount(0);
});

test('Pagination inherits disabled state and lets explicit false enable controls', async ({ page }) => {
  await control(page, 'Disable all components').check();
  await expect(next(page)).toBeDisabled();
  await control(page, 'Pagination disabled').selectOption('false');
  await next(page).click();

  await expect(owner(page)).toHaveText('7:10');
});

test('Pagination dark compact and RTL preserve native focus and theme colors', async ({ page }) => {
  const original = await pageButton(page, 6).evaluate(node => getComputedStyle(node).color);
  await control(page, 'Dark pager').check();
  await control(page, 'Compact pager').check();
  await control(page, 'Right to left').check();
  await expect(pager(page)).toHaveClass(/ant-pagination-rtl/);
  await pageButton(page, 6).focus();
  await pageButton(page, 6).press('ArrowRight');
  await expect(pageButton(page, 6)).toBeFocused();
  await expect(pager(page).locator('.ant-pagination-item-6')).toHaveCSS('height', '28px');
  expect(original).not.toBe('');
});

test('Pagination reactive resources reconnect after repeated unmount', async ({ page }) => {
  await control(page, 'Responsive pager').check();
  await control(page, 'Mount pager').uncheck();
  await page.setViewportSize({ width: 480, height: 800 });
  await control(page, 'Mount pager').check();

  await expect(pager(page)).toHaveClass(/ant-pagination-mini/);
  await expect(pager(page)).not.toHaveClass(/ant-pagination-small/);
  await control(page, 'Mount pager').uncheck();
  await page.setViewportSize({ width: 1280, height: 800 });
  await control(page, 'Mount pager').check();
  await expect(pager(page)).toHaveClass(/ant-pagination-middle/);
});

test('Pagination responsive size defers to explicit context and local sizes', async ({ page }) => {
  await control(page, 'Responsive pager').check();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(pager(page)).toHaveClass(/ant-pagination-mini/);
  await expect(pager(page).locator('.ant-pagination-item-6')).toHaveCSS('height', '32px');
  await expect(changer(page)).toBeVisible();
  await control(page, 'Context pagination size').selectOption('middle');
  await expect(pager(page)).toHaveClass(/ant-pagination-middle/);
  await control(page, 'Pagination size').selectOption('large');
  await expect(pager(page)).toHaveClass(/ant-pagination-large/);
});
