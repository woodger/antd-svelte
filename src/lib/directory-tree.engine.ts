import { getTreeChildren } from './tree.engine';
import type { TreeFieldNames, TreeKey } from './tree.types';

// DirectoryTree/dictUtil Ant Design 6.6.8; MIT, vendor/LICENSE.ant-design.
function traverse<Data extends object>(
  nodes: readonly Data[],
  visit: (node: Data) => boolean,
  fieldNames?: TreeFieldNames
) {
  for (const node of nodes) {
    if (visit(node)) traverse(getTreeChildren(node, fieldNames), visit, fieldNames);
  }
}

function nodeKey(node: object, fieldNames?: TreeFieldNames): TreeKey | undefined {
  const key: unknown = Reflect.get(node, fieldNames?.key || 'key');
  return typeof key === 'string' || typeof key === 'number' || typeof key === 'bigint'
    ? key : undefined;
}

export function getDirectoryRangeKeys<Data extends object>(
  treeData: readonly Data[],
  expandedKeys: readonly TreeKey[],
  startKey: TreeKey | null | undefined,
  endKey: TreeKey | null | undefined,
  fieldNames?: TreeFieldNames
): TreeKey[] {
  if (startKey == null || endKey == null) return [];
  if (startKey === endKey) return [startKey];

  const keys: TreeKey[] = [];
  let record: 'none' | 'start' | 'end' = 'none';

  traverse(treeData, node => {
    if (record === 'end') return false;
    const key = nodeKey(node, fieldNames);
    if (key === undefined) return false;
    if (key === startKey || key === endKey) {
      keys.push(key);
      if (record === 'none') record = 'start';
      else {
        record = 'end';
        return false;
      }
    } else if (record === 'start' && !Reflect.get(node, 'disabled')
      && Reflect.get(node, 'selectable') !== false) {
      keys.push(key);
    }
    return expandedKeys.includes(key);
  }, fieldNames);

  return keys;
}

/** selectedNodes идёт в порядке полного дерева, независимо от порядка keys. */
export function getDirectorySelectedNodes<Data extends object>(
  treeData: readonly Data[],
  keys: readonly TreeKey[],
  fieldNames?: TreeFieldNames
): Data[] {
  const remaining = [...keys];
  const nodes: Data[] = [];

  traverse(treeData, node => {
    const key = nodeKey(node, fieldNames);
    const index = key === undefined ? -1 : remaining.indexOf(key);
    if (index !== -1) {
      nodes.push(node);
      remaining.splice(index, 1);
    }
    return remaining.length > 0;
  }, fieldNames);

  return nodes;
}
