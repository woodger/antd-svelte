import type { TreeCheckedKeys, TreeDataNode, TreeFieldNames, TreeKey } from './tree.types';
export interface TreeEntity<Data extends object = TreeDataNode> {
  key: TreeKey;
  node: Data;
  parent?: TreeEntity<Data>;
  children: TreeEntity<Data>[];
  level: number;
  pos: string;
  index: number;
  siblings: number;
  ends: boolean[];
}
export function buildTreeEntities<Data extends object = TreeDataNode>(
  nodes: readonly Data[],
  fieldNames?: TreeFieldNames
) {
  const entities = new Map<string, TreeEntity<Data>>();
  const keyField = fieldNames?.key || 'key';
  const childrenField = fieldNames?.children || 'children';

  function walk(list: readonly Data[], parent?: TreeEntity<Data>) {
    return list.map((node, index): TreeEntity<Data> => {
      const pos = `${parent?.pos ?? '0'}-${index}`;
      const value: unknown = Reflect.get(node, keyField);
      const key = value ?? pos;
      if (typeof key !== 'string' && typeof key !== 'number' && typeof key !== 'bigint') {
        throw new TypeError('Tree data key must be a string, number or bigint');
      }

      const entry: TreeEntity<Data> = {
        key,
        node,
        parent,
        children: [],
        level: parent ? parent.level + 1 : 0,
        pos,
        index,
        siblings: list.length,
        ends: [...parent?.ends ?? [], index === list.length - 1]
      };
      const children: unknown = Reflect.get(node, childrenField);
      if (children && !Array.isArray(children)) {
        throw new TypeError('Tree data children must be an array');
      }

      entities.set(String(key), entry);
      // Один Data type применяется также к рекурсивному полю, заданному fieldNames.
      entry.children = walk((children || []) as readonly Data[], entry);
      return entry;
    });
  }
  const roots = walk(nodes);
  // Entity index upstream — object: integer keys обходятся раньше строковых.
  const ordered = Object.keys(Object.fromEntries(entities)).map(key => entities.get(key)!);
  return { entities, ordered, roots };
}
export type TreeIndex<Data extends object = TreeDataNode> =
  ReturnType<typeof buildTreeEntities<Data>>;
export function flattenTree(index: TreeIndex, keys: readonly TreeKey[]) {
  const expanded = new Set(keys);
  const result: TreeEntity[] = [];
  function walk(entries: readonly TreeEntity[]) {
    for (const entry of entries) {
      result.push(entry);
      if (expanded.has(entry.key))
        walk(entry.children);
    }
  }
  walk(index.roots);
  return result;
}
export function expandTreeParents(keys: readonly TreeKey[], index: TreeIndex): TreeKey[] {
  const expanded = new Set<TreeKey>();
  function up(key: TreeKey) {
    if (expanded.has(key)) return;
    const entry = index.entities.get(String(key));
    if (!entry) return;
    expanded.add(key);
    if (!entry.node.disabled && entry.parent)
      up(entry.parent.key);
  }
  keys.forEach(up);
  return [...expanded];
}
export function treeLeaf(node: TreeDataNode, loadData: boolean, loaded: boolean): boolean {
  if (node.isLeaf === false) return false;
  return Boolean(
    node.isLeaf
    || !loadData
    && !node.children?.length
    || loadData
    && loaded
    && !node.children?.length
  );
}
export function treeCheckDisabled(node: TreeDataNode): boolean {
  return Boolean(node.disabled || node.disableCheckbox || node.checkable === false);
}
export function parseTreeChecked(keys: readonly TreeKey[] | TreeCheckedKeys): TreeCheckedKeys {
  return Array.isArray(keys) ? { checked: keys, halfChecked: [] } : keys as TreeCheckedKeys;
}
// conductUtil из rc-tree 1.4.0; MIT, vendor/LICENSE.rc-tree. Disabled nodes разрывают conduction.
export function conductTreeCheck(
  keys: readonly TreeKey[],
  index: TreeIndex,
  cleanHalf?: readonly TreeKey[]
): { checked: TreeKey[]; halfChecked: TreeKey[]; } {
  const checked = new Set(keys.filter(key => index.entities.has(String(key))));
  let half = new Set(cleanHalf);
  const clean = cleanHalf !== undefined;
  const levels = new Map<number, TreeEntity[]>();
  let max = 0;
  for (const entry of index.ordered) {
    const level = levels.get(entry.level) ?? [];
    level.push(entry);
    levels.set(entry.level, level);
    max = Math.max(max, entry.level);
  }
  for (let level = 0; level <= max; level++)
    for (const entry of levels.get(level) ?? []) {
      if (treeCheckDisabled(entry.node))
        continue;
      if (clean ? !checked.has(entry.key) && !half.has(entry.key) : checked.has(entry.key))
        for (const child of entry.children.filter(child => !treeCheckDisabled(child.node))) {
          if (clean)
            checked.delete(child.key); else checked.add(child.key);
        }
    }
  half = new Set();
  const visited = new Set<TreeKey>();
  for (let level = max; level >= 0; level--)
    for (const entry of levels.get(level) ?? []) {
      const parent = entry.parent;
      if (treeCheckDisabled(entry.node) || !parent || visited.has(parent.key))
        continue;
      if (treeCheckDisabled(parent.node)) {
        visited.add(parent.key);
        continue;
      }
      const children = parent.children.filter(child => !treeCheckDisabled(child.node));
      const all = children.every(child => checked.has(child.key));
      const partial = children.some(child => checked.has(child.key) || half.has(child.key));
      if (all && !clean)
        checked.add(parent.key);
      if (!all && clean)
        checked.delete(parent.key);
      if (partial)
        half.add(parent.key);
      visited.add(parent.key);
    }
  return { checked: [...checked], halfChecked: [...half].filter(key => !checked.has(key)) };
}
export function toggleTreeCheck(
  key: TreeKey,
  checked: readonly TreeKey[],
  index: TreeIndex,
  next: boolean
) {
  const filled = conductTreeCheck([...checked, key], index);
  return next
    ? filled
    : conductTreeCheck(filled.checked.filter(item => item !== key), index, filled.halfChecked);
}
export function selectTreeKeys(
  keys: readonly TreeKey[],
  key: TreeKey,
  multiple: boolean,
  wasSelected?: boolean
): TreeKey[] {
  // Selector использует snapshot узла до onExpand/onClick, даже если callbacks обновили keys.
  if (wasSelected !== undefined) {
    if (!multiple) return wasSelected ? [] : [key];
    if (wasSelected) return keys.filter(item => item !== key);
    return keys.includes(key) ? [...keys] : [...keys, key];
  }
  return keys.includes(key) ? keys.filter(item => item !== key) : multiple ? [...keys, key] : [
    key
  ];
}
