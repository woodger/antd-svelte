import type {
  TreeCheckedKeys,
  TreeDataNode,
  TreeFieldNames,
  TreeKey,
  TreeTitleContent
} from './tree.types';
import type { Snippet } from 'svelte';

export function getTreeChildren<Data extends object>(
  node: Data,
  fieldNames?: TreeFieldNames
): readonly Data[] {
  const children: unknown = Reflect.get(node, fieldNames?.children || 'children');
  if (children && !Array.isArray(children)) {
    throw new TypeError('Tree data children must be an array');
  }

  // Один Data type применяется также к рекурсивному полю, заданному fieldNames.
  return (children || []) as readonly Data[];
}

export function getTreeNodeTitle<Data extends object>(
  node: Data,
  fieldNames?: TreeFieldNames,
  titleRender?: Snippet<[Data]>
): TreeTitleContent<Data> {
  const value: unknown = Reflect.get(node, fieldNames?.title || 'title');
  // Source выбирает node renderer до общего; произвольный payload не рендерится как literal.
  if (typeof value === 'function') return value as Snippet<[Data]>;
  if (titleRender) return titleRender;

  function content(value: unknown): TreeTitleContent<Data> {
    if (value == null || typeof value === 'string' || typeof value === 'number'
      || typeof value === 'boolean') return value;
    // Функциональное содержимое Native API — Svelte snippet с data-аргументом.
    if (typeof value === 'function') return value as Snippet<[Data]>;
    if (Array.isArray(value)) return value.map(child => content(child));
    throw new TypeError('Tree title must be text, a snippet or an array of renderable values');
  }

  return value === undefined ? '---' : content(value);
}
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
      entities.set(String(key), entry);
      entry.children = walk(getTreeChildren(node, fieldNames), entry);
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
export function flattenTree<Data extends object>(index: TreeIndex<Data>, keys: readonly TreeKey[]) {
  const expanded = new Set(keys);
  const result: TreeEntity<Data>[] = [];
  function walk(entries: readonly TreeEntity<Data>[]) {
    for (const entry of entries) {
      result.push(entry);
      if (expanded.has(entry.key))
        walk(entry.children);
    }
  }
  walk(index.roots);
  return result;
}
export function expandTreeParents<Data extends object>(
  keys: readonly TreeKey[],
  index: TreeIndex<Data>
): TreeKey[] {
  const expanded = new Set<TreeKey>();
  function up(key: TreeKey) {
    if (expanded.has(key)) return;
    const entry = index.entities.get(String(key));
    if (!entry) return;
    expanded.add(key);
    if (!Reflect.get(entry.node, 'disabled') && entry.parent)
      up(entry.parent.key);
  }
  keys.forEach(up);
  return [...expanded];
}
export function treeLeaf(
  node: object,
  loadData: boolean,
  loaded: boolean,
  fieldNames?: TreeFieldNames
): boolean {
  const isLeaf: unknown = Reflect.get(node, 'isLeaf');
  if (isLeaf === false) return false;
  const children = getTreeChildren(node, fieldNames);
  return Boolean(
    isLeaf
    || !loadData
    && !children.length
    || loadData
    && loaded
    && !children.length
  );
}
export function treeCheckDisabled(node: object): boolean {
  return Boolean(Reflect.get(node, 'disabled') || Reflect.get(node, 'disableCheckbox')
    || Reflect.get(node, 'checkable') === false);
}
export function parseTreeChecked(keys: readonly TreeKey[] | TreeCheckedKeys): TreeCheckedKeys {
  return Array.isArray(keys) ? { checked: keys, halfChecked: [] } : keys as TreeCheckedKeys;
}
// conductUtil из rc-tree 1.4.0; MIT, vendor/LICENSE.rc-tree. Disabled nodes разрывают conduction.
export function conductTreeCheck<Data extends object>(
  keys: readonly TreeKey[],
  index: TreeIndex<Data>,
  cleanHalf?: readonly TreeKey[]
): { checked: TreeKey[]; halfChecked: TreeKey[]; } {
  const checked = new Set(keys.filter(key => index.entities.has(String(key))));
  let half = new Set(cleanHalf);
  const clean = cleanHalf !== undefined;
  const levels = new Map<number, TreeEntity<Data>[]>();
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
export function toggleTreeCheck<Data extends object>(
  key: TreeKey,
  checked: readonly TreeKey[],
  index: TreeIndex<Data>,
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
