import { test, expect } from './test';
import reference from './fixtures/ant-design-pagination-prefix-reference.json' with { type: 'json' };
import { snapshotPaginationPrefix } from './pagination-prefix-metrics';

test.use({ viewport: reference.reference.viewport });

for (const entry of reference.cases) {
  for (const scope of ['normal', 'nested', 'sibling'] as const) {
    test(`Pagination prefixes match Source ${entry.sample.id}/${scope}`, async ({ page }) => {
      await page.goto('/?fixture=pagination-prefix');
      await page.getByRole('combobox', { name: 'Pagination prefix sample', exact: true })
        .selectOption(entry.sample.id);
      await page.getByRole('combobox', { name: 'Pagination prefix scope', exact: true })
        .selectOption(scope);
      await page.mouse.move(1590, 5);

      await expect.poll(() => page.evaluate(snapshotPaginationPrefix)).toEqual(entry.nativeButtons[scope]);
    });
  }
}

test('Pagination prefix changes retain active page, jumper draft, focus/selection and bindings', async ({ page }) => {
  await page.goto('/?fixture=pagination-prefix');
  await page.getByRole('checkbox', { name: 'Live Pagination prefix', exact: true }).check();
  const root = page.locator('.fixture-pagination-prefix');
  const quick = root.locator('[data-ant-pagination-quick] input');
  const active = root.locator('[data-ant-pagination-active]');
  await quick.fill('12');
  await quick.focus();
  await page.mouse.move(1590, 5);
  const oldRoot = await root.elementHandle();
  const oldQuick = await quick.elementHandle();
  const oldActive = await active.elementHandle();

  for (const step of reference.transitions) {
    await page.getByRole('textbox', { name: 'Live Pagination prefix value', exact: true })
      .evaluate((node: HTMLInputElement, value) => {
        node.value = value;
        node.dispatchEvent(new Event('input', { bubbles: true }));
      }, step.prefix);

    await expect.poll(() => page.evaluate(snapshotPaginationPrefix)).toEqual({
      ...step.result, previousControl: reference.nativeButtonsLive.previousControl
    });
    expect(await root.evaluate((node, old) => node === old, oldRoot)).toBe(step.sameRoot);
    expect(await quick.evaluate((node, old) => node === old, oldQuick)).toBe(step.sameQuick);
    expect(await active.evaluate((node, old) => node === old, oldActive)).toBe(step.sameActive);
    await expect(quick).toBeFocused();
    await expect(quick).toHaveValue(step.value);
    expect(await quick.evaluate((node: HTMLInputElement) => [node.selectionStart, node.selectionEnd]))
      .toEqual(step.selection);
    await expect(page.getByLabel('Pagination prefix values', { exact: true })).toHaveText('5:10');
    await expect(page.getByLabel('Pagination prefix events', { exact: true })).toHaveText('[]');
  }
  await page.getByRole('textbox', { name: 'Local Pagination prefix value', exact: true })
    .evaluate((node: HTMLInputElement) => {
      node.value = 'pages';
      node.dispatchEvent(new Event('input', { bubbles: true }));
    });

  await expect(root).toHaveClass(/\bpages\b/);
  await expect(quick).toBeFocused();
  await quick.press('Enter');

  await expect(page.getByLabel('Pagination prefix values', { exact: true })).toHaveText('12:10');
  await expect(page.getByLabel('Pagination prefix events', { exact: true })).toHaveText('["12:10"]');
  await expect(active).toHaveClass(/pages-item-12/);
});
