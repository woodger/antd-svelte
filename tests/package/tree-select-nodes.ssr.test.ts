import { render } from 'svelte/server';
import { expect, it, vi } from 'vitest';
import { TreeSelect, TreeSelectTreeNode, TREE_SELECT_SHOW_ALL, TREE_SELECT_SHOW_CHILD, TREE_SELECT_SHOW_PARENT } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import TreeSelectNodesCase from '../browser/fixtures/TreeSelectNodesCase.svelte';
import { treeSelectNodesSamples } from '../browser/fixtures/tree-select-nodes-cases';
import reference from '../browser/fixtures/ant-design-tree-select-nodes-reference.json';

it('provides the TreeSelect node and checked strategy namespace through public exports', () => {
  expect(TreeSelect.TreeNode).toBe(TreeSelectTreeNode);
  expect([TreeSelect.SHOW_ALL, TreeSelect.SHOW_CHILD, TreeSelect.SHOW_PARENT])
    .toEqual([TREE_SELECT_SHOW_ALL, TREE_SELECT_SHOW_CHILD, TREE_SELECT_SHOW_PARENT]);
});

it.each([false, true])('preserves own children prop presence in semantic callbacks for provided=%s', provided => {
  const presence: boolean[] = [];
  const { body } = render(TreeSelect, { props: {
    treeData: [{ value: 0, title: 'Zero' }],
    ...(provided ? { children: undefined } : {}),
    classNames: ({ props }) => {
      presence.push(Object.hasOwn(props, 'children'));
      return {};
    }
  } });
  expect(body).toContain('role="combobox"');
  expect(presence.length).toBeGreaterThan(0);
  expect(presence.every(value => value === provided)).toBe(true);
});

it('pins the independent browser and DOM-free Source captures', () => {
  expect(reference.reference).toMatchObject({
    version: registry.upstream.version, revision: registry.upstream.revision,
    archiveSha256: registry.upstream.archiveSha256, treeSelect: '1.16.1', tree: '1.4.0', errors: []
  });
  expect(reference.cases).toHaveLength(23);
  expect(reference.ssr).toHaveLength(9);
  expect(reference.observations.find(entry => entry.id === 'lazy')?.calls).toEqual({ load: 2, globalIcon: 0 });
  const literal = reference.observations.find(entry => entry.id === 'literal-title-observation');
  expect(literal?.steps.at(-1)?.view.changeLabels).toBe('Node Zero');
  expect(reference.cases.find(entry => entry.id === 'rich-title')?.steps.at(-1)?.view.changeLabels)
    .toBe('Updated Zero');
});

it.each(reference.ssr)('renders the Source selected label for $id in the closed Native SSR counterpart', entry => {
  vi.useFakeTimers();
  try {
    const sample = { ...treeSelectNodesSamples.find(item => item.id === entry.id)!, closed: true };
    const { body } = render(TreeSelectNodesCase, { props: { sample } });
    expect(entry.timers).toBe(0);
    expect(entry.calls).toEqual({ load: 0, globalIcon: 0 });
    expect(entry.view.open).toBe(false);
    if (sample.rich || sample.checkable) expect(body).toContain(entry.view.selected!);
    else expect(/<input[^>]*role="combobox"[^>]*>/.exec(body)?.[0])
      .toContain(`value="${entry.view.selected}"`);
    expect(body).not.toContain('popover="manual"');
    expect(body).toContain('data-node-load-calls="0"');
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});

it.each([
  ['declared', 5], ['declared-simple', 5], ['aliases', 5], ['empty-data-wins', 0],
  ['lazy', 2], ['long-declarations', 5]
] as const)('collects %s declarations before rendering the hidden Native server tree', (id, count) => {
  vi.useFakeTimers();
  try {
    const sample = treeSelectNodesSamples.find(item => item.id === id)!;
    const { body } = render(TreeSelectNodesCase, { props: { sample } });
    expect([...body.matchAll(/role="treeitem"/g)]).toHaveLength(count);
    if (sample.override) expect(body).not.toContain('data-ant-tree-select-declarations');
    else expect(body).toContain('data-ant-tree-select-declarations');
    expect(body).toContain('popover="manual" hidden');
    expect(body).toContain('data-node-load-calls="0"');
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});
