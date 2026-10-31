import type { Page } from '@playwright/test';
import { test, expect } from './test';

const group = (page: Page) => page.getByRole('radiogroup', { name: 'Calendar mode buttons', exact: true });
const month = (page: Page) => group(page).getByRole('radio', { name: 'Button month', exact: true });
const label = (page: Page) => group(page).locator(':scope > label').first();
const select = (page: Page, name: string) => page.getByRole('combobox', { name, exact: true });
const control = (page: Page, name: string) => page.getByLabel(name, { exact: true });

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=radio-button');
  await expect(month(page)).toBeChecked();
});

test('RadioButton keeps a native radio value and publishes one group choice through FormData', async ({ page }) => {
  await expect(month(page)).toHaveAttribute('type', 'radio');
  await expect(group(page).locator(':scope > .ant-radio-button-wrapper')).toHaveCount(3);
  await expect(label(page)).toHaveClass(/ant-radio-button-wrapper-checked/);
  await group(page).getByText('Button year', { exact: true }).click();
  await page.getByRole('button', { name: 'Read button FormData', exact: true }).click();

  await expect(control(page, 'Radio button value')).toHaveText('year');
  await expect(control(page, 'Radio button events')).toHaveText('year');
  await expect(control(page, 'Radio button data')).toHaveText('[["period","year"]]');
  await expect(month(page)).not.toBeChecked();
});

test('RadioButton uses native arrows and skips disabled peers without submitting the form', async ({ page }) => {
  await control(page, 'Lock year radio button').check();
  await month(page).focus();
  await page.keyboard.press('ArrowRight');

  await expect(group(page).getByRole('radio', { name: 'Button day', exact: true })).toBeFocused();
  await expect(control(page, 'Radio button value')).toHaveText('day');
  await expect(control(page, 'Radio button data')).toHaveText('');
});

test('RadioButton inherits or yields to group optionType without replacing its input or focus', async ({ page }) => {
  const original = await month(page).elementHandle();
  await month(page).focus();
  await select(page, 'Radio button option type').evaluate((node: HTMLSelectElement) => {
    node.value = 'default';
    node.dispatchEvent(new Event('change', { bubbles: true }));
  });

  await expect(group(page).locator(':scope > .ant-radio-wrapper')).toHaveCount(3);
  await expect(month(page)).toBeFocused();
  expect(await month(page).evaluate((node, old) => node === old, original)).toBe(true);
  await select(page, 'Radio button option type').selectOption('inherit');

  await expect(group(page).locator(':scope > .ant-radio-button-wrapper')).toHaveCount(2);
  await expect(group(page).locator(':scope > .ant-radio-wrapper')).toHaveCount(1);
  await expect(month(page)).toBeChecked();
});

test('RadioButton gives nonempty options priority and restores snippet children for an empty list', async ({ page }) => {
  await control(page, 'Use radio button options').check();

  await expect(month(page)).toHaveCount(0);
  await expect(control(page, 'Radio button refs')).toHaveText('none/none');
  await group(page).getByText('Options week', { exact: true }).click();

  await expect(control(page, 'Radio button value')).toHaveText('week');
  await control(page, 'Use radio button options').uncheck();

  await expect(month(page)).toHaveCount(1);
  await expect(month(page)).not.toBeChecked();
  await expect(control(page, 'Radio button refs')).toHaveText('SPAN/INPUT');
});

test('RadioButton uses source heights and lets local size override the inherited size', async ({ page }) => {
  await expect(label(page)).toHaveCSS('height', '32px');
  await select(page, 'Radio button parent size').selectOption('small');

  await expect(label(page)).toHaveCSS('height', '24px');
  await select(page, 'Radio button size').selectOption('large');

  await expect(label(page)).toHaveCSS('height', '40px');
  await select(page, 'Radio button size').selectOption('middle');

  await expect(label(page)).toHaveCSS('height', '32px');
  await expect(label(page)).toHaveCSS('padding-inline-start', '15px');
  await control(page, 'Compact radio buttons').check();

  await expect(label(page)).toHaveCSS('padding-inline-start', '7px');
});

test('RadioButton solid and dark colors follow the inherited palette and preserve visible focus', async ({ page }) => {
  await select(page, 'Radio button style').selectOption('solid');
  await page.mouse.move(0, 0);

  await expect(label(page)).toHaveCSS('background-color', 'rgb(114, 46, 209)');
  await expect(label(page)).toHaveCSS('color', 'rgb(255, 255, 255)');
  await month(page).focus();

  await expect(label(page)).toHaveCSS('outline-style', 'solid');
  await control(page, 'Dark radio buttons').check();
  await page.mouse.move(0, 0);

  await expect(group(page).locator(':scope > label').nth(1))
    .toHaveCSS('background-color', 'rgb(20, 20, 20)');
  await expect(group(page).locator(':scope > label').nth(1))
    .toHaveCSS('color', 'rgba(255, 255, 255, 0.85)');
  await expect(label(page)).toHaveCSS('color-scheme', 'dark');
});

test('RadioButton block and vertical layouts distribute source borders and available width', async ({ page }) => {
  await control(page, 'Block radio buttons').check();

  await expect(group(page)).toHaveCSS('width', '360px');
  const widths = await group(page).locator(':scope > label').evaluateAll(nodes =>
    nodes.map(node => node.getBoundingClientRect().width)
  );
  expect(Math.max(...widths) - Math.min(...widths)).toBeLessThan(1);
  await control(page, 'Vertical radio buttons').check();

  await expect(label(page)).toHaveCSS('width', '360px');
  await expect(group(page)).toHaveCSS('flex-direction', 'column');
  await expect(label(page)).toHaveCSS('border-start-end-radius', '6px');
  await expect(label(page)).toHaveCSS('border-end-start-radius', '0px');
});

test('RadioButton preserves native reset and standalone checked binding', async ({ page }) => {
  await page.getByText('Standalone button', { exact: true }).click();
  await group(page).getByText('Button year', { exact: true }).click();
  await page.getByRole('button', { name: 'Read button FormData', exact: true }).click();

  await expect(control(page, 'Radio button data'))
    .toHaveText('[["period","year"],["standalone-button","yes"]]');
  await page.getByRole('button', { name: 'Reset button form', exact: true }).click();

  await expect(page.getByRole('radio', { name: 'Standalone button', exact: true })).not.toBeChecked();
  await expect(control(page, 'Radio button value')).toHaveText('undefined');
  await expect(group(page).getByRole('radio', { checked: true })).toHaveCount(0);
});

test('RadioButton exposes the source span and native input and clears both refs on unmount', async ({ page }) => {
  await expect(control(page, 'Radio button refs')).toHaveText('SPAN/INPUT');
  await page.getByRole('button', { name: 'Focus button ref', exact: true }).click();

  await expect(month(page)).toBeFocused();
  await control(page, 'Mount radio buttons').uncheck();

  await expect(group(page)).toHaveCount(0);
  await expect(control(page, 'Radio button refs')).toHaveText('none/none');
  await expect(control(page, 'Mount radio buttons')).toBeFocused();
});

test('RadioButton inherits RTL and existing group and standalone disabled precedence', async ({ page }) => {
  await control(page, 'Right to left').check();
  await control(page, 'Disable all components').check();

  await expect(group(page)).toHaveCSS('direction', 'rtl');
  await expect(month(page)).toBeEnabled();
  await expect(page.getByRole('radio', { name: 'Standalone button', exact: true })).toBeDisabled();
  await control(page, 'Disable radio buttons').check();

  await expect(month(page)).toBeDisabled();
  await expect(label(page)).toHaveClass(/ant-radio-button-wrapper-disabled/);
});

test('RadioButton styles direct Badge children in a vertical small group', async ({ page }) => {
  const badgeGroup = page.getByRole('radiogroup', { name: 'Badge radio buttons', exact: true });
  const first = badgeGroup.locator('.ant-radio-button-wrapper').first();
  const last = badgeGroup.locator('.ant-radio-button-wrapper').last();

  await expect(first).toHaveCSS('height', '24px');
  await expect(first).toHaveCSS('border-start-start-radius', '4px');
  await expect(first).toHaveCSS('border-end-start-radius', '0px');
  await expect(last).toHaveCSS('border-end-end-radius', '4px');
  await badgeGroup.getByText('Badge B', { exact: true }).click();

  await expect(badgeGroup.getByRole('radio', { name: 'Badge B', exact: true })).toBeChecked();
});
