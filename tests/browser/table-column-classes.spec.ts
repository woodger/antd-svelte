import { test, expect } from './test';
import reference from './fixtures/ant-design-table-column-classes-reference.json' with { type: 'json' };
import { snapshotTableColumnClasses } from './table-column-classes-metrics';

test.beforeEach(async ({ page }) => { await page.goto('/?fixture=table-column-classes'); });

for (const sample of reference.cases) {
  test(`Table column classes match source header/body styles for ${sample.name}`, async ({ page }) => {
    await page.getByRole('combobox', { name: 'Table column class case', exact: true })
      .selectOption(sample.name);

    await expect.poll(() => page.evaluate(snapshotTableColumnClasses)).toEqual(sample.expected);
  });
}

test('Table column class updates retain cells, editor, selection, focus and form data',
  async ({ page }) => {
    await page.getByRole('combobox', { name: 'Table column class case', exact: true })
      .selectOption('multiple');
    await page.getByLabel('Stateful column classes', { exact: true }).check();
    const root = page.locator('#table-column-classes-control');
    const row = root.locator('tbody tr.ant-table-row').first();
    const cell = row.locator('td').nth(1);
    const input = root.getByRole('textbox', { name: 'Column draft', exact: true });
    await input.fill('Column draft retained');
    await input.evaluate(node => (node as HTMLInputElement).setSelectionRange(1, 6, 'backward'));
    const previousCell = await cell.elementHandle();
    const previousInput = await input.elementHandle();

    await page.getByRole('button', { name: 'Update column classes', exact: true })
      .dispatchEvent('click');

    await expect(cell).toHaveClass(/user-col-alternate/);
    await expect(cell).not.toHaveClass(/user-col-accent|user-col-marker/);
    await expect(cell).toHaveCSS('text-transform', 'lowercase');
    await expect(root.locator('th').nth(1)).toHaveClass(/user-col-alternate/);
    await expect(input).toHaveValue('Column draft retained');
    await expect(input).toBeFocused();
    expect(await cell.evaluate((node, old) => node === old, previousCell)).toBe(true);
    expect(await input.evaluate((node, old) => node === old, previousInput)).toBe(true);
    expect(await input.evaluate(node => {
      const field = node as HTMLInputElement;
      return [field.selectionStart, field.selectionEnd, field.selectionDirection];
    })).toEqual([1, 6, 'backward']);
    expect(await root.getByRole('form').evaluate(node =>
      new FormData(node as HTMLFormElement).get('draft'))).toBe('Column draft retained');

    await row.getByRole('checkbox').press('Space');

    await expect(row.getByRole('checkbox')).toBeChecked();
    await expect(row).toHaveClass(/ant-table-row-selected/);
    await expect(cell).toHaveClass(/ant-table-cell/);
    await expect(page.getByLabel('Table column events', { exact: true })).toContainText('selection');
  });

test('Table user column classes preserve sort and fixed-cell classes', async ({ page }) => {
  const select = page.getByRole('combobox', { name: 'Table column class case', exact: true });
  await select.selectOption('sorted');
  const root = page.locator('#table-column-classes-control');
  await expect(root.locator('th').nth(1)).toHaveAttribute('aria-sort', 'ascending');
  await expect(root.locator('th').nth(1)).toHaveClass(/ant-table-column-sort/);
  await expect(root.locator('tbody tr.ant-table-row').first().locator('td').nth(1))
    .toHaveClass(/ant-table-column-sort/);

  await select.selectOption('fixed');

  await expect(root.locator('th').nth(1)).toHaveClass(/user-col-accent/);
  await expect(root.locator('th').nth(1)).toHaveClass(/ant-table-cell-fix-start/);
  await expect(root.locator('tbody tr.ant-table-row').first().locator('td').nth(1))
    .toHaveClass(/ant-table-cell-fix-start/);
});
