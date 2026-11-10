import { describe, expect, it } from 'vitest';
import { getDirectoryRangeKeys, getDirectorySelectedNodes } from './directory-tree.engine';
import type { TreeDataNode } from './tree.types';

const nodes: TreeDataNode[] = [
  { key: 0, children: [
    { key: 'a' }, { key: 'locked', disabled: true },
    { key: 'readonly', selectable: false }, { key: 'b' }
  ] },
  { key: 'other', children: [{ key: 'x' }] },
  { key: 'z' }
];

describe('DirectoryTree ranges', () => {
  it('uses aliased keys and children for ranges and returns original records in DFS order', () => {
    const zero = { id: 0, key: 'raw-zero', metadata: { name: 'Zero' } };
    const last = { id: 'last', key: 'raw-last', metadata: { name: 'Last' } };
    const root = { id: 'root', nodes: [zero, { id: 'locked', disabled: true }, last],
      children: [{ id: 'phantom' }] };
    const fields = { key: 'id', children: 'nodes' };

    expect(getDirectoryRangeKeys([root], ['root'], 0, 'last', fields)).toEqual([0, 'last']);
    expect(getDirectoryRangeKeys([root], [], 'root', 'last', fields)).toEqual(['root']);
    const selected = getDirectorySelectedNodes([root], ['last', 0], fields);
    expect(selected).toEqual([zero, last]);
    expect(selected[0]).toBe(zero);
    expect(selected[1]).toBe(last);
  });
  it('selects visible enabled intermediate nodes in tree order in either direction', () => {
    expect(getDirectoryRangeKeys(nodes, [0, 'other'], 'a', 'x'))
      .toEqual(['a', 'b', 'other', 'x']);
    expect(getDirectoryRangeKeys(nodes, [0, 'other'], 'x', 'a'))
      .toEqual(['a', 'b', 'other', 'x']);
  });
  it('keeps zero as an endpoint and excludes descendants of collapsed branches', () => {
    expect(getDirectoryRangeKeys(nodes, [], 0, 'z')).toEqual([0, 'other', 'z']);
    expect(getDirectoryRangeKeys(nodes, [], 0, 0)).toEqual([0]);
  });
  it('does not invent a range without a prior anchor', () => {
    expect(getDirectoryRangeKeys(nodes, [0], 'a', null)).toEqual([]);
    expect(getDirectoryRangeKeys(nodes, [0], undefined, 'a')).toEqual([]);
  });
});

describe('DirectoryTree selected nodes', () => {
  it('returns original nodes in full tree order, including descendants of collapsed branches', () => {
    const result = getDirectorySelectedNodes(nodes, ['x', 'b', 'a', 'missing']);

    expect(result).toEqual([nodes[0].children![0], nodes[0].children![3], nodes[1].children![0]]);
    expect(result[0]).toBe(nodes[0].children![0]);
  });
});
