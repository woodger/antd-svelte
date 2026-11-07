import { test, expect } from './test';
import reference from './fixtures/ant-design-table-row-scope-reference.json' with { type: 'json' };
import { snapshotTableRowScope } from './table-row-scope-metrics';

test.beforeEach(async ({ page }) => { await page.goto('/?fixture=table-row-scope'); });

function columnMetrics(value: ReturnType<typeof snapshotTableRowScope>, layered: boolean) {
  return {
    head: value.head,
    rows: value.rows.map(row => {
      const { backgroundColor: _backgroundColor, ...header } = row[1];
      return {
        cells: row.map(({ tagName, scope, text }) => ({ tagName, scope, text })),
        header: layered ? header : row[1]
      };
    })
  };
}

for (const sample of reference.cases) {
  test(`Table rowScope matches source body cells and styles for ${sample.name}`, async ({ page }) => {
    await page.getByRole('combobox', { name: 'Table row scope case', exact: true })
      .selectOption(sample.name);
    if (sample.name.includes('hover')) {
      await page.locator('#table-row-scope-control tbody tr.ant-table-row').first()
        .locator('.user-row-header').hover();
    } else await page.mouse.move(1200, 700);

    const layered = sample.name.startsWith('fixed');
    // Scope сверяется у всех ячеек, оформление — у переносимой колонки.
    await expect.poll(async () => columnMetrics(await page.evaluate(snapshotTableRowScope), layered))
      .toEqual(columnMetrics(sample.expected, layered));
    if (layered) {
      // Нативный sticky слой сохраняет прежнюю непрозрачную подложку под source headerBg.
      const cells = page.locator('#table-row-scope-control tbody tr.ant-table-row .user-row-header');
      const base = sample.expected.rows.at(-1)![0].backgroundColor;
      for (const [index, row] of sample.expected.rows.entries()) {
        const color = row[1].backgroundColor;
        await expect(cells.nth(index)).toHaveCSS('background-color', base);
        await expect(cells.nth(index)).toHaveCSS('background-image',
          `linear-gradient(${color}, ${color})`);
      }
    }
  });
}

test('Table rowScope updates keep row header editors and independent selection/expansion cells',
  async ({ page }) => {
    await page.getByRole('combobox', { name: 'Table row scope case', exact: true })
      .selectOption('row');
    await page.getByLabel('Stateful row headers', { exact: true }).check();
    await page.getByLabel('Expandable scoped rows', { exact: true }).check();
    const root = page.locator('#table-row-scope-control');
    const row = root.locator('tbody tr.ant-table-row').first();
    const cell = row.locator('.user-row-header');
    const input = cell.getByRole('textbox', { name: 'Row header draft', exact: true });
    await input.fill('Row header draft retained');
    await input.evaluate(node => (node as HTMLInputElement).setSelectionRange(1, 6, 'backward'));
    const previousCell = await cell.elementHandle();
    const previousInput = await input.elementHandle();

    await page.getByRole('combobox', { name: 'Table row scope override', exact: true })
      .evaluate(node => {
        (node as HTMLSelectElement).value = 'rowgroup';
        node.dispatchEvent(new Event('change', { bubbles: true }));
      });

    await expect(cell).toHaveJSProperty('tagName', 'TH');
    await expect(cell).toHaveAttribute('scope', 'rowgroup');
    await expect(input).toBeFocused();
    await expect(input).toHaveValue('Row header draft retained');
    expect(await cell.evaluate((node, old) => node === old, previousCell)).toBe(true);
    expect(await input.evaluate((node, old) => node === old, previousInput)).toBe(true);
    expect(await input.evaluate(node => {
      const field = node as HTMLInputElement;
      return [field.selectionStart, field.selectionEnd, field.selectionDirection];
    })).toEqual([1, 6, 'backward']);
    expect(await root.getByRole('form').evaluate(node =>
      new FormData(node as HTMLFormElement).get('draft'))).toBe('Row header draft retained');
    await expect(row.locator('td')).toHaveCount(3);
    await expect(root.locator('tbody tr.ant-table-expanded-row > td')).toHaveAttribute('colspan', '4');
    await expect(root.locator('thead th:not([scope="col"])')).toHaveCount(0);

    await row.getByRole('checkbox').press('Space');

    await expect(row.getByRole('checkbox')).toBeChecked();
    await expect(cell).toHaveCSS('background-color', 'rgb(230, 244, 255)');
    await expect(page.getByLabel('Table row scope events', { exact: true }))
      .toContainText('selection');
    await page.getByRole('combobox', { name: 'Table row scope override', exact: true })
      .selectOption('none');

    await expect(cell).toHaveJSProperty('tagName', 'TD');
    await expect(cell).not.toHaveAttribute('scope');
    await expect(row.locator('td')).toHaveCount(4);
  });

test('Table data cells retain selection priority over a fixed sorted column background',
  async ({ page }) => {
    await page.getByRole('combobox', { name: 'Table row scope case', exact: true })
      .selectOption('fixed-sorted-custom');
    await page.getByRole('combobox', { name: 'Table row scope override', exact: true })
      .selectOption('none');
    const row = page.locator('#table-row-scope-control tbody tr.ant-table-row').first();
    const cell = row.locator('.user-row-header');
    await expect(cell).toHaveJSProperty('tagName', 'TD');
    await expect(cell).toHaveClass(/ant-table-column-sort/);

    await row.getByRole('checkbox').press('Space');

    const color = reference.cases.find(sample => sample.name === 'selected')!
      .expected.rows[0][1].backgroundColor;
    await expect(row.getByRole('checkbox')).toBeChecked();
    await expect(cell).toHaveCSS('background-image', `linear-gradient(${color}, ${color})`);
  });
