import type { TreeDataNode, TreeKey } from './tree.types';

// DirectoryTree/dictUtil Ant Design 6.6.8; MIT, vendor/LICENSE.ant-design.
function traverse(
  nodes: readonly TreeDataNode[],
  visit: (node: TreeDataNode) => boolean
) {
  for (const node of nodes) {
    if (visit(node)) traverse(node.children ?? [], visit);
  }
}

export function getDirectoryRangeKeys(
  treeData: readonly TreeDataNode[],
  expandedKeys: readonly TreeKey[],
  startKey: TreeKey | null | undefined,
  endKey: TreeKey | null | undefined
): TreeKey[] {
  if (startKey == null || endKey == null) return [];
  if (startKey === endKey) return [startKey];

  const keys: TreeKey[] = [];
  let record: 'none' | 'start' | 'end' = 'none';

  traverse(treeData, node => {
    if (record === 'end') return false;
    if (node.key === startKey || node.key === endKey) {
      keys.push(node.key);
      if (record === 'none') record = 'start';
      else {
        record = 'end';
        return false;
      }
    } else if (record === 'start' && !node.disabled && node.selectable !== false) {
      keys.push(node.key);
    }
    return expandedKeys.includes(node.key);
  });

  return keys;
}

/** selectedNodes идёт в порядке полного дерева, независимо от порядка keys. */
export function getDirectorySelectedNodes(
  treeData: readonly TreeDataNode[],
  keys: readonly TreeKey[]
): TreeDataNode[] {
  const remaining = [...keys];
  const nodes: TreeDataNode[] = [];

  traverse(treeData, node => {
    const index = remaining.indexOf(node.key);
    if (index !== -1) {
      nodes.push(node);
      remaining.splice(index, 1);
    }
    return remaining.length > 0;
  });

  return nodes;
}
