import { test, expect } from './test';
import reference from './fixtures/ant-design-cascader-prefix-reference.json' with { type: 'json' };
import { snapshotCascaderPrefix } from './cascader-prefix-metrics';

test.use({ viewport: reference.reference.viewport });

for (const entry of reference.cases) {
  for (const scope of ['normal', 'nested', 'sibling'] as const) {
    test(`Cascader prefixes match Source ${entry.sample.id}/${scope}`, async ({ page }) => {
      await page.goto('/?fixture=cascader-prefix');
      await page.getByRole('combobox', { name: 'Cascader prefix sample', exact: true })
        .selectOption(entry.sample.id);
      await page.getByRole('combobox', { name: 'Cascader prefix scope', exact: true }).selectOption(scope);
      if ('opened' in entry.sample && entry.sample.opened) {
        await page.getByRole('combobox', { name: 'Prefix choices', exact: true }).click();
      }
      if ('search' in entry.sample && entry.sample.search) {
        await page.getByRole('combobox', { name: 'Prefix choices', exact: true }).fill('a');
      }
      await page.mouse.move(1270, 890);

      const expected = structuredClone(entry.result[scope]);
      if (scope !== 'sibling' && entry.nativePadding) {
        // Local Source selector оставляет Select padding; Native сохраняет прежние 0px.
        expected.popup = entry.nativePadding[scope].popup;
        expected.columns = entry.nativePadding[scope].columns;
      }
      if (scope !== 'sibling' && entry.nativeDirection) {
        expected.root = entry.nativeDirection[scope].root;
        expected.popup = entry.nativeDirection[scope].popup;
      }

      await expect.poll(() => page.evaluate(snapshotCascaderPrefix)).toEqual(expected);
    });
  }
}

test('Cascader prefix updates retain search, selection, open rows, refs, IDs and chosen paths', async ({ page }) => {
  await page.goto('/?fixture=cascader-prefix');
  await page.getByRole('checkbox', { name: 'Live Cascader prefix', exact: true }).check();
  const control = page.getByRole('combobox', { name: 'Prefix choices', exact: true });
  await control.fill('draft');
  await control.evaluate((node: HTMLInputElement) => node.setSelectionRange(1, 4, 'backward'));
  const root = page.locator('.fixture-cascader-prefix');
  const popup = page.locator('[data-ant-cascader-prefix][popover]');
  const row = page.getByRole('menuitemcheckbox', { name: 'Parent / Alpha', exact: true });
  const oldRoot = await root.elementHandle();
  const oldInput = await control.elementHandle();
  const oldPopup = await popup.elementHandle();
  const oldRow = await row.elementHandle();
  const id = await control.getAttribute('id');

  for (const step of reference.transitions) {
    await page.getByRole('textbox', { name: 'Live Cascader prefix value', exact: true })
      .evaluate((node: HTMLInputElement, value) => {
        node.value = value;
        node.dispatchEvent(new Event('input', { bubbles: true }));
      }, step.prefix);

    await expect.poll(() => page.evaluate(snapshotCascaderPrefix)).toEqual(step.result);
    expect(await root.evaluate((node, old) => node === old, oldRoot)).toBe(true);
    expect(await control.evaluate((node, old) => node === old, oldInput)).toBe(true);
    expect(await popup.evaluate((node, old) => node === old, oldPopup)).toBe(true);
    expect(await row.evaluate((node, old) => node === old, oldRow)).toBe(true);
    await expect(control).toBeFocused();
    await expect(control).toHaveValue('draft');
    await expect(control).toHaveAttribute('id', id!);
    expect(await control.evaluate((node: HTMLInputElement) =>
      [node.selectionStart, node.selectionEnd, node.selectionDirection])).toEqual(step.selection);
    await expect(page.getByLabel('Cascader prefix refs', { exact: true })).toHaveText('true');
    await expect(page.getByLabel('Cascader prefix events', { exact: true })).toHaveText('search:draft');
    await expect(page.getByLabel('Cascader prefix value', { exact: true })).toHaveText('["p","b"]');
  }
  await row.click();

  await expect(page.getByLabel('Cascader prefix value', { exact: true })).toHaveText('["p","a"]');
  await expect(page.getByLabel('Cascader prefix events', { exact: true }))
    .toContainText('change:["p","a"]');
});

test('CascaderPanel prefixes retain the focused row and keyboard selection', async ({ page }) => {
  await page.goto('/?fixture=cascader-prefix');
  await page.getByRole('checkbox', { name: 'Live Cascader prefix', exact: true }).check();
  await page.getByRole('checkbox', { name: 'Panel prefix Cascader', exact: true }).check();
  await page.getByRole('menu', { name: 'Prefix choices', exact: true }).first().focus();
  await page.keyboard.press('ArrowUp');
  const row = page.getByRole('menuitemcheckbox', { name: 'Alpha', exact: true });
  await expect(row).toBeFocused();
  const oldRow = await row.elementHandle();

  for (const [field, value] of [['Local Cascader prefix value', 'paths'],
    ['Live Cascader prefix value', 'next']] as const) {
    await page.getByRole('textbox', { name: field, exact: true })
      .evaluate((node: HTMLInputElement, value) => {
        node.value = value;
        node.dispatchEvent(new Event('input', { bubbles: true }));
      }, value);

    expect(await row.evaluate((node, old) => node === old, oldRow)).toBe(true);
    await expect(row).toBeFocused();
    await expect(page.getByLabel('Cascader prefix events', { exact: true })).toBeEmpty();
  }
  await page.keyboard.press('Enter');

  await expect(page.getByLabel('Cascader prefix value', { exact: true })).toHaveText('["p","a"]');
});

test('Cascader multiple prefixes retain portalled popup, selected tags and search focus', async ({ page }) => {
  await page.goto('/?fixture=cascader-prefix');
  await page.getByRole('checkbox', { name: 'Live Cascader prefix', exact: true }).check();
  await page.getByRole('checkbox', { name: 'Multiple prefix Cascader', exact: true }).check();
  await page.getByRole('checkbox', { name: 'Portal prefix Cascader', exact: true }).check();
  const control = page.getByRole('combobox', { name: 'Prefix choices', exact: true });
  await control.fill('draft');
  const popup = page.locator('[data-ant-cascader-prefix][popover]');
  const tag = page.getByRole('button', { name: 'Remove Beta', exact: true });
  const oldPopup = await popup.elementHandle();
  const oldTag = await tag.elementHandle();
  const oldInput = await control.elementHandle();

  for (const [field, value] of [['Local Cascader prefix value', 'owner'],
    ['Live Cascader prefix value', 'next']] as const) {
    await page.getByRole('textbox', { name: field, exact: true })
      .evaluate((node: HTMLInputElement, value) => {
        node.value = value;
        node.dispatchEvent(new Event('input', { bubbles: true }));
      }, value);

    expect(await popup.evaluate((node, old) => node === old, oldPopup)).toBe(true);
    expect(await tag.evaluate((node, old) => node === old, oldTag)).toBe(true);
    expect(await control.evaluate((node, old) => node === old, oldInput)).toBe(true);
    await expect(control).toBeFocused();
    await expect(control).toHaveValue('draft');
    await expect(page.locator('[data-cascader-prefix-portal]')).toContainText('Parent / Alpha');
    await expect(page.getByLabel('Cascader prefix value', { exact: true }))
      .toHaveText('["p","b"]');
  }
  await tag.click();

  await expect(page.getByLabel('Cascader prefix value', { exact: true })).toHaveText('[]');
});
