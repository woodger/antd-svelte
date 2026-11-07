import { test, expect } from './test';
import reference from './fixtures/ant-design-table-column-hidden-reference.json' with { type: 'json' };
import { snapshotTableColumnHidden } from './table-column-hidden-metrics';

test.beforeEach(async ({ page }) => { await page.goto('/?fixture=table-column-hidden'); });

function structure(value: ReturnType<typeof snapshotTableColumnHidden>) {
  const cell = (entry: typeof value.head[number]) => {
    const { colspan: _colspan, textContent: _textContent, ...semantic } = entry;
    return semantic;
  };
  // Native filter сохраняет закрытый popover в DOM; сравниваем видимый текст и selection.
  const { checkboxes: _checkboxes, ...snapshot } = value;
  return {
    ...snapshot,
    head: value.head.map(cell),
    rows: value.rows.map(row => row.map(cell)),
    expanded: value.expanded.map(cell),
    empty: value.empty.map(entry => {
      const { text: _text, ...semantic } = cell(entry);
      return semantic;
    })
  };
}

for (const sample of reference.cases) {
  test(`Table hidden columns match source layout and data for ${sample.name}`, async ({ page }) => {
    await page.getByRole('combobox', { name: 'Table hidden column case', exact: true })
      .selectOption(sample.name);

    await expect.poll(async () => structure(await page.evaluate(snapshotTableColumnHidden)))
      .toEqual(structure(sample.expected));
    if (sample.name === 'all-hidden-empty') {
      await expect(page.locator('#table-column-hidden-control .ant-empty-description'))
        .toHaveText('No data');
    }
  });
}

test('Table hides another column without replacing the visible row header editor', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Table hidden column case', exact: true })
    .selectOption('fixed-visible');
  await page.getByLabel('Hide score column', { exact: true }).uncheck();
  await page.getByLabel('Stateful hidden columns', { exact: true }).check();
  await page.getByLabel('Hidden row header column', { exact: true }).check();
  const root = page.locator('#table-column-hidden-control');
  const input = root.getByRole('textbox', { name: 'Visible name draft', exact: true });
  await input.fill('Retained name draft');
  await input.evaluate(node => (node as HTMLInputElement).setSelectionRange(1, 7, 'backward'));
  const previous = await input.elementHandle();
  const header = root.locator('tbody .user-name-cell').first();
  const previousHeader = await header.elementHandle();

  await page.getByLabel('Hide score column', { exact: true }).evaluate(node => {
    (node as HTMLInputElement).checked = true;
    node.dispatchEvent(new Event('change', { bubbles: true }));
  });

  await expect(root.locator('.user-score-cell')).toHaveCount(0);
  await expect(header).toHaveJSProperty('tagName', 'TH');
  await expect(header).toHaveAttribute('scope', 'row');
  await expect(input).toBeFocused();
  await expect(input).toHaveValue('Retained name draft');
  expect(await input.evaluate((node, old) => node === old, previous)).toBe(true);
  expect(await header.evaluate((node, old) => node === old, previousHeader)).toBe(true);
  expect(await input.evaluate(node => {
    const field = node as HTMLInputElement;
    return [field.selectionStart, field.selectionEnd, field.selectionDirection];
  })).toEqual([1, 7, 'backward']);
  expect(await root.getByRole('form').evaluate(node =>
    new FormData(node as HTMLFormElement).get('name-draft'))).toBe('Retained name draft');
  await expect(page.getByLabel('Table hidden column events', { exact: true })).toHaveText('[]');
});

test('Table keeps active sorting when its column is hidden after selection', async ({ page }) => {
  const root = page.locator('#table-column-hidden-control');
  await root.locator('th.user-score-cell').getByRole('button', { name: 'Score', exact: true }).click();
  await expect(root.locator('tbody .user-name-cell')).toHaveText(['Beta', 'Alpha', 'Gamma']);

  await page.getByLabel('Hide score column', { exact: true }).check();

  await expect(root.locator('.user-score-cell')).toHaveCount(0);
  await expect(root.locator('tbody .user-name-cell')).toHaveText(['Beta', 'Alpha', 'Gamma']);
  await expect(page.getByLabel('Table hidden column events', { exact: true })).toHaveText('["sort"]');
});

test('Table all-hidden selection and expansion survive column restoration with their editor',
  async ({ page }) => {
    await page.getByRole('combobox', { name: 'Table hidden column case', exact: true })
      .selectOption('all-hidden-both');
    await page.getByLabel('Stateful hidden columns', { exact: true }).check();
    const root = page.locator('#table-column-hidden-control');
    const input = root.getByRole('textbox', { name: 'Hidden columns expanded draft', exact: true });
    await input.fill('Retained expanded draft');
    const previous = await input.elementHandle();

    for (const name of ['Hide name column', 'Hide score column']) {
      await page.getByLabel(name, { exact: true }).evaluate(node => {
        (node as HTMLInputElement).checked = false;
        node.dispatchEvent(new Event('change', { bubbles: true }));
      });
    }

    await expect(root.locator('tbody tr.ant-table-row').first().getByRole('checkbox')).toBeChecked();
    await expect(root.locator('tbody tr.ant-table-expanded-row > td'))
      .toHaveJSProperty('colSpan', 4);
    await expect(input).toBeFocused();
    await expect(input).toHaveValue('Retained expanded draft');
    expect(await input.evaluate((node, old) => node === old, previous)).toBe(true);
    expect(await root.getByRole('form').evaluate(node =>
      new FormData(node as HTMLFormElement).get('details-draft'))).toBe('Retained expanded draft');

    for (const name of ['Hide name column', 'Hide score column']) {
      await page.getByLabel(name, { exact: true }).evaluate(node => {
        (node as HTMLInputElement).checked = true;
        node.dispatchEvent(new Event('change', { bubbles: true }));
      });
    }

    await expect(root.locator('tbody tr.ant-table-row').first().getByRole('checkbox')).toBeChecked();
    await expect(root.locator('tbody tr.ant-table-expanded-row > td'))
      .toHaveJSProperty('colSpan', 2);
    await expect(input).toBeFocused();
    await expect(input).toHaveValue('Retained expanded draft');
    await expect(page.getByLabel('Table hidden column events', { exact: true })).toHaveText('[]');
  });
