import { test, expect } from './test';
import reference from './fixtures/ant-design-table-theme-reference.json' with { type: 'json' };
import observation from './fixtures/ant-design-table-root-style-observation.json' with { type: 'json' };
import { snapshotTableTheme } from './table-theme-metrics';

test.use({ viewport: reference.viewport });
test.beforeEach(async ({ page }) => { await page.goto('/?fixture=table-theme'); });

for (const sample of reference.cases) {
  for (const [scope, expected] of Object.entries(sample.scopes)) {
    test(`Table ${scope} theme matches source cells for ${sample.name}`, async ({ page }) => {
      await page.getByLabel('Table theme preset', { exact: true }).selectOption(sample.name);
      await page.getByLabel('Table theme scope', { exact: true }).selectOption(scope);
      await page.mouse.move(1300, 1100);

      await expect.poll(() => page.evaluate(snapshotTableTheme)).toEqual(expected);
    });
  }

  for (const [mode, expected] of Object.entries(sample.modes)) {
    test(`Table ${mode} theme matches source cells for ${sample.name}`, async ({ page }) => {
      await page.getByLabel('Table theme preset', { exact: true }).selectOption(sample.name);
      await page.getByLabel('Table theme mode', { exact: true }).selectOption(mode);
      const root = page.locator('#table-theme-control');
      await expect(root.getByRole('table')).toBeVisible();
      await page.mouse.move(1300, 1100);
      if (mode === 'header-hover') await root.locator('th.ant-table-column-has-sorters')
        .hover({ position: { x: 4, y: 4 } });
      if (mode === 'sorter-hover') await root.locator('.ant-table-column-sorters').hover();
      if (mode === 'selected-hover') await root.locator('tbody tr.ant-table-row').first()
        .locator('td').last().hover();
      if (mode === 'expand-hover') await root.locator('.ant-table-row-expand-icon').first().hover();
      if (mode === 'filter-hover') await root.locator('.ant-table-filter-trigger').hover();
      if (mode === 'filter-popup') {
        await root.locator('.ant-table-filter-trigger').click();
        await expect(root.getByRole('dialog')).toBeVisible();
        await page.mouse.move(1300, 1100);
      }

      await expect.poll(() => page.evaluate(snapshotTableTheme)).toEqual(expected);
    });
  }
}

test('Table token updates preserve row controls, draft, focus, selection and fixed offsets',
  async ({ page }) => {
    await page.getByLabel('Table theme mode', { exact: true }).selectOption('stateful');
    const root = page.locator('#table-theme-control');
    const input = root.getByRole('textbox', { name: 'Table draft', exact: true });
    const table = root.getByRole('table');
    const checkbox = root.locator('tbody tr.ant-table-row').first().getByRole('checkbox');
    await input.fill('Retained draft');
    await input.evaluate(node => (node as HTMLInputElement).setSelectionRange(1, 5, 'backward'));
    const originalInput = await input.elementHandle();
    const originalTable = await table.elementHandle();
    const originalCheckbox = await checkbox.elementHandle();
    const originalWidth = await root.locator('col.ant-table-selection-col')
      .evaluate(node => node.getBoundingClientRect().width);
    await root.getByRole('region').evaluate(node => { node.scrollLeft = 120; });
    const scrollLeft = await root.getByRole('region').evaluate(node => node.scrollLeft);

    await page.getByRole('button', { name: 'Update Table tokens', exact: true })
      .dispatchEvent('click');

    await expect(root.locator('.ant-table')).toHaveCSS('font-size', '21px');
    await expect(root.locator('thead th').last()).toHaveCSS('background-image',
      'linear-gradient(rgb(230, 255, 251), rgb(230, 255, 251))');
    expect(await root.locator('col.ant-table-selection-col')
      .evaluate(node => (node as HTMLElement).style.width)).toBe('70px');
    expect(await root.locator('col.ant-table-selection-col')
      .evaluate(node => node.getBoundingClientRect().width)).toBeGreaterThan(originalWidth);
    await expect(input).toHaveValue('Retained draft');
    await expect(input).toBeFocused();
    await expect(checkbox).toBeChecked();
    expect(await input.evaluate((node, old) => node === old, originalInput)).toBe(true);
    expect(await table.evaluate((node, old) => node === old, originalTable)).toBe(true);
    expect(await checkbox.evaluate((node, old) => node === old, originalCheckbox)).toBe(true);
    expect(await input.evaluate(node => {
      const field = node as HTMLInputElement;
      return [field.selectionStart, field.selectionEnd, field.selectionDirection];
    })).toEqual([1, 5, 'backward']);
    expect(await root.getByRole('form').evaluate(node =>
      new FormData(node as HTMLFormElement).get('draft'))).toBe('Retained draft');
    expect(await root.getByRole('region').evaluate(node => node.scrollLeft)).toBe(scrollLeft);
    await expect(root.getByLabel('Table theme events', { exact: true })).toHaveText('[]');
    await expect(page.locator('#table-theme-neighbor thead th'))
      .toHaveCSS('background-color', 'rgb(255, 240, 246)');
    await expect.poll(() => table.evaluate(node => {
      const cells = node.querySelectorAll<HTMLTableCellElement>('thead th');
      return Math.abs(parseFloat(getComputedStyle(cells[2]).insetInlineStart)
        - cells[0].getBoundingClientRect().width - cells[1].getBoundingClientRect().width);
    })).toBeLessThan(1.5);

    await root.locator('.sort-button').focus();
    await page.keyboard.press('Enter');

    await expect(root.locator('th[aria-sort="ascending"]')).toBeVisible();
    await expect(root.getByLabel('Table theme events', { exact: true })).toHaveText('["sort"]');
    await checkbox.focus();
    await page.keyboard.press('Space');
    await expect(checkbox).not.toBeChecked();
    await expect(root.getByLabel('Table theme events', { exact: true }))
      .toHaveText('["sort","selection"]');
  });

test('Table inheritance resets typography and cells without replacing the expanded input',
  async ({ page }) => {
    await page.getByLabel('Table theme mode', { exact: true }).selectOption('expanded');
    await page.getByLabel('Table theme scope', { exact: true }).selectOption('nested');
    const root = page.locator('#table-theme-control');
    const input = root.getByRole('textbox', { name: 'Table draft', exact: true });
    await input.fill('Nested draft');
    const original = await input.elementHandle();
    await expect(root.locator('.ant-table')).toHaveCSS('font-size', '15px');

    await page.getByLabel('Inherit Table theme', { exact: true }).dispatchEvent('click');

    await expect(root.locator('.ant-table')).toHaveCSS('font-size', '16px');
    await expect(root.locator('thead th').last()).toHaveCSS('background-color', 'rgb(250, 250, 250)');
    await expect(input).toHaveValue('Nested draft');
    await expect(input).toBeFocused();
    expect(await input.evaluate((node, old) => node === old, original)).toBe(true);
    await expect(root.getByLabel('Table theme events', { exact: true })).toHaveText('[]');
    await expect(page.locator('#table-theme-neighbor thead th'))
      .toHaveCSS('font-size', '13px');
  });

test('Table local variables retain priority after token updates', async ({ page }) => {
  await page.getByLabel('Table theme preset', { exact: true }).selectOption('component-tokens');
  await page.getByLabel('Table theme mode', { exact: true }).selectOption('root-style');
  const cell = page.locator('#table-theme-control tbody tr.ant-table-row td').first();

  expect(observation.style['--ant-table-cell-padding-block-md']).toBe('11px');
  expect(observation.metrics.cells[0]?.['padding-top']).toBe('7px');
  await expect(cell).toHaveCSS('padding-top', '11px');

  await page.getByRole('button', { name: 'Update Table tokens', exact: true }).click();

  await expect(cell).toHaveCSS('padding-top', '11px');
  await expect(cell).toHaveCSS('font-size', '21px');
});

test('Table returns to legacy styling and reopens with the current theme after unmount',
  async ({ page }) => {
    await page.getByLabel('Table theme mode', { exact: true }).selectOption('stateful');
    const root = page.locator('#table-theme-control');
    const input = root.getByRole('textbox', { name: 'Table draft', exact: true });
    await input.fill('Legacy draft');
    const original = await input.elementHandle();

    await page.getByLabel('Apply source Table theme', { exact: true }).dispatchEvent('click');

    await expect(root.locator('.ant-table')).toHaveCSS('font-size', '14px');
    await expect(input).toHaveValue('Legacy draft');
    await expect(input).toBeFocused();
    expect(await input.evaluate((node, old) => node === old, original)).toBe(true);
    await expect(root.locator('col.ant-table-selection-col')).toHaveCount(0);
    expect(await root.locator('col').nth(1)
      .evaluate(node => (node as HTMLElement).style.width)).toBe('48px');
    await expect(root.getByLabel('Table theme events', { exact: true })).toHaveText('[]');

    await page.getByLabel('Mount themed Table', { exact: true }).dispatchEvent('click');
    await expect(root).toHaveCount(0);
    await page.getByLabel('Apply source Table theme', { exact: true }).dispatchEvent('click');
    await page.getByRole('button', { name: 'Update Table tokens', exact: true }).click();
    await page.getByLabel('Mount themed Table', { exact: true }).dispatchEvent('click');

    await expect(root.locator('.ant-table')).toHaveCSS('font-size', '21px');
    await expect(root.getByLabel('Table theme events', { exact: true })).toHaveText('[]');
    await expect(page.locator('#table-theme-neighbor thead th'))
      .toHaveCSS('background-color', 'rgb(255, 240, 246)');
  });

test('Table fixed header hover uses the source fixed token over the container underlay',
  async ({ page }) => {
    await page.getByLabel('Table theme preset', { exact: true }).selectOption('component-tokens');
    await page.getByLabel('Table theme mode', { exact: true }).selectOption('fixed-hover');
    const header = page.locator('#table-theme-control th.ant-table-column-has-sorters');
    const color = reference.fixedHeader.headers[0]?.['background-color'];
    expect(color).toBe('rgb(230, 255, 251)');

    await header.hover({ position: { x: 4, y: 4 } });

    await expect(header).toHaveCSS('background-image', `linear-gradient(${color}, ${color})`);
  });

test('Table filter theme updates preserve the open popup, draft and keyboard confirmation',
  async ({ page }) => {
    await page.getByLabel('Table theme mode', { exact: true }).selectOption('filter-popup');
    const root = page.locator('#table-theme-control');
    const trigger = root.locator('.ant-table-filter-trigger');
    await trigger.click();
    const dialog = root.getByRole('dialog');
    const checkbox = dialog.getByRole('checkbox', { name: 'Ten', exact: true });
    await checkbox.check();
    const originalDialog = await dialog.elementHandle();
    const originalCheckbox = await checkbox.elementHandle();

    await page.getByRole('button', { name: 'Update Table tokens', exact: true })
      .dispatchEvent('click');

    await expect(dialog).toBeVisible();
    await expect(checkbox).toBeChecked();
    await expect(checkbox).toBeFocused();
    expect(await dialog.evaluate((node, old) => node === old, originalDialog)).toBe(true);
    expect(await checkbox.evaluate((node, old) => node === old, originalCheckbox)).toBe(true);
    await expect(dialog.locator('.ant-table-filter-dropdown'))
      .toHaveCSS('background-color', 'rgb(255, 241, 240)');
    await expect(dialog.locator('.filter-options'))
      .toHaveCSS('background-color', 'rgb(255, 251, 230)');
    await expect(root.getByLabel('Table theme events', { exact: true })).toHaveText('[]');

    await page.keyboard.press('Enter');

    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
    await expect(root.locator('tbody tr.ant-table-row')).toHaveCount(1);
    await expect(root.locator('tbody tr.ant-table-row')).toContainText('Alpha');
    await expect(root.getByLabel('Table theme events', { exact: true })).toHaveText('["filter"]');
  });
