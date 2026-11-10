// @rc-component/tree-select 1.16.1; MIT, vendor/LICENSE.rc-tree-select.
import type { TreeSelectFieldNames, TreeSelectLabel, TreeSelectRawValue, TreeSelectSimpleMode } from './tree-select.types';

export function treeSelectFields(fields?: TreeSelectFieldNames) {
  return { value: fields?.value || 'value', children: fields?.children || 'children',
    titles: fields?.label ? [fields.label] : ['title', 'label'] };
}

export function treeSelectNodeValue(node: object, fields: ReturnType<typeof treeSelectFields>) {
  return Reflect.get(node, fields.value) as TreeSelectRawValue;
}

export function treeSelectNodeLabel(
  node: object,
  fields: ReturnType<typeof treeSelectFields>,
  labelProp?: string
): TreeSelectLabel {
  if (labelProp) return Reflect.get(node, labelProp) as TreeSelectLabel;
  for (const field of fields.titles) {
    const value: unknown = Reflect.get(node, field);
    if (value !== undefined) return value as TreeSelectLabel;
  }
}

export function treeSelectChildren<Data extends object>(
  node: Data,
  fields: ReturnType<typeof treeSelectFields>
): readonly Data[] {
  const children: unknown = Reflect.get(node, fields.children);
  if (children && !Array.isArray(children)) throw new TypeError('Tree data children must be an array');
  return (children || []) as readonly Data[];
}

/** Simple mode использует canonical children, независимо от fieldNames, как Source. */
export function treeSelectData<Data extends object>(
  nodes: readonly Data[],
  mode?: TreeSelectSimpleMode
): readonly Data[] {
  if (!mode) return nodes;
  const { id, pId, rootPId } = {
    id: 'id', pId: 'pId', rootPId: null, ...(typeof mode === 'object' ? mode : {})
  };
  const map = new Map<unknown, Data>();
  const roots: Data[] = [];
  for (const node of nodes) {
    const value: unknown = Reflect.get(node, String(id));
    const clone = { ...node, key: Reflect.get(node, 'key') || value };
    const children: unknown = Reflect.get(node, 'children');
    // Source.push меняет входной children array; Native удерживает собственный shallow copy.
    if (Array.isArray(children)) Reflect.set(clone, 'children', [...children]);
    map.set(value, clone);
  }
  for (const node of map.values()) {
    const parentKey: unknown = Reflect.get(node, String(pId));
    const parent = map.get(parentKey);
    if (parent) {
      const children: unknown = Reflect.get(parent, 'children') || [];
      if (!Array.isArray(children)) throw new TypeError('Tree data children must be an array');
      children.push(node);
      Reflect.set(parent, 'children', children);
    } else if (parentKey === rootPId || rootPId === null) roots.push(node);
  }
  return roots;
}
