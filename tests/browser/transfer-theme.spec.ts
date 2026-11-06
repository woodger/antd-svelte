import { test, expect } from './test';
import reference from './fixtures/ant-design-transfer-theme-reference.json' with { type: 'json' };
import { snapshotTransferTheme } from './transfer-theme-metrics';

test.use({ viewport: reference.viewport });

for (const sample of reference.cases) {
  test(`Transfer component themes match source sections, rows and child scopes for ${sample.name}`,
    async ({ page }) => {
      await page.goto('/?fixture=transfer-theme');
      await page.getByLabel('Transfer theme preset', { exact: true }).selectOption(sample.name);

      const expected = structuredClone(sample.metrics);
      // Native remove button сохраняет font:inherit; Source оставляет браузерный размер кнопки.
      for (const id of ['normal', 'rtl', 'priority'] as const) {
        for (const section of expected[id]['one-way'].sections) {
          if (section.remove && section.item) {
            section.remove['font-size'] = section.item['font-size'];
          }
        }
        if (sample.name === 'undefined-metrics') {
          // Прежний native fallback — обычный simple Empty без source ant-empty-small.
          expected[id].empty = reference.nativeEmptyObservation.metrics[id];
        }
      }
      await expect.poll(() => page.evaluate(snapshotTransferTheme)).toEqual(expected);
    });
}

test('Transfer theme updates preserve search, selection and controlled move callbacks',
  async ({ page }) => {
    await page.goto('/?fixture=transfer-theme');
    const host = page.locator('[data-transfer-theme="normal"]');
    const basic = host.locator('[data-transfer-panel="basic"]');
    const section = basic.locator('.ant-transfer-section').first();
    const input = section.getByRole('textbox');
    const checked = section.getByRole('checkbox', { name: 'Alpha', exact: true });
    const original = await input.elementHandle();
    const originalCheck = await checked.elementHandle();
    await input.fill('Al');
    await input.evaluate(node => (node as HTMLInputElement).setSelectionRange(0, 2, 'backward'));

    await page.getByRole('button', { name: 'Update Transfer tokens', exact: true })
      .dispatchEvent('click');

    const expected = reference.cases.find(sample => sample.name === 'updated-tokens')!
      .metrics.normal.basic.sections[0];
    await expect(section).toHaveCSS('width', expected.section.width);
    await expect(section.locator('.ant-transfer-list-content-item').first())
      .toHaveCSS('min-height', expected.item!['min-height']);
    expect(await input.evaluate((node, old) => node === old, original)).toBe(true);
    expect(await checked.evaluate((node, old) => node === old, originalCheck)).toBe(true);
    await expect(input).toBeFocused();
    await expect(input).toHaveValue('Al');
    expect(await input.evaluate(node => {
      const input = node as HTMLInputElement;
      return [input.selectionStart, input.selectionEnd, input.selectionDirection];
    })).toEqual([0, 2, 'backward']);
    await expect(checked).toBeChecked();
    await expect(host.getByLabel('Transfer theme events normal', { exact: true }))
      .toHaveText('["search:left:Al"]');

    await basic.locator('.ant-transfer-actions button').first().click();

    await expect(host.getByLabel('Transfer theme events normal', { exact: true }))
      .toHaveText('["search:left:Al","select::b","move:right:a"]');
    await expect(basic.locator('.ant-transfer-section').nth(1)
      .getByRole('checkbox', { name: 'Alpha', exact: true })).not.toBeChecked();
    await expect(input).toHaveValue('Al');
  });

test('Transfer keeps its page, pager focus and row nodes across token changes', async ({ page }) => {
  await page.goto('/?fixture=transfer-theme');
  const host = page.locator('[data-transfer-theme="normal"]');
  const section = host.locator('[data-transfer-panel="pagination"] .ant-transfer-section').first();
  await section.locator('.ant-pagination-next button').click();
  const input = section.locator('.ant-pagination-simple-pager input');
  const row = section.locator('.ant-transfer-list-content-item[title="Gamma"]');
  const originalInput = await input.elementHandle();
  const originalRow = await row.elementHandle();
  await input.focus();
  await input.evaluate(node => (node as HTMLInputElement).setSelectionRange(0, 1));

  await page.getByRole('button', { name: 'Update Transfer tokens', exact: true })
    .dispatchEvent('click');

  await expect(section).toHaveCSS('width', '310px');
  await expect(input).toBeFocused();
  await expect(input).toHaveValue('2');
  expect(await input.evaluate((node, old) => node === old, originalInput)).toBe(true);
  expect(await row.evaluate((node, old) => node === old, originalRow)).toBe(true);
  expect(await input.evaluate(node => {
    const input = node as HTMLInputElement;
    return [input.selectionStart, input.selectionEnd];
  })).toEqual([0, 1]);
  await expect(host.getByLabel('Transfer theme events normal', { exact: true })).toHaveText('[]');

  await section.locator('.ant-pagination-prev button').click();

  await expect(input).toHaveValue('1');
  await expect(section.getByRole('checkbox', { name: 'Alpha', exact: true })).toBeChecked();
});

test('Transfer inheritance reset preserves its search input and selected rows', async ({ page }) => {
  await page.goto('/?fixture=transfer-theme');
  const host = page.locator('[data-transfer-theme="nested"]');
  const input = host.getByRole('textbox').first();
  const original = await input.elementHandle();
  await input.fill('Al');

  await page.getByLabel('Inherit Transfer theme', { exact: true }).dispatchEvent('click');

  await expect.poll(() => page.evaluate(snapshotTransferTheme).then(metrics => metrics.nested))
    .toEqual(reference.focusedInheritanceReset);
  expect(await input.evaluate((node, old) => node === old, original)).toBe(true);
  await expect(input).toBeFocused();
  await expect(input).toHaveValue('Al');
  await expect(host.getByRole('checkbox', { name: 'Alpha', exact: true })).toBeChecked();
  await expect(host.getByLabel('Transfer theme events nested', { exact: true }))
    .toHaveText('["search:left:Al"]');
});

test('Transfer restores legacy defaults and cleans up without changing sibling scopes',
  async ({ page }) => {
    await page.goto('/?fixture=transfer-theme');
    const host = page.locator('[data-transfer-theme="normal"]');
    const basic = host.locator('[data-transfer-panel="basic"]');
    const input = basic.getByRole('textbox').first();
    const original = await input.elementHandle();
    await input.focus();

    await page.getByLabel('Apply source Transfer theme', { exact: true }).dispatchEvent('click');

    await expect(basic.locator('.ant-transfer')).toHaveCSS('font-size', '14px');
    await expect(basic.locator('.ant-transfer-section').first()).toHaveCSS('width', '180px');
    expect(await input.evaluate((node, old) => node === old, original)).toBe(true);
    await expect(input).toBeFocused();
    await expect(basic.getByRole('checkbox', { name: 'Alpha', exact: true })).toBeChecked();
    await page.getByLabel('Mount themed Transfer controls', { exact: true }).dispatchEvent('click');
    expect(await original!.evaluate(node => node.isConnected)).toBe(false);
    await expect(page.locator('[data-transfer-theme="sibling"] .ant-transfer-section').first())
      .toHaveCSS('width', '195px');
  });
