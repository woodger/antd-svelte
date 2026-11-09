import { test, expect } from './test';
import reference from './fixtures/ant-design-transfer-prefix-reference.json' with { type: 'json' };
import { snapshotTransferPrefix } from './transfer-prefix-metrics';

test.use({ viewport: reference.reference.viewport });

for (const entry of reference.cases) {
  for (const scope of ['normal', 'nested', 'sibling'] as const) {
    test(`Transfer prefixes match Source ${entry.sample.id}/${scope}`, async ({ page }) => {
      await page.goto('/?fixture=transfer-prefix');
      await page.getByRole('combobox', { name: 'Transfer prefix sample', exact: true })
        .selectOption(entry.sample.id);
      await page.getByRole('combobox', { name: 'Transfer prefix scope', exact: true }).selectOption(scope);
      await page.mouse.move(1270, 890);
      const expected = structuredClone(entry.result[scope]);

      if ('one-way' in expected.tree && expected.tree['one-way']) {
        for (const section of expected.tree['one-way'].sections) {
          if (section.remove && section.item) section.remove['font-size'] = section.item['font-size'];
        }
      }

      await expect.poll(() => page.evaluate(snapshotTransferPrefix)).toEqual(expected);
    });
  }
}

test('Transfer prefixes retain search/editor/checkbox state, focus, refs and move callbacks', async ({ page }) => {
  await page.goto('/?fixture=transfer-prefix');
  await page.getByRole('checkbox', { name: 'Live Transfer prefix', exact: true }).check();
  const root = page.locator('.fixture-transfer-prefix');
  const editor = root.getByRole('textbox').first();
  const checkbox = root.locator('input[type=checkbox]').first();
  await editor.fill('a');
  await editor.evaluate((node: HTMLInputElement) => node.setSelectionRange(0, 1));
  const oldRoot = await root.elementHandle();
  const oldInput = await editor.elementHandle();
  const oldCheckbox = await checkbox.elementHandle();

  for (const step of reference.transitions) {
    await page.getByRole('textbox', { name: 'Live Transfer prefix value', exact: true })
      .evaluate((node: HTMLInputElement, value) => {
        node.value = value;
        node.dispatchEvent(new Event('input', { bubbles: true }));
      }, step.prefix);

    await expect.poll(() => page.evaluate(snapshotTransferPrefix)).toEqual(step.result);
    expect(await root.evaluate((node, old) => node === old, oldRoot)).toBe(step.sameRoot);
    expect(await editor.evaluate((node, old) => node === old, oldInput)).toBe(step.sameInput);
    expect(await checkbox.evaluate((node, old) => node === old, oldCheckbox)).toBe(step.sameCheckbox);
    await expect(editor).toBeFocused();
    await expect(editor).toHaveValue(step.value);
    expect(await editor.evaluate((node: HTMLInputElement) => [node.selectionStart, node.selectionEnd]))
      .toEqual(step.selection);
    await expect(root.getByRole('checkbox', { name: 'Alpha', exact: true })).toBeChecked();
    await expect(page.getByLabel('Transfer prefix ref', { exact: true })).toHaveText('connected');
    await expect(page.getByLabel('Transfer prefix events', { exact: true })).toHaveText('search:left:a');
  }
  await root.getByRole('button', { name: 'right', exact: true }).click();

  await expect(root.locator('[class*="-section"]').last().getByText('Alpha', { exact: true }))
    .toBeVisible();
  await expect(page.getByLabel('Transfer prefix events', { exact: true })).toContainText('move:right:a');
});

test('Transfer pagination prefix updates retain its focused draft and publish the selected page', async ({ page }) => {
  await page.goto('/?fixture=transfer-prefix');
  await page.getByRole('checkbox', { name: 'Live Transfer prefix', exact: true }).check();
  await page.getByRole('checkbox', { name: 'Paged prefix Transfer', exact: true }).check();
  const root = page.locator('.fixture-transfer-prefix');
  const source = root.locator('[class*="-section"]').first();
  const pager = source.locator('li[class*="-pagination-simple-pager"] input');
  await pager.fill('2');
  await pager.evaluate((node: HTMLInputElement) => node.setSelectionRange(0, 1));
  const oldPager = await pager.elementHandle();
  await page.getByRole('textbox', { name: 'Live Transfer prefix value', exact: true })
    .evaluate((node: HTMLInputElement) => {
      node.value = 'other';
      node.dispatchEvent(new Event('input', { bubbles: true }));
    });

  await expect(root).toHaveClass(/other-transfer/);
  await expect(source.locator('ul[class*="-pagination"]')).toHaveClass(/other-pagination/);
  expect(await pager.evaluate((node, old) => node === old, oldPager)).toBe(true);
  await expect(pager).toBeFocused();
  await expect(pager).toHaveValue('2');
  await page.keyboard.press('Enter');

  await expect(source.getByText('Gamma', { exact: true })).toBeVisible();
  await expect(source.getByText('Alpha', { exact: true })).toHaveCount(0);
});
