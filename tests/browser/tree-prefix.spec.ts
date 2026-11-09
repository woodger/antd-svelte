import { test, expect } from './test';
import reference from './fixtures/ant-design-tree-prefix-reference.json' with { type: 'json' };
import { snapshotTreePrefix } from './tree-prefix-metrics';

test.use({ viewport: reference.reference.viewport });

for (const entry of reference.cases) {
  for (const scope of ['normal', 'nested', 'sibling'] as const) {
    test(`Tree prefixes match Source ${entry.sample.id}/${scope}`, async ({ page }) => {
      await page.goto('/?fixture=tree-prefix');
      await page.getByRole('combobox', { name: 'Tree prefix sample', exact: true })
        .selectOption(entry.sample.id);
      await page.getByRole('combobox', { name: 'Tree prefix scope', exact: true }).selectOption(scope);
      await page.mouse.move(1270, 890);
      const expected = ('nativeSelection' in entry ? entry.nativeSelection?.[scope] : undefined)
        ?? ('nativeRoot' in entry ? entry.nativeRoot?.[scope] : undefined)
        ?? entry.result[scope];

      await expect.poll(() => page.evaluate(snapshotTreePrefix)).toEqual(expected);
    });
  }
}

test('Tree prefixes retain DOM/ref, active descendant, focus and selected/checked state', async ({ page }) => {
  await page.goto('/?fixture=tree-prefix');
  await page.getByRole('checkbox', { name: 'Live Tree prefix', exact: true }).check();
  const root = page.locator('.fixture-tree-prefix');
  const tree = page.getByRole('tree', { name: 'Prefix tree', exact: true });
  const title = root.getByText('Alpha', { exact: true });
  await tree.focus();
  const oldRoot = await root.elementHandle();
  const oldTree = await tree.elementHandle();
  const oldTitle = await title.elementHandle();
  const activeId = await tree.getAttribute('aria-activedescendant');

  for (const step of reference.transitions) {
    await page.getByRole('textbox', { name: 'Live Tree prefix value', exact: true })
      .evaluate((node: HTMLInputElement, value) => {
        node.value = value;
        node.dispatchEvent(new Event('input', { bubbles: true }));
      }, step.prefix);

    await expect.poll(() => page.evaluate(snapshotTreePrefix)).toEqual(step.result);
    expect(await root.evaluate((node, old) => node === old, oldRoot)).toBe(step.sameRoot);
    expect(await tree.evaluate((node, old) => node === old, oldTree)).toBe(step.sameFocus);
    expect(await title.evaluate((node, old) => node === old, oldTitle)).toBe(step.sameTitle);
    await expect(tree).toBeFocused();
    await expect(tree).toHaveAttribute('aria-activedescendant', activeId!);
    await expect(root.getByRole('checkbox', { name: 'Alpha', exact: true }))
      .toHaveAttribute('aria-checked', 'true');
    await expect(root.getByRole('checkbox', { name: 'Parent', exact: true }))
      .toHaveAttribute('aria-checked', 'mixed');
    await expect(root.getByRole('treeitem', { name: 'Beta', exact: true }))
      .toHaveAttribute('aria-selected', 'true');
    await expect(page.getByLabel('Tree prefix events', { exact: true })).toHaveText('');
    await expect(page.getByLabel('Tree prefix ref', { exact: true })).toHaveText('connected');
  }
  await page.keyboard.press('Home');
  await page.keyboard.press('Space');

  await expect(root.getByRole('checkbox', { name: 'Parent', exact: true }))
    .toHaveAttribute('aria-checked', 'true');
  await expect(page.getByLabel('Tree prefix events', { exact: true })).toHaveText('check');
});

test('Tree local prefixes retain a pending load, switcher, focus and loaded children', async ({ page }) => {
  await page.goto('/?fixture=tree-prefix');
  await page.getByRole('checkbox', { name: 'Live Tree prefix', exact: true }).check();
  await page.getByRole('checkbox', { name: 'Lazy prefix Tree', exact: true }).check();
  const tree = page.getByRole('tree', { name: 'Prefix tree', exact: true });
  const lazy = tree.getByRole('treeitem', { name: 'Lazy', exact: true });
  const switcher = lazy.getByRole('button', { name: 'Expand', exact: true });
  await switcher.click();
  await tree.focus();
  const oldNode = await lazy.elementHandle();
  const id = await lazy.getAttribute('id');
  const label = await lazy.getAttribute('aria-labelledby');
  await expect(lazy).toHaveAttribute('aria-busy', 'true');
  await page.getByRole('textbox', { name: 'Local Tree prefix value', exact: true })
    .evaluate((node: HTMLInputElement) => {
      node.value = 'nodes';
      node.dispatchEvent(new Event('input', { bubbles: true }));
    });

  await expect(lazy).toHaveClass(/\bnodes-treenode-loading\b/);
  expect(await lazy.evaluate((node, old) => node === old, oldNode)).toBe(true);
  await expect(lazy).toHaveAttribute('id', id!);
  await expect(lazy).toHaveAttribute('aria-labelledby', label!);
  await expect(tree).toBeFocused();
  await expect(page.getByLabel('Tree prefix events', { exact: true }))
    .toHaveText('expand:lazy|request:lazy');
  await page.getByRole('button', { name: 'Complete prefix Tree load', exact: true }).click();

  await expect(tree.getByRole('treeitem', { name: 'Loaded child', exact: true })).toBeVisible();
  await expect(lazy).not.toHaveAttribute('aria-busy');
  await expect(page.getByLabel('Tree prefix events', { exact: true }))
    .toHaveText('expand:lazy|request:lazy|loaded:lazy');
});
