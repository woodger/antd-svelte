import { describe, expect, it } from 'vitest';
import { treeSelectChildren, treeSelectData, treeSelectFields, treeSelectNodeLabel, treeSelectNodeValue } from './tree-select-data.engine';
import { filterTreeSelect, treeSelectIndex, treeSelectLabels } from './tree-select.engine';
import { flattenTree } from './tree.engine';
import reference from '../../tests/browser/fixtures/ant-design-tree-select-data-reference.json';
import { treeSelectData as sourceData, treeSelectDataSamples } from '../../tests/browser/fixtures/tree-select-data-cases';

describe('TreeSelect data fields and simple mode', () => {
  for (const sample of treeSelectDataSamples) it(`preserves the Source visible hierarchy for ${sample.id}`, () => {
    const nodes = sourceData(sample);
    const prepared = treeSelectData(nodes, sample.simple);
    const index = treeSelectIndex(prepared, sample.fields);
    const open = reference.cases.find(entry => entry.id === sample.id)!.steps
      .find(step => step.action.kind === 'open')!;
    const expanded = index.ordered.filter(node => node.children.length).map(node => node.key);

    expect(flattenTree(index, expanded).map(node => String(node.key)))
      .toEqual(open.view.nodes.map(node => node.value));
    expect(nodes).toEqual(sourceData(sample));
  });

  it('falls back for empty field names and does not expose the ignored internal title option', () => {
    expect(treeSelectFields({ value: '', label: '', children: '' }))
      .toEqual({ value: 'value', children: 'children', titles: ['title', 'label'] });
    expect(treeSelectFields({ value: 'id', label: 'caption', children: 'nodes' }))
      .toEqual({ value: 'id', children: 'nodes', titles: ['caption'] });
  });

  it('preserves zero, literal null, empty labels, label props and original payloads', () => {
    const fields = treeSelectFields({ value: 'id', label: 'caption', children: 'nodes' });
    const payload = { version: 1 };
    const node = { id: 0, value: 'shadow', caption: null, label: 'Ignored', secondary: '', payload };
    const index = treeSelectIndex([node], { value: 'id', label: 'caption' });

    expect(treeSelectNodeValue(node, fields)).toBe(0);
    expect(treeSelectNodeLabel(node, fields)).toBeNull();
    expect(treeSelectNodeLabel(node, fields, 'secondary')).toBe('');
    expect(index.values.get(0)).toBe(node);
    expect(Reflect.get(index.entities.get('0')!.node, 'payload')).toBe(payload);
    expect(treeSelectLabels([{ value: 0 }], index)[0].label).toBeNull();
    expect(treeSelectNodeLabel({ title: undefined, label: false }, treeSelectFields())).toBe(false);
    expect(treeSelectNodeLabel({ title: null, label: 'Ignored' }, treeSelectFields())).toBeNull();
  });

  it('keeps the input collection without simple mode and preserves field children references', () => {
    const child = { id: 1 };
    const nodes = [{ id: 0, nodes: [child] }];
    const fields = treeSelectFields({ children: 'nodes' });

    expect(treeSelectData(nodes)).toBe(nodes);
    expect(treeSelectData(nodes, false)).toBe(nodes);
    expect(treeSelectChildren(nodes[0], fields)).toBe(nodes[0].nodes);
    expect(() => treeSelectChildren({ nodes: {} }, fields)).toThrow(TypeError);
  });

  it('builds flat data without mutating frozen nodes or a pre-existing children array', () => {
    const existing = Object.freeze({ value: 'existing', title: 'Existing' });
    const children = Object.freeze([existing]);
    const parent = Object.freeze({ id: 0, pId: null, value: 0, children });
    const child = Object.freeze({ id: 1, pId: 0, value: 1 });
    const nodes = Object.freeze([parent, child]);
    const result = treeSelectData(nodes, true);

    expect(result).toEqual([{ ...parent, key: 0, children: [existing, { ...child, key: 1 }] }]);
    expect(parent.children).toBe(children);
    expect(parent.children).toEqual([existing]);
    expect(result[0]).not.toBe(parent);
  });

  it('keeps insertion order, distinguishes string and number ids and replaces duplicate ids like Source', () => {
    const input = [
      { id: 1, pId: null, value: 'first' },
      { id: '1', pId: null, value: 'string' },
      { id: 1, pId: null, value: 'replacement' },
      { id: '__proto__', pId: 1, value: 'child' }
    ];

    expect(treeSelectData(input, true)).toEqual([
      { ...input[2], key: 1, children: [{ ...input[3], key: '__proto__' }] },
      { ...input[1], key: '1' }
    ]);
  });

  it('applies rootPId strictly and preserves canonical children with aliased field names', () => {
    const nodes = [{ id: 0, pId: 'ROOT', code: 0 }, { id: 1, pId: 0, code: 1 },
      { id: 2, pId: 'missing', code: 2 }];
    const result = treeSelectData(nodes, { rootPId: 'ROOT' });

    expect(result).toHaveLength(1);
    expect(treeSelectChildren(result[0], treeSelectFields())).toHaveLength(1);
    expect(treeSelectChildren(result[0], treeSelectFields({ children: 'nodes' }))).toEqual([]);
    expect(treeSelectData(nodes, { rootPId: null })).toHaveLength(2);
  });

  it('uses literal treeNodeFilterProp, preserves aliases and isolates callback field mutations', () => {
    const child = { code: 1, caption: 'Alpha', isLeaf: true };
    const nodes = [{ code: 0, caption: 'Parent', nodes: [child] }];
    const fields = { value: 'code', label: 'caption', children: 'nodes' };

    expect(filterTreeSelect(nodes, '1', {}, fields)).toEqual([]);
    expect(filterTreeSelect(nodes, 'Alpha', { treeNodeFilterProp: 'caption' }, fields))
      .toEqual([{ ...nodes[0], isLeaf: undefined, nodes: [{ ...child, isLeaf: undefined, nodes: [] }] }]);
    const filtered = filterTreeSelect(nodes, 'Alpha', { filterTreeNode: (_text, node) => {
      const value = node.caption;
      node.caption = 'Consumer mutation';
      return value === 'Parent';
    } }, fields);
    expect(filtered[0].caption).toBe('Parent');
    expect(nodes[0].caption).toBe('Parent');
  });
});
