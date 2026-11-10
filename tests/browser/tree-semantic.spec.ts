import { test, expect } from './test';
import reference from './fixtures/ant-design-tree-semantic-reference.json' with { type: 'json' };
import { readTreeSemantics } from './tree-semantic-metrics';

for (const [index, entry] of reference.cases.entries()) {
  test(`Tree semantic slots match Source for ${entry.sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=tree-semantic');
    await page.getByRole('combobox', { name: 'Tree semantic sample', exact: true })
      .selectOption(String(index));
    const prefix = `${'prefix' in entry.sample ? entry.sample.prefix : 'ant'}-tree`;
    // React motion/className snapshots сохранены как raw; common props проверяют class markers.
    const initial = {
      root: entry.initial.root, list: entry.initial.list,
      nodes: entry.initial.nodes, peer: entry.initial.peer
    };
    const updated = {
      root: entry.updated.root, list: entry.updated.list,
      nodes: entry.updated.nodes, peer: entry.updated.peer
    };

    await expect.poll(() => page.evaluate(readTreeSemantics, prefix)).toEqual(initial);

    if ('live' in entry.sample || 'reactive' in entry.sample) {
      await page.getByRole('button', { name: 'Update tree semantics', exact: true }).click();
      await expect.poll(() => page.evaluate(readTreeSemantics, prefix)).toEqual(updated);
    }
  });
}

test('Tree updates component slots without replacing selection, focus, IDs or refs', async ({ page }) => {
  const index = reference.cases.findIndex(entry => entry.sample.id === 'live-context-functions');
  await page.goto('/?fixture=tree-semantic');
  await page.getByRole('combobox', { name: 'Tree semantic sample', exact: true })
    .selectOption(String(index));
  const host = page.locator('[data-tree-semantic-host]');
  const tree = page.getByRole('tree', { name: 'Semantic target', exact: true });
  await host.getByText('Zero', { exact: true }).click();
  await tree.press('Home');
  const active = await tree.getAttribute('aria-activedescendant');
  const root = await host.locator('[data-ant-tree-root]').elementHandle();
  const zero = await host.getByRole('treeitem', { name: 'Zero', exact: true }).elementHandle();
  const peer = (await page.evaluate(readTreeSemantics, 'ant-tree')).peer;

  await page.getByRole('button', { name: 'Update tree semantics', exact: true })
    .evaluate(node => {
      if (!(node instanceof HTMLButtonElement)) throw Error('Expected semantic update button');
      node.click();
    });

  await expect(tree).toBeFocused();
  await expect(tree).toHaveAttribute('aria-activedescendant', active!);
  await expect(host.locator('[data-ant-tree-root]')).toHaveClass(/updated-context-root/);
  await expect(host.locator('[data-ant-tree-root]')).toHaveCSS('color', 'rgb(40, 50, 60)');
  await expect(host.getByRole('treeitem', { name: 'Zero', exact: true }))
    .toHaveAttribute('aria-selected', 'true');
  expect(await root!.evaluate(node => node === document.querySelector('[data-tree-semantic-host] [data-ant-tree-root]')))
    .toBe(true);
  expect(await zero!.evaluate(node => node === document.querySelector('[data-tree-semantic-host] .ant-tree-treenode-selected')))
    .toBe(true);
  expect((await page.evaluate(readTreeSemantics, 'ant-tree')).peer).toEqual(peer);
  await expect(page.locator('[data-tree-semantic-ref]')).toHaveText('DIV');
});

test('TreeSelect keeps its independent tree when ConfigProvider.tree config changes', async ({ page }) => {
  const index = reference.cases.findIndex(entry => entry.sample.id === 'live-context-functions');
  await page.goto('/?fixture=tree-semantic');
  await page.getByRole('combobox', { name: 'Tree semantic sample', exact: true })
    .selectOption(String(index));
  await page.getByRole('button', { name: 'Open semantic select', exact: true }).click();
  const leaf = page.getByRole('treeitem', { name: 'Select leaf', exact: true });
  await expect(leaf).toBeVisible();
  const node = await leaf.elementHandle();
  const before = await leaf.locator('.ant-tree-title').evaluate(element => {
    const css = getComputedStyle(element);
    return { color: css.color, fontSize: css.fontSize };
  });

  await page.getByRole('button', { name: 'Update tree semantics', exact: true }).click();

  await expect(leaf).toBeVisible();
  await expect(leaf.locator('[class*="context-"]')).toHaveCount(0);
  expect(await leaf.locator('.ant-tree-title').evaluate(element => {
    const css = getComputedStyle(element);
    return { color: css.color, fontSize: css.fontSize };
  })).toEqual(before);
  expect(await node!.evaluate(element => element.isConnected)).toBe(true);
});

test('Tree refreshes pending icon slots once and ignores load settlement after unmount', async ({ page }) => {
  const index = reference.cases.findIndex(entry => entry.sample.id === 'pending-hidden-icon');
  await page.goto('/?fixture=tree-semantic');
  await page.getByRole('combobox', { name: 'Tree semantic sample', exact: true })
    .selectOption(String(index));
  const host = page.locator('[data-tree-semantic-host]');
  await expect(host.locator('[aria-busy="true"]')).toHaveCount(1);
  await expect(page.locator('[data-tree-semantic-events]')).toHaveText('["load"]');

  await page.getByRole('button', { name: 'Change pending component config', exact: true }).click();

  await expect(host.locator('[data-ant-tree-root]')).toHaveCSS('padding-left', '11px');
  await expect(host.locator('.ant-tree-iconEle')).toHaveClass(/updated-context-itemIcon/);
  await expect(page.locator('[data-tree-semantic-events]')).toHaveText('["load"]');
  await page.getByRole('checkbox', { name: 'Mount semantic tree', exact: true }).uncheck();
  const editor = page.getByRole('textbox', { name: 'Semantic tree editor', exact: true });
  await editor.fill('Retained draft');

  await page.getByRole('button', { name: 'Resolve semantic load', exact: true }).click();
  await editor.focus();

  await expect(page.locator('[data-tree-semantic-events]')).toHaveText('["load"]');
  await expect(page.locator('[data-tree-semantic-ref]')).toHaveText('none');
  await expect(editor).toHaveValue('Retained draft');
  await expect(editor).toBeFocused();
});
