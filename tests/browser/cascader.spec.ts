import type { Page } from '@playwright/test';
import { test, expect } from './test';

const control = (page: Page, name: string) => page.getByLabel(name, { exact: true });
const button = (page: Page, name: string) => page.getByRole('button', { name, exact: true });
const input = (page: Page) => page.getByRole('combobox', { name: 'Path', exact: true });
const root = (page: Page) => page.locator('.fixture-cascader');
const popup = (page: Page) => page.locator('.ant-cascader-dropdown:visible');
const row = (page: Page, name: string) => popup(page).getByRole('menuitemcheckbox', {
  name, exact: true
});
const events = (page: Page) => control(page, 'Path events');
const owner = (page: Page) => control(page, 'Path value');
const select = (page: Page, name: string) => page.getByRole('combobox', { name, exact: true });
const tags = (page: Page) => root(page).locator('[data-cascader-tag]:not([aria-hidden="true"])');

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=cascader');
  await expect(input(page)).toBeVisible();
});

test('Cascader opens source columns without selecting an intermediate path', async ({ page }) => {
  await expect(control(page, 'Path ref')).toHaveText('DIV/INPUT');
  await expect(input(page)).toHaveJSProperty('readOnly', true);
  await input(page).click();
  await row(page, 'Asia').click();
  await row(page, 'China').click();

  await expect(popup(page).getByRole('menu')).toHaveCount(3);
  await expect(owner(page)).toHaveText('[]');
  await expect(events(page)).toHaveText('open:true');
  await expect(input(page)).toBeFocused();
  await expect(row(page, 'Disabled branch')).toBeDisabled();
});

test('Cascader publishes the full path with original option references and closes after a leaf', async ({ page }) => {
  await input(page).click();
  await row(page, 'Asia').click();
  await row(page, 'China').click();
  await row(page, 'Hangzhou').click();

  await expect(owner(page)).toHaveText('["asia","china","hangzhou"]');
  await expect(root(page)).toContainText('Asia / China / Hangzhou');
  await expect(control(page, 'Path identity')).toHaveText('true');
  await expect(popup(page)).toHaveCount(0);
  await expect(events(page)).toHaveText('open:true|change:["asia","china","hangzhou"]|open:false');
  await expect(input(page)).toBeFocused();
});

test('Cascader keeps numeric zero and emits another change for the same selected path', async ({ page }) => {
  await input(page).click();
  await row(page, 'Zero').click();
  await input(page).click();
  await row(page, 'Zero').click();

  await expect(owner(page)).toHaveText('[0]');
  await expect(root(page)).toContainText('Zero');
  await expect(events(page)).toHaveText('open:true|change:[0]|open:false|open:true|change:[0]|open:false');
});

test('Cascader preserves a controlled owner that rejects changes', async ({ page }) => {
  await control(page, 'Accept paths').uncheck();
  await input(page).click();
  await row(page, 'Zero').click();

  await expect(owner(page)).toHaveText('[]');
  await expect(root(page)).toContainText('Choose path');
  await expect(events(page)).toContainText('change:[0]');
  await expect(popup(page)).toHaveCount(0);
});

test('Cascader clears a single path with undefined after onClear and preserves focus', async ({ page }) => {
  await button(page, 'Set owner path').click();
  await root(page).getByRole('button', { name: 'Очистить', exact: true }).click();

  await expect(root(page)).toContainText('Choose path');
  await expect(events(page)).toHaveText('clear|change:undefined');
  await expect(control(page, 'Path published')).toHaveText('[null,null]');
  await expect(input(page)).toBeFocused();
});

test('Cascader reads defaultValue once and resets local state when controlled value is released', async ({ page }) => {
  await button(page, 'Set owner path').click();
  await control(page, 'Controlled paths').uncheck();
  await expect(root(page)).toContainText('Choose path');
  await button(page, 'Change path default').click();
  await expect(root(page)).toContainText('Choose path');
  await button(page, 'Remount cascader').click();

  await expect(root(page)).toContainText('Zero');
  await expect(events(page)).toBeEmpty();
});

test('Cascader keeps a rejected controlled popup closed and accepts later owner updates', async ({ page }) => {
  await control(page, 'Controlled path popup').check();
  await control(page, 'Accept path popup').uncheck();
  await input(page).click();

  await expect(popup(page)).toHaveCount(0);
  await expect(events(page)).toHaveText('open:true');
  await control(page, 'Path popup open').check();

  await expect(popup(page)).toBeVisible();
  await expect(input(page)).toHaveAttribute('aria-expanded', 'true');
});

test('Cascader selects intermediate paths on click and waits for a leaf or double click to close', async ({ page }) => {
  await control(page, 'Select intermediate paths').check();
  await input(page).click();
  await row(page, 'Asia').click();

  await expect(owner(page)).toHaveText('["asia"]');
  await expect(popup(page)).toBeVisible();
  await row(page, 'China').dblclick();

  await expect(owner(page)).toHaveText('["asia","china"]');
  await expect(popup(page)).toHaveCount(0);
});

test('Cascader expands on hover and closes a changeOnSelect click without choosing a child', async ({ page }) => {
  await control(page, 'Expand paths on hover').check();
  await control(page, 'Select intermediate paths').check();
  await input(page).click();
  await row(page, 'Asia').hover();
  await row(page, 'China').hover();

  await expect(popup(page).getByRole('menu')).toHaveCount(3);
  await expect(owner(page)).toHaveText('[]');
  await row(page, 'China').click();

  await expect(owner(page)).toHaveText('["asia","china"]');
  await expect(popup(page)).toHaveCount(0);
});

test('Cascader conducts parent checkboxes, keeps missing values and displays SHOW_CHILD leaves', async ({ page }) => {
  await control(page, 'Multiple paths').check();
  await button(page, 'Set missing path').click();

  await expect(tags(page)).toHaveText(['0', 'Asia']);
  await input(page).click();
  await expect(row(page, 'Asia')).toHaveAttribute('aria-checked', 'true');
  await row(page, 'Asia').locator('.ant-cascader-checkbox').click();

  await expect(owner(page)).toHaveText('[["missing",0]]');
  await expect(popup(page)).toBeVisible();
  await row(page, 'Asia').locator('.ant-cascader-checkbox').click();
  await control(page, 'Show child paths').check();

  await expect(tags(page)).toHaveText(['0', 'Japan', 'Hangzhou', 'Nanjing']);
});

test('Cascader expands multiple parent content without checking it and cleans a checked leaf', async ({ page }) => {
  await control(page, 'Multiple paths').check();
  await input(page).click();
  await row(page, 'Asia').click();

  await expect(owner(page)).toHaveText('[]');
  await row(page, 'China').locator('.ant-cascader-checkbox').click();
  await expect(owner(page)).toHaveText('[["asia","china"]]');
  await row(page, 'China').click();
  await row(page, 'Hangzhou').click();

  await expect(owner(page)).toHaveText('[["asia","china","nanjing"]]');
  await expect(tags(page)).toHaveText(['Nanjing']);
  await expect(row(page, 'China').locator('.ant-cascader-checkbox')).toHaveClass(/indeterminate/);
  await expect(row(page, 'Locked leaf')).toBeDisabled();
  await row(page, 'No checkbox').click();
  await expect(owner(page)).toHaveText('[["asia","china","nanjing"]]');
});

test('Cascader removes a missing tag and clears multiple selection with an empty array', async ({ page }) => {
  await control(page, 'Multiple paths').check();
  await button(page, 'Set missing path').click();
  await tags(page).first().getByRole('button').click();

  await expect(owner(page)).toHaveText('[["asia"]]');
  await button(page, 'Clear path events').click();
  await root(page).getByRole('button', { name: 'Очистить', exact: true }).click();

  await expect(owner(page)).toHaveText('[]');
  await expect(events(page)).toHaveText('clear|change:[]');
});

test('Cascader navigates columns and wraps around disabled roots while keeping input focus', async ({ page }) => {
  await input(page).focus();
  await input(page).press('ArrowDown');
  await input(page).press('ArrowUp');

  await expect(row(page, 'Zero').locator('..')).toHaveClass(/item-active/);
  const activeId = await input(page).getAttribute('aria-activedescendant');
  await expect(row(page, 'Zero')).toHaveAttribute('id', activeId!);
  await input(page).press('ArrowDown');
  await input(page).press('ArrowRight');
  await input(page).press('ArrowRight');
  await input(page).press('Enter');

  await expect(owner(page)).toHaveText('["asia","china","hangzhou"]');
  await expect(input(page)).toBeFocused();
  await expect(control(page, 'Path submissions')).toHaveText('0');
});

test('Cascader keyboard selects a changeOnSelect parent and Escape closes without publishing', async ({ page }) => {
  await control(page, 'Select intermediate paths').check();
  await input(page).press('Enter');
  await input(page).press('ArrowDown');
  await input(page).press('Enter');

  await expect(owner(page)).toHaveText('["asia"]');
  await expect(popup(page)).toHaveCount(0);
  await input(page).press('Enter');
  await input(page).press('ArrowDown');
  await input(page).press('Escape');

  await expect(owner(page)).toHaveText('["asia"]');
  await expect(popup(page)).toHaveCount(0);
  await expect(input(page)).toBeFocused();
});

test('Cascader reverses column arrows in RTL and Backspace returns to the parent or closes', async ({ page }) => {
  await control(page, 'Right to left').check();
  await input(page).press('Enter');
  await input(page).press('ArrowDown');
  await input(page).press('ArrowLeft');

  await expect(row(page, 'China').locator('..')).toHaveClass(/item-active/);
  await expect(popup(page)).toHaveCSS('direction', 'rtl');
  await input(page).press('Backspace');
  await expect(row(page, 'Asia').locator('..')).toHaveClass(/item-active/);
  await input(page).press('Backspace');

  await expect(popup(page)).toHaveCount(0);
  await expect(owner(page)).toHaveText('[]');
});

test('Cascader keeps repeated search visible with an existing selected path', async ({ page }) => {
  await control(page, 'Search paths').check();
  await button(page, 'Set owner path').click();
  await input(page).fill('HANG');

  await expect(input(page)).toBeVisible();
  await expect(input(page)).toHaveCSS('color', 'rgba(0, 0, 0, 0.88)');
  expect((await input(page).boundingBox())!.height).toBeGreaterThan(0);
  await input(page).fill('Japan');

  await expect(input(page)).toHaveValue('Japan');
  await expect(input(page)).toBeVisible();
  await expect(owner(page)).toHaveText('["asia","china","hangzhou"]');
});

test('Cascader searches full paths and highlights original case without publishing on input', async ({ page }) => {
  await control(page, 'Search paths').check();
  await input(page).fill('HANG');

  await expect(row(page, 'Asia / China / Hangzhou')).toBeVisible();
  await expect(popup(page).locator('.ant-cascader-menu-item-keyword')).toHaveText(['Hang']);
  await expect(events(page)).toHaveText('search:HANG|open:true');
  await expect(owner(page)).toHaveText('[]');
  await input(page).press('ArrowDown');
  await input(page).press('Enter');

  await expect(owner(page)).toHaveText('["asia","china","hangzhou"]');
  await expect(input(page)).toHaveValue('');
  await expect(events(page)).not.toContainText('search:|');
});

test('Cascader preserves rejected controlled search text and accepts later input updates', async ({ page }) => {
  await control(page, 'Search paths').check();
  await control(page, 'Controlled path search').check();
  await control(page, 'Accept path search').uncheck();
  await input(page).fill('Hang');

  await expect(input(page)).toHaveValue('');
  await expect(events(page)).toContainText('search:Hang');
  await expect(row(page, 'Asia')).toBeVisible();
  await control(page, 'Accept path search').check();
  await input(page).fill('France');

  await expect(input(page)).toHaveValue('France');
  await expect(row(page, 'Europe / France')).toBeVisible();
});

test('Cascader includes parents in multiple search and respects autoClearSearchValue false', async ({ page }) => {
  await control(page, 'Multiple paths').check();
  await control(page, 'Search paths').check();
  await control(page, 'Clear path search on select').uncheck();
  await input(page).fill('China');
  await row(page, 'Asia / China').locator('.ant-cascader-checkbox').click();

  await expect(owner(page)).toHaveText('[["asia","china"]]');
  await expect(input(page)).toHaveValue('China');
  await expect(popup(page)).toBeVisible();
  await expect(tags(page)).toHaveText(['China']);
  await input(page).press('Tab');

  await expect(input(page)).toHaveValue('');
  await expect(events(page)).not.toContainText('search:|');
});

test('Cascader applies search filter, sort and limit before selecting original paths', async ({ page }) => {
  await control(page, 'Search paths').check();
  await control(page, 'Filter path values').check();
  await select(page, 'Search path limit').selectOption('1');
  await input(page).fill('a');

  await expect(popup(page).getByRole('menuitemcheckbox')).toHaveCount(1);
  await expect(row(page, 'Asia / China / Hangzhou')).toBeVisible();
  await control(page, 'Reverse path results').check();
  await input(page).click();
  await input(page).fill('a');

  await expect(row(page, 'Asia / No checkbox')).toBeVisible();
  await select(page, 'Search path limit').selectOption('0');
  await input(page).click();
  await input(page).fill('a');

  await expect(popup(page).getByRole('menuitemcheckbox')).toHaveCount(8);
});

test('Cascader keeps search disabled branches unselectable and renders empty results', async ({ page }) => {
  await control(page, 'Search paths').check();
  await input(page).fill('Hidden');

  await expect(row(page, 'Disabled branch / Hidden child')).toBeDisabled();
  await input(page).fill('no-such-path');

  await expect(popup(page).locator('.ant-empty')).toBeVisible();
  await expect(popup(page).getByRole('menuitemcheckbox')).toHaveAttribute('aria-disabled', 'true');
  await input(page).press('Enter');
  await expect(owner(page)).toHaveText('[]');
  await control(page, 'Styled cascader').check();
  await input(page).fill('no-such-path');

  await expect(popup(page).getByRole('menu')).toHaveClass(/local-path-list/);
  await expect(popup(page).locator('.ant-cascader-menu-item'))
    .toHaveCSS('color', 'rgb(30, 40, 50)');
});

test('Cascader suppresses an empty popup with null notFoundContent while preserving the query', async ({ page }) => {
  await control(page, 'Search paths').check();
  await control(page, 'Empty path content').check();
  await input(page).fill('no-such-path');

  await expect(input(page)).toHaveValue('no-such-path');
  await expect(popup(page)).toHaveCount(0);
  await input(page).fill('France');

  await expect(row(page, 'Europe / France')).toBeVisible();
});

test('Cascader uses custom field names for values, search and original callback options', async ({ page }) => {
  await control(page, 'Custom path fields').check();
  await control(page, 'Search paths').check();
  await input(page).fill('France');
  await row(page, 'Europe / France').click();

  await expect(owner(page)).toHaveText('["europe","france"]');
  await expect(control(page, 'Path identity')).toHaveText('true');
  await expect(root(page)).toContainText('Europe / France');
});

test('Cascader keeps lazy loading active after the returned Promise resolves until options change', async ({ page }) => {
  await control(page, 'Lazy path options').check();
  await input(page).click();
  await row(page, 'Lazy branch').click();

  await expect(events(page)).toContainText('load:lazy|load-promise-resolved');
  await expect(row(page, 'Lazy branch')).toHaveAttribute('aria-busy', 'true');
  await expect(owner(page)).toHaveText('[]');
  await popup(page).getByRole('button', { name: 'Finish lazy children', exact: true }).click();

  await expect(row(page, 'Loaded child')).toBeVisible();
  await expect(row(page, 'Lazy branch')).not.toHaveAttribute('aria-busy', 'true');
  await row(page, 'Loaded child').click();
  await expect(owner(page)).toHaveText('["lazy","child"]');
});

test('Cascader stops lazy loading for empty children and explicit leaf updates', async ({ page }) => {
  await control(page, 'Lazy path options').check();
  await input(page).click();
  await row(page, 'Empty branch').click();
  await popup(page).getByRole('button', { name: 'Finish empty children', exact: true }).click();

  await expect(row(page, 'Empty branch')).not.toHaveAttribute('aria-busy', 'true');
  await row(page, 'Lazy branch').click();
  await popup(page).getByRole('button', { name: 'Mark lazy leaf', exact: true }).click();

  await expect(row(page, 'Lazy branch')).not.toHaveAttribute('aria-busy', 'true');
  await row(page, 'Lazy branch').click();
  await expect(owner(page)).toHaveText('["lazy"]');
});

test('Cascader does not load lazy paths during search', async ({ page }) => {
  await control(page, 'Lazy path options').check();
  await control(page, 'Search paths').check();
  await input(page).fill('Lazy');
  await input(page).press('ArrowDown');
  await input(page).press('Enter');

  await expect(owner(page)).toHaveText('[]');
  await expect(popup(page)).toBeVisible();
  await control(page, 'Select intermediate paths').check();
  await input(page).fill('Lazy');
  await input(page).press('ArrowDown');
  await input(page).press('Enter');

  await expect(owner(page)).toHaveText('["lazy"]');
  await expect(events(page)).not.toContainText('load:');
});

test('Cascader inherits disabled and permits an explicit local override', async ({ page }) => {
  await control(page, 'Disable all components').check();

  await expect(input(page)).toBeDisabled();
  await expect(page.locator('.fixture-cascader-panel').getByRole('menuitemcheckbox').first())
    .toBeDisabled();
  await select(page, 'Path disabled').selectOption('false');
  await input(page).click();
  await row(page, 'Zero').click();

  await expect(owner(page)).toHaveText('[0]');
  await select(page, 'Path disabled').selectOption('true');
  await expect(input(page)).toBeDisabled();
  await expect(root(page).getByRole('button', { name: 'Очистить', exact: true })).toHaveCount(0);
});

test('Cascader inherits sizes and theme density with the source column dimensions', async ({ page }) => {
  await expect(root(page)).toHaveCSS('height', '32px');
  await select(page, 'Path size').selectOption('small');
  await expect(root(page)).toHaveCSS('height', '24px');
  await select(page, 'Path size').selectOption('large');
  await expect(root(page)).toHaveCSS('height', '40px');
  await select(page, 'Path size').selectOption('medium');
  await control(page, 'Compact cascader').check();
  await expect(root(page)).toHaveCSS('height', '28px');
  await input(page).click();

  await expect(popup(page).getByRole('menu')).toHaveCSS('height', '180px');
  await expect(popup(page).getByRole('menu')).toHaveCSS('padding-top', '4px');
});

test('Cascader resolves semantic slots and local styles above component config', async ({ page }) => {
  await control(page, 'Styled cascader').check();

  await expect(root(page)).toHaveClass(/context-path-root/);
  await expect(root(page)).toHaveClass(/local-path-medium-filled-false/);
  await expect(root(page)).toHaveCSS('color', 'rgb(50, 60, 70)');
  await expect(root(page)).toHaveCSS('border-top-color', 'rgb(1, 2, 3)');
  await expect(input(page)).toHaveClass(/local-path-input/);
  await input(page).click();

  await expect(popup(page)).toHaveClass(/context-path-popup/);
  await expect(popup(page)).toHaveClass(/local-path-popup/);
  await expect(popup(page)).toHaveClass(/local-semantic-popup/);
  await expect(popup(page)).toHaveCSS('padding-top', '2px');
  await expect(row(page, 'Asia').locator('..')).toHaveCSS('color', 'rgb(30, 40, 50)');
  await expect(popup(page).getByRole('menu')).toHaveCSS('min-width', '123px');
});

test('Cascader preserves legacy popup aliases and modern listItem style priority', async ({ page }) => {
  await control(page, 'Styled cascader').check();
  await control(page, 'Legacy path popup props').check();
  await input(page).click();

  await expect(popup(page)).toHaveClass(/legacy-path-popup/);
  await expect(popup(page)).toHaveCSS('padding-top', '3px');
  await expect(row(page, 'Asia').locator('..')).toHaveCSS('color', 'rgb(30, 40, 50)');
  await expect(events(page)).toContainText('legacy-open:true');
  await popup(page).getByRole('button', { name: 'Popup action', exact: true }).click();

  await expect(control(page, 'Path footer count')).toHaveText('1');
  await expect(input(page)).toBeFocused();
  await expect(popup(page)).toBeVisible();
});

test('Cascader supports native keyboard activation of clear and closes a single open popup', async ({ page }) => {
  await button(page, 'Set owner path').click();
  await input(page).click();
  await page.mouse.move(0, 0);
  await input(page).press('Tab');

  await expect(root(page).getByRole('button', { name: 'Очистить', exact: true })).toBeFocused();
  await expect(root(page).getByRole('button', { name: 'Очистить', exact: true }))
    .toHaveCSS('opacity', '1');
  await page.keyboard.press('Enter');

  await expect(owner(page)).toHaveText('[]');
  await expect(popup(page)).toHaveCount(0);
  await expect(input(page)).toBeFocused();
  await expect(events(page)).toContainText('clear|change:undefined');
  await expect(control(page, 'Path submissions')).toHaveText('0');
});

test('Cascader keeps a searchable single or multiple input open when clicked again', async ({ page }) => {
  await control(page, 'Search paths').check();
  await input(page).click();
  await input(page).click();

  await expect(popup(page)).toBeVisible();
  await control(page, 'Multiple paths').check();
  await input(page).click();
  await input(page).click();

  await expect(popup(page)).toBeVisible();
});

test('Cascader renders custom option, display and tag snippets without changing path values', async ({ page }) => {
  await control(page, 'Custom path content').check();
  await input(page).click();
  await row(page, 'Zero [0]').click();

  await expect(owner(page)).toHaveText('[0]');
  await expect(root(page).locator('.custom-cascader-display')).toHaveText('Zero');
  await control(page, 'Multiple paths').check();
  await control(page, 'Custom path tags').check();
  await input(page).click();
  await row(page, 'Zero [0]').click();

  await expect(root(page).locator('.custom-cascader-tag')).toBeVisible();
  await root(page).getByRole('button', { name: 'Remove custom path', exact: true }).click();
  await expect(owner(page)).toHaveText('[]');
});

test('Cascader uses snippets for custom hidden tag content and truncates default labels', async ({ page }) => {
  await control(page, 'Multiple paths').check();
  await button(page, 'Set owner path').click();
  await control(page, 'Truncate path tags').check();

  await expect(tags(page)).toHaveText(['Asi...']);
  await select(page, 'Path tag count').selectOption('0');
  await control(page, 'Custom hidden path content').check();

  await expect(tags(page)).toHaveCount(0);
  await expect(root(page).locator('.custom-cascader-rest')).toHaveText('Hidden 1: Asia');
});

test('Cascader measures responsive tags and restores them when the selector grows', async ({ page }) => {
  await control(page, 'Multiple paths').check();
  await button(page, 'Set owner path').click();
  await input(page).click();
  await row(page, 'Europe').locator('.ant-cascader-checkbox').click();
  await row(page, 'Zero').click();
  await control(page, 'Responsive path tags').check();

  await expect(tags(page)).toHaveCount(3);
  await control(page, 'Path width').fill('120');

  await expect.poll(() => tags(page).count()).toBeLessThan(3);
  await expect(root(page).locator('[data-cascader-rest]:not([aria-hidden="true"])')).toBeVisible();
  await control(page, 'Path width').fill('640');

  await expect(tags(page)).toHaveCount(3);
  await expect(root(page).locator('[data-cascader-rest]:not([aria-hidden="true"])')).toHaveCount(0);
  await expect(owner(page)).toHaveText('[["asia"],["europe"],[0]]');
});

test('Cascader gives custom native triggers handlers, ARIA and focus without an input ref', async ({ page }) => {
  await control(page, 'Custom trigger').check();
  const trigger = button(page, 'Custom path trigger');
  await expect(control(page, 'Path ref')).toHaveText('DIV/-');
  await trigger.click();
  await row(page, 'Zero').click();

  await expect(owner(page)).toHaveText('[0]');
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await trigger.press('Enter');
  await trigger.press('ArrowUp');
  await trigger.press('ArrowRight');
  await trigger.press('Enter');

  await expect(owner(page)).toHaveText('["europe","france"]');
});

test('Cascader preserves custom popup widths, clamps at the viewport and matches the selector', async ({ page }) => {
  await select(page, 'Path popup width').selectOption('240');
  await input(page).click();

  await expect(popup(page)).toHaveCSS('width', '240px');
  await select(page, 'Path popup width').selectOption('true');

  await expect(popup(page)).toHaveCSS('width', '360px');
  await page.setViewportSize({ width: 320, height: 700 });
  await input(page).scrollIntoViewIfNeeded();
  await row(page, 'Asia').click();
  await row(page, 'China').click();

  const bounds = await popup(page).boundingBox();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(320);
});

test('Cascader inherits and hides icons while Panel inherits icons without root semantic styles', async ({ page }) => {
  await control(page, 'Styled cascader').check();
  await control(page, 'Custom cascader icons').check();
  await input(page).click();

  await expect(root(page).locator('.ant-select-suffix .custom-cascader-icon')).toBeVisible();
  await expect(row(page, 'Asia').locator('.custom-cascader-icon')).toBeVisible();
  const panel = page.locator('.fixture-cascader-panel');
  await expect(panel.getByRole('menuitemcheckbox', { name: 'Asia', exact: true })
    .locator('.custom-cascader-icon')).toBeVisible();
  await expect(panel.locator('.local-path-entry')).toHaveCount(0);
  await expect(panel).not.toHaveClass(/context-path-root/);
  await control(page, 'Hide cascader icons').check();
  await input(page).click();

  await expect(root(page).locator('.ant-select-suffix')).toHaveCount(0);
  await expect(row(page, 'Asia').locator('.ant-cascader-menu-item-expand-icon')).toHaveCount(0);
});

test('Cascader uses dark tokens independently from the native selector variant', async ({ page }) => {
  await select(page, 'Path variant').selectOption('filled');
  const light = await root(page).evaluate(element => getComputedStyle(element).backgroundColor);
  await control(page, 'Dark cascader').check();
  await expect.poll(() => root(page).evaluate(element => getComputedStyle(element).backgroundColor))
    .not.toBe(light);
  await input(page).click();
  const background = await popup(page).evaluate(
    element => getComputedStyle(element).backgroundColor
  );

  expect(background).not.toBe('rgb(255, 255, 255)');
  await expect(row(page, 'Asia')).toBeVisible();
});

test('Cascader associates FormItem labels and descriptions with its native input', async ({ page }) => {
  const associated = page.getByRole('combobox', { name: /Associated path/ });
  await page.getByText('Associated path', { exact: true }).click();

  await expect(associated).toBeFocused();
  await expect(associated).toHaveAttribute('id', 'associated-path');
  await expect(associated).toHaveAttribute('aria-required', 'true');
  await expect(associated).toHaveAttribute('aria-describedby', 'associated-path-help');
  await associated.press('Tab');

  await expect(associated).toHaveAttribute('aria-invalid', 'true');
});

test('CascaderPanel expands and selects paths without creating a selector or popup', async ({ page }) => {
  const panel = page.locator('.fixture-cascader-panel');
  await panel.getByRole('menuitemcheckbox', { name: 'Asia', exact: true }).click();
  await panel.getByRole('menuitemcheckbox', { name: 'China', exact: true }).click();

  await expect(control(page, 'Panel value')).toBeEmpty();
  await panel.getByRole('menuitemcheckbox', { name: 'Nanjing', exact: true }).click();

  await expect(control(page, 'Panel value')).toHaveText('["asia","china","nanjing"]');
  await expect(panel.getByRole('menu')).toHaveCount(3);
  await expect(popup(page)).toHaveCount(0);
});

test('CascaderPanel supports native keyboard navigation and independent multiple checks', async ({ page }) => {
  const panel = page.locator('.fixture-cascader-panel');
  await panel.getByRole('menu').focus();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');

  await expect(control(page, 'Panel value')).toHaveText('["asia","china","hangzhou"]');
  await control(page, 'Multiple panel paths').check();
  await panel.getByRole('menuitemcheckbox', { name: 'Asia', exact: true })
    .locator('.ant-cascader-checkbox').click();

  await expect(control(page, 'Panel value')).toHaveText('[["asia"]]');
  await expect(panel.getByRole('menuitemcheckbox', { name: 'Hangzhou', exact: true }))
    .toHaveAttribute('aria-checked', 'true');
});

test('Cascader releases popup and measurement resources and clears refs on repeated unmounts', async ({ page }) => {
  await control(page, 'Multiple paths').check();
  await button(page, 'Set owner path').click();
  await control(page, 'Responsive path tags').check();
  await control(page, 'Controlled path popup').check();
  await control(page, 'Accept path popup').uncheck();
  await control(page, 'Path popup open').check();

  for (let iteration = 0; iteration < 3; iteration++) {
    await input(page).scrollIntoViewIfNeeded();
    await expect(popup(page)).toBeVisible();
    await control(page, 'Mount cascader').uncheck();
    await expect(control(page, 'Path ref')).toHaveText('-/-');
    await expect(page.locator('.ant-cascader-dropdown')).toHaveCount(0);
    await control(page, 'Path width').fill(String(240 + iteration * 40));
    await control(page, 'Mount cascader').check();
    await expect(control(page, 'Path ref')).toHaveText('DIV/INPUT');
  }
  await expect(owner(page)).toHaveText('[["asia"]]');
});

test('Cascader preserves an empty string path and points ARIA at its active option', async ({ page }) => {
  await button(page, 'Use blank path options').click();
  await input(page).press('Enter');
  await input(page).press('ArrowDown');
  const activeId = await input(page).getAttribute('aria-activedescendant');

  await expect(row(page, 'Blank')).toHaveAttribute('id', activeId!);
  await input(page).press('Enter');

  await expect(owner(page)).toHaveText('[""]');
  await expect(root(page)).toContainText('Blank');
});

test('Cascader custom tagRender also receives the non-closable maxTagCount summary', async ({ page }) => {
  await control(page, 'Multiple paths').check();
  await button(page, 'Set owner path').click();
  await control(page, 'Custom path tags').check();
  await select(page, 'Path tag count').selectOption('0');

  const rest = root(page).locator('[data-cascader-rest] .custom-cascader-tag');
  await expect(rest).toHaveAttribute('data-max-tag', 'true');
  await expect(rest).toContainText('+ 1 ...');
  await expect(rest.getByRole('button')).toHaveCount(0);
});

test('Cascader Backspace protects selected paths briefly after removing search text', async ({ page }) => {
  await page.clock.install();
  await control(page, 'Multiple paths').check();
  await button(page, 'Set owner path').click();
  await control(page, 'Search paths').check();
  await input(page).fill('x');
  await input(page).press('Backspace');
  await input(page).press('Backspace');

  await expect(owner(page)).toHaveText('[["asia"]]');
  await page.clock.runFor(251);
  await input(page).press('Backspace');

  await expect(owner(page)).toHaveText('[]');
});

test('Cascader preserves option data attributes and activates the source row padding', async ({ page }) => {
  await input(page).click();
  await popup(page).getByTestId('source-path-asia').click({ position: { x: 2, y: 2 } });
  await row(page, 'China').click();
  await row(page, 'Hangzhou').locator('..').click({ position: { x: 2, y: 2 } });

  await expect(owner(page)).toHaveText('["asia","china","hangzhou"]');
  await expect(input(page)).toBeFocused();
});

test('Cascader inherits Compact size and joins while the popup resets Compact context', async ({ page }) => {
  const compact = page.locator('.fixture-compact-cascader');
  await expect(compact).toHaveClass(/ant-select-compact-first-item/);
  await expect(compact).toHaveCSS('height', '24px');
  await page.getByRole('combobox', { name: 'Compact path', exact: true }).click();

  await expect(popup(page).getByRole('button', { name: 'Popup outside Compact', exact: true }))
    .toHaveCSS('height', '32px');
  await expect(popup(page)).not.toHaveClass(/compact-item/);
});

test('Cascader keeps the source path columns after a multiple search result click clears search', async ({ page }) => {
  await control(page, 'Multiple paths').check();
  await control(page, 'Search paths').check();
  await input(page).fill('Hangzhou');
  await row(page, 'Asia / China / Hangzhou').click();

  await expect(owner(page)).toHaveText('[["asia","china","hangzhou"]]');
  await expect(input(page)).toHaveValue('');
  await expect(popup(page).getByRole('menu')).toHaveCount(3);
  await expect(row(page, 'Hangzhou')).toHaveAttribute('aria-checked', 'true');
});

test('Cascader returns to root columns after a multiple keyboard search selection', async ({ page }) => {
  await control(page, 'Multiple paths').check();
  await input(page).click();
  await row(page, 'Europe').click();
  await control(page, 'Search paths').check();
  await input(page).fill('Hangzhou');
  await input(page).press('ArrowDown');
  await input(page).press('Enter');

  await expect(owner(page)).toHaveText('[["asia","china","hangzhou"]]');
  await expect(input(page)).toHaveValue('');
  await expect(popup(page).getByRole('menu')).toHaveCount(1);
});

test('Cascader starts from root columns for a single missing path with a known ancestor', async ({ page }) => {
  await button(page, 'Set missing path').click();
  await input(page).click();

  await expect(root(page)).toContainText('Asia / missing');
  await expect(popup(page).getByRole('menu')).toHaveCount(1);
  await expect(row(page, 'Asia').locator('..')).not.toHaveClass(/item-active/);
});

test('Cascader preserves source checkbox spacing around native row content', async ({ page }) => {
  await control(page, 'Multiple paths').check();
  await input(page).click();
  const gap = await row(page, 'Asia').evaluate(button => {
    const checkbox = button.querySelector('.ant-cascader-checkbox')!;
    const content = button.querySelector('.ant-cascader-menu-item-content')!;
    const range = button.ownerDocument.createRange();
    range.selectNodeContents(content);
    return range.getBoundingClientRect().left - checkbox.getBoundingClientRect().right;
  });

  expect(gap).toBe(8);
});

test('Cascader preserves object and explicit empty clear icons without inheriting context icons', async ({ page }) => {
  await button(page, 'Set owner path').click();
  const clear = root(page).getByRole('button', { name: 'Очистить', exact: true });
  await expect(clear.locator('svg')).toHaveCount(1);
  await select(page, 'Path clear icon').selectOption('object');
  await expect(clear).toHaveText('×');
  await control(page, 'Styled cascader').check();

  await expect(clear).toHaveText('×');
  await select(page, 'Path clear icon').selectOption('false');
  await expect(clear).toHaveText('×');
  await select(page, 'Path clear icon').selectOption('legacy-null');
  await expect(clear).toHaveText('×');
});

test('Cascader preserves native caret and selection arrows while editing a search query', async ({ page }) => {
  await control(page, 'Search paths').check();
  await input(page).fill('France');
  await input(page).press('ArrowDown');
  const active = await input(page).getAttribute('aria-activedescendant');
  await input(page).press('ArrowLeft');
  await input(page).press('Shift+ArrowLeft');

  const selection = await input(page).evaluate(element => {
    if (!(element instanceof HTMLInputElement)) throw new Error('Expected native input');
    return [element.selectionStart, element.selectionEnd];
  });
  expect(selection).toEqual([4, 5]);
  await expect(input(page)).toHaveValue('France');
  await expect(input(page)).toHaveAttribute('aria-activedescendant', active!);
  await expect(row(page, 'Europe / France')).toBeVisible();
  await expect(owner(page)).toHaveText('[]');
});
