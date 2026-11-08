import { test, expect } from './test';

test('Select accepts omitted options in single, multiple and tags with native forms and reset',
  async ({ page }) => {
    await page.goto('/?fixture=select-optional-options');
    await expect(page.getByRole('combobox', { name: 'Single without options', exact: true }))
      .toHaveValue('0');
    const input = page.getByRole('combobox', { name: 'Tags without options', exact: true });
    await input.fill('created');
    await input.press('Enter');
    const form = page.getByRole('form', { name: 'Optional Select native form', exact: true });

    expect(await form.evaluate(node => [...new FormData(node as HTMLFormElement)]))
      .toEqual([['single', '0'], ['multiple', 'kept'], ['tags', 'seed'], ['tags', 'created']]);
    await page.locator('[data-optional-tags] .clear').click();
    expect(await form.evaluate(node => (node as HTMLFormElement).checkValidity())).toBe(false);
    await page.getByRole('button', { name: 'Reset optional Select', exact: true }).click();
    await expect(page.getByRole('status', { name: 'Optional tags values', exact: true }))
      .toHaveText('["seed"]');
    expect(await form.evaluate(node => (node as HTMLFormElement).checkValidity())).toBe(true);
  });

test('Select retains cached labels and native values when remote options become omitted again',
  async ({ page }) => {
    await page.goto('/?fixture=select-optional-options');
    await page.getByRole('checkbox', { name: 'Supply remote options', exact: true }).check();
    await expect(page.locator('[data-optional-tags] .ant-select-selection-item-content'))
      .toHaveText('Loaded seed');
    await page.getByRole('checkbox', { name: 'Supply remote options', exact: true }).uncheck();
    await expect(page.locator('[data-optional-tags] .ant-select-selection-item-content'))
      .toHaveText('Loaded seed');
    await page.getByRole('checkbox', { name: 'Right to left', exact: true }).check();
    await page.getByRole('combobox', { name: 'Tags without options', exact: true }).click();
    await expect(page.getByRole('listbox', { name: 'Tags without options', exact: true }))
      .toHaveCSS('direction', 'rtl');
    await page.getByRole('checkbox', { name: 'Disable all components', exact: true }).check();
    await expect(page.getByRole('combobox', { name: 'Tags without options', exact: true }))
      .toBeDisabled();
    const form = page.getByRole('form', { name: 'Optional Select native form', exact: true });
    expect(await form.evaluate(node => [...new FormData(node as HTMLFormElement)])).toEqual([]);
  });
