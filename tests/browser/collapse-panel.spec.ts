import { test, expect } from './test';

const root = '[aria-label="Legacy sections"]';
test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=collapse-panel');
  await expect(page.getByRole('heading', { name: 'Legacy Collapse panels', exact: true }))
    .toBeVisible();
});

const first = '[data-collapse-trigger="1"]';
const second = '[data-collapse-trigger="2"]';
const draft = 'First legacy draft';

test('Collapse.Panel starts open from numeric keys, binds refs and retains fields and independent extra', async ({ page }) => {
  await expect(page.getByRole('textbox', { name: draft, exact: true })).toHaveValue('First draft');
  await expect(page.getByLabel('Legacy first native ref', { exact: true })).toHaveText('true');
  await expect(page.getByLabel('Legacy first object ref', { exact: true })).toHaveText('true');
  await page.getByRole('button', { name: 'Legacy extra action', exact: true }).click();
  await expect(page.locator(root).locator(first)).toHaveAttribute('aria-expanded', 'true');
  await page.getByRole('textbox', { name: draft, exact: true }).fill('Retained');
  await page.locator(root).locator(first).press('Space');
  await expect(page.getByRole('textbox', { name: draft, exact: true })).toHaveCount(0);
  await page.locator(root).locator(first).press('Enter');

  await expect(page.getByRole('textbox', { name: draft, exact: true })).toHaveValue('Retained');
  await expect(page.getByLabel('Legacy owner', { exact: true })).toHaveText('["1"]');
  await expect(page.getByLabel('Legacy changes', { exact: true })).toHaveText('["","1"]');
  await expect(page.getByLabel('Legacy extra actions', { exact: true })).toHaveText('1');
});

test('Collapse.Panel keeps field identity, focus and selection across reorder, theme and prefix changes', async ({ page }) => {
  const field = page.getByRole('textbox', { name: draft, exact: true });
  const original = await field.elementHandle();
  await field.fill('Retained draft');
  await field.evaluate(node => (node as HTMLInputElement).setSelectionRange(2, 7));
  await page.keyboard.press('F6');
  await page.getByRole('button', { name: 'Configure legacy Collapse', exact: true })
    .dispatchEvent('click');
  await page.getByRole('button', { name: 'Change legacy prefix', exact: true })
    .dispatchEvent('click');

  await expect(field).toBeFocused();
  await expect(field).toHaveValue('Retained draft');
  expect(await field.evaluate((node, previous) => node === previous, original)).toBe(true);
  expect(await field.evaluate(node => [(node as HTMLInputElement).selectionStart,
    (node as HTMLInputElement).selectionEnd])).toEqual([2, 7]);
  await expect(page.locator(root).locator(first)).toHaveCSS('padding-right', '23px');
  await expect(page.locator(root)).toHaveClass(/live-legacy/);
});

test('Collapse.Panel repairs focus after external collapse, disabled header, extra removal and panel removal', async ({ page }) => {
  await page.getByRole('textbox', { name: draft, exact: true }).focus();
  await page.keyboard.press('F7');
  await expect(page.locator(root).locator(first)).toBeFocused();
  await page.keyboard.press('F3');
  await expect(page.locator(root).locator(second)).toBeFocused();
  await page.keyboard.press('F3');
  await page.getByRole('button', { name: 'Legacy extra action', exact: true }).focus();
  await page.keyboard.press('F4');
  await expect(page.locator(root).locator(first)).toBeFocused();
  await page.keyboard.press('F5');
  await expect(page.locator(root).locator(second)).toBeFocused();
  await expect(page.getByLabel('Legacy first native ref', { exact: true })).toHaveText('false');
  await expect(page.getByLabel('Legacy first object ref', { exact: true })).toHaveText('false');
});

test('Collapse.Panel honors destroy/force, item precedence and clears refs when removed', async ({ page }) => {
  const field = page.getByRole('textbox', { name: draft, exact: true });
  await field.fill('Old draft');
  await page.getByLabel('Destroy legacy content', { exact: true }).check();
  await page.locator(root).locator(first).click();
  await expect(page.locator(root).locator('input')).toHaveCount(0);
  await page.locator(root).locator(first).click();
  await expect(field).toHaveValue('First draft');
  await page.getByLabel('Force legacy content', { exact: true }).check();
  await field.fill('Forced draft');
  await page.locator(root).locator(first).click();
  await expect(page.locator(root).locator('input')).toHaveCount(2);
  await page.locator(root).locator(first).click();
  await expect(field).toHaveValue('Forced draft');
  await page.getByLabel('Override legacy with items', { exact: true }).check();
  await expect(page.locator(root)).toHaveText('Items override');
  await expect(page.getByLabel('Legacy first object ref', { exact: true })).toHaveText('false');
  await page.getByLabel('Override legacy with items', { exact: true }).uncheck();
  await page.getByRole('button', { name: 'Toggle legacy mount', exact: true }).click();
  await expect(page.locator(root)).toHaveCount(0);
  await expect(page.getByLabel('Legacy first native ref', { exact: true })).toHaveText('false');
});

test('Collapse.Panel resets its native subtree and ref when its logical key changes', async ({ page }) => {
  await page.getByRole('textbox', { name: draft, exact: true }).fill('Old key draft');
  const previous = await page.locator(root).locator('[data-collapse-key="1"]').elementHandle();
  await page.getByRole('button', { name: 'Change legacy key', exact: true }).click();
  await page.getByRole('button', { name: 'Open renamed legacy panel', exact: true }).click();

  await expect(page.getByRole('textbox', { name: draft, exact: true })).toHaveValue('First draft');
  expect(await page.locator(root).locator('[data-collapse-key="renamed"]')
    .evaluate((node, old) => node === old, previous)).toBe(false);
  await expect(page.getByLabel('Legacy first object ref', { exact: true })).toHaveText('true');
});

test('Collapse.Panel leaves focus outside after an explicit blur followed by a reorder', async ({ page }) => {
  await page.getByRole('textbox', { name: draft, exact: true }).focus();
  await page.getByRole('textbox', { name: draft, exact: true })
    .evaluate(node => (node as HTMLInputElement).blur());
  await page.keyboard.press('F6');

  expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true);
});

test('Collapse.Panel keeps nested contexts independent and restores the outer header when hiding nested focus', async ({ page }) => {
  await page.getByLabel('Show nested legacy panels', { exact: true }).check();
  const nested = page.getByRole('group', { name: 'Nested legacy sections', exact: true });
  await nested.getByRole('button', { name: 'Nested legacy section', exact: true }).click();
  await nested.getByRole('textbox', { name: 'Nested legacy draft', exact: true }).fill('Inner edit');

  await expect(page.getByLabel('Legacy owner', { exact: true })).toHaveText('[1]');
  await expect(page.getByLabel('Legacy changes', { exact: true })).toHaveText('[]');
  await page.keyboard.press('F7');

  await expect(page.getByRole('button', { name: 'First legacy section', exact: true }))
    .toBeFocused();
  await page.getByRole('button', { name: 'First legacy section', exact: true }).click();
  await expect(nested.getByRole('textbox', { name: 'Nested legacy draft', exact: true }))
    .toHaveValue('Inner edit');
});
