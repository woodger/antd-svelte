import { test, expect } from './test';
import reference from './fixtures/ant-design-tree-select-prefix-reference.json' with { type: 'json' };
import { snapshotTreeSelectPrefix } from './tree-select-prefix-metrics';

test.use({ viewport: reference.reference.viewport });

for (const entry of reference.cases) {
  for (const scope of ['normal', 'nested', 'sibling'] as const) {
    test(`TreeSelect prefixes match Source ${entry.sample.id}/${scope}`, async ({ page }) => {
      await page.goto('/?fixture=tree-select-prefix');
      await page.getByRole('combobox', { name: 'TreeSelect prefix sample', exact: true })
        .selectOption(entry.sample.id);
      await page.getByRole('combobox', { name: 'TreeSelect prefix scope', exact: true }).selectOption(scope);
      if ('opened' in entry.sample && entry.sample.opened) {
        await page.getByRole('combobox', { name: 'Prefix choices', exact: true }).click();
      }
      await page.mouse.move(1270, 890);

      const expected = structuredClone(entry.result[scope]);
      if (scope !== 'sibling' && entry.nativeTreeStyles) {
        // Source local prefix теряет tree CSS; raw control/popup остаются эталоном.
        expected.tree = entry.nativeTreeStyles[scope].tree;
        expected.nodes = entry.nativeTreeStyles[scope].nodes;
      }

      await expect.poll(() => page.evaluate(snapshotTreeSelectPrefix)).toEqual(expected);
    });
  }
}

test('TreeSelect prefixes preserve the open search editor, tree rows, refs and form values', async ({ page }) => {
  await page.goto('/?fixture=tree-select-prefix');
  await page.getByRole('checkbox', { name: 'Live TreeSelect prefix', exact: true }).check();
  const control = page.getByRole('combobox', { name: 'Prefix choices', exact: true });
  await control.fill('draft');
  await control.evaluate((node: HTMLInputElement) => node.setSelectionRange(1, 4, 'backward'));
  const root = page.locator('.fixture-tree-select-prefix');
  const popup = page.locator('[data-ant-tree-select-prefix][popover]');
  const row = page.getByRole('treeitem', { name: 'Alpha', exact: true });
  const oldRoot = await root.elementHandle();
  const oldInput = await control.elementHandle();
  const oldPopup = await popup.elementHandle();
  const oldRow = await row.elementHandle();
  const id = await control.getAttribute('id');

  for (const step of reference.transitions) {
    await page.getByRole('textbox', { name: 'Live TreeSelect prefix value', exact: true })
      .evaluate((node: HTMLInputElement, value) => {
        node.value = value;
        node.dispatchEvent(new Event('input', { bubbles: true }));
      }, step.prefix);

    await expect.poll(() => page.evaluate(snapshotTreeSelectPrefix)).toEqual(step.result);
    expect(await root.evaluate((node, old) => node === old, oldRoot)).toBe(true);
    expect(await control.evaluate((node, old) => node === old, oldInput)).toBe(true);
    expect(await popup.evaluate((node, old) => node === old, oldPopup)).toBe(true);
    expect(await row.evaluate((node, old) => node === old, oldRow)).toBe(true);
    await expect(control).toBeFocused();
    await expect(control).toHaveValue('draft');
    await expect(control).toHaveAttribute('id', id!);
    expect(await control.evaluate((node: HTMLInputElement) =>
      [node.selectionStart, node.selectionEnd, node.selectionDirection])).toEqual(step.selection);
    await expect(page.getByLabel('TreeSelect prefix refs', { exact: true })).toHaveText('true');
    await expect(page.getByLabel('TreeSelect prefix events', { exact: true })).toHaveText('search:draft');
    expect(await page.locator('form').evaluate(node =>
      new FormData(node as HTMLFormElement).get('choice'))).toBe('b');
  }
  await row.click();

  await expect(page.getByLabel('TreeSelect prefix events', { exact: true }))
    .toContainText('change:"a"|select:a');
  expect(await page.locator('form').evaluate(node =>
    new FormData(node as HTMLFormElement).get('choice'))).toBe('a');
});

test('TreeSelect local prefix changes retain portalled multiple tags and their shared Tree adapter', async ({ page }) => {
  await page.goto('/?fixture=tree-select-prefix');
  await page.getByRole('checkbox', { name: 'Live TreeSelect prefix', exact: true }).check();
  await page.getByRole('checkbox', { name: 'Multiple prefix TreeSelect', exact: true }).check();
  await page.getByRole('checkbox', { name: 'Portal prefix TreeSelect', exact: true }).check();
  const control = page.getByRole('combobox', { name: 'Prefix choices', exact: true });
  await control.fill('held');
  const tree = page.getByRole('tree', { name: 'Prefix choices', exact: true });
  const tag = page.getByRole('button', { name: 'Remove Beta', exact: true });
  const oldTree = await tree.elementHandle();
  const oldTag = await tag.elementHandle();

  await page.getByRole('textbox', { name: 'Local TreeSelect prefix value', exact: true })
    .evaluate((node: HTMLInputElement) => {
      node.value = 'owner';
      node.dispatchEvent(new Event('input', { bubbles: true }));
    });

  await expect(page.locator('.fixture-tree-select-prefix')).toHaveClass(/owner/);
  await expect(page.locator('[data-ant-tree-select-prefix][popover]')).toHaveClass(/owner-dropdown/);
  expect(await tree.evaluate((node, old) => node === old, oldTree)).toBe(true);
  expect(await tag.evaluate((node, old) => node === old, oldTag)).toBe(true);
  await expect(control).toBeFocused();
  await expect(control).toHaveValue('held');
  await expect(page.locator('[data-tree-select-prefix-portal]')).toContainText('Alpha');
  await expect(page.locator('[data-ant-tree-prefix="ant-tree"]')).toHaveCount(1);
  await tag.click();

  expect(await page.locator('form').evaluate(node =>
    new FormData(node as HTMLFormElement).getAll('choice'))).toEqual([]);
});

test('TreeSelect prefix updates retain an in-flight child load and publish its result once', async ({ page }) => {
  await page.goto('/?fixture=tree-select-prefix');
  await page.getByRole('checkbox', { name: 'Live TreeSelect prefix', exact: true }).check();
  await page.getByRole('checkbox', { name: 'Lazy prefix TreeSelect', exact: true }).check();
  const control = page.getByRole('combobox', { name: 'Prefix choices', exact: true });
  await control.click();
  await page.getByRole('button', { name: 'Start prefix load', exact: true }).dispatchEvent('click');
  await expect(page.getByLabel('TreeSelect prefix requests', { exact: true })).toHaveText('1');
  const row = page.getByRole('treeitem', { name: 'Pending', exact: true });
  const oldRow = await row.elementHandle();
  const oldInput = await control.elementHandle();

  await page.getByRole('textbox', { name: 'Live TreeSelect prefix value', exact: true })
    .evaluate((node: HTMLInputElement) => {
      node.value = 'next';
      node.dispatchEvent(new Event('input', { bubbles: true }));
    });

  expect(await row.evaluate((node, old) => node === old, oldRow)).toBe(true);
  expect(await control.evaluate((node, old) => node === old, oldInput)).toBe(true);
  await expect(control).toBeFocused();
  await expect(page.getByLabel('TreeSelect prefix requests', { exact: true })).toHaveText('1');
  await page.getByRole('button', { name: 'Resolve prefix load', exact: true }).dispatchEvent('click');

  await expect(page.getByRole('treeitem', { name: 'Loaded child', exact: true })).toBeVisible();
  await expect(page.getByLabel('TreeSelect prefix events', { exact: true })).toHaveText('loaded:pending');
  await expect(page.getByLabel('TreeSelect prefix requests', { exact: true })).toHaveText('1');
});
