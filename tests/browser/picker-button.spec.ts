import { test, expect } from './test';

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=picker-button');
  await expect(page.getByRole('heading', { name: 'Picker Button composition', exact: true }))
    .toBeVisible();
});

for (const kind of ['date', 'range', 'time', 'time-range']) {
  test(`${kind} confirmation inherits source Button tokens and config outside Compact`, async ({ page }) => {
    await page.getByLabel('Footer picker kind', { exact: true }).selectOption(kind);
    await page.getByRole('combobox', {
      name: kind.includes('range') ? 'Footer start' : 'Footer value', exact: true
    }).click();

    const button = page.getByRole('dialog').locator('.ant-picker-ok > button');
    await expect(button).toHaveClass(/source-picker-button/);
    await expect(button).toHaveClass(/footer-small-string/);
    await expect(button).toHaveClass(/ant-btn-round/);
    await expect(button).toHaveClass(/ant-btn-sm/);
    await expect(button).not.toHaveClass(/ant-btn-compact-item/);
    await expect(button).toHaveCSS('background-color', 'rgb(0, 185, 107)');
    await expect(button).toHaveCSS('font-size', '15px');
    await expect(button).toHaveCSS('font-weight', '600');
    await expect(button).toHaveCSS('outline-offset', '3px');

    await button.dispatchEvent('pointerdown');

    const output = page.getByLabel('Footer Wave reports', { exact: true });
    await expect(output).toContainText('"component":"Button"');
    const [report] = JSON.parse(await output.innerText());
    expect(report).toMatchObject({ component: 'Button', event: 'pointerdown', target: 'BUTTON',
      primary: '#1677ff' });
    await expect(page.getByLabel('Footer confirmations', { exact: true })).toHaveText('0');
    await expect(page.getByLabel('Footer submits', { exact: true })).toHaveText('0');
  });

  test(`${kind} confirmation keeps invalid drafts disabled and suppresses Wave`, async ({ page }) => {
    await page.getByLabel('Footer picker kind', { exact: true }).selectOption(kind);
    await page.getByLabel('Empty footer value', { exact: true }).check();
    await page.getByRole('combobox', {
      name: kind.includes('range') ? 'Footer start' : 'Footer value', exact: true
    }).click();
    const button = page.getByRole('dialog').locator('.ant-picker-ok > button');

    await expect(button).toBeDisabled();
    await button.dispatchEvent('pointerdown');
    await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() =>
      requestAnimationFrame(() => resolve()))));

    await expect(page.getByLabel('Footer Wave reports', { exact: true })).toHaveText('[]');
    await expect(page.getByLabel('Footer confirmations', { exact: true })).toHaveText('0');
  });
}

test('confirmation receives scalar locale text and honors Button autoInsertSpace', async ({ page }) => {
  await page.getByLabel('Chinese confirmation text', { exact: true }).check();
  await page.getByRole('combobox', { name: 'Footer value', exact: true }).click();
  const button = page.getByRole('dialog').locator('.ant-picker-ok > button');

  await expect(button).toHaveText('确 定');
  await expect(button).toHaveClass(/footer-small-string/);
  await page.getByLabel('Space confirmation text', { exact: true }).uncheck();
  await page.getByRole('combobox', { name: 'Footer value', exact: true }).click();

  await expect(button).toHaveText('确定');
});

test('reactive Button tokens preserve the native footer button and focus', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Footer value', exact: true }).click();
  const button = page.getByRole('dialog').locator('.ant-picker-ok > button');
  await button.focus();
  const previous = await button.elementHandle();

  await page.getByLabel('Footer token font', { exact: true }).evaluate(element => {
    const input = element as HTMLInputElement;
    input.value = '19';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });

  await expect(button).toHaveCSS('font-size', '19px');
  expect(await button.evaluate((element, old) => element === old, previous)).toBe(true);
  await expect(button).toBeFocused();
});

test('keyboard confirmation preserves UTC milliseconds and never submits the surrounding form', async ({ page }) => {
  const input = page.getByRole('combobox', { name: 'Footer value', exact: true });
  await input.click();
  const button = page.getByRole('dialog').locator('.ant-picker-ok > button');
  await button.focus();

  await button.press('Enter');

  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(input).toBeFocused();
  await expect(page.getByLabel('Footer value', { exact: true }).last())
    .toHaveText('2024-09-15T10:23:44.567Z');
  await expect(page.getByLabel('Footer UTC', { exact: true })).toHaveText('UTC');
  await expect(page.getByLabel('Footer confirmations', { exact: true })).toHaveText('1');
  await expect(page.getByLabel('Footer submits', { exact: true })).toHaveText('0');
});
