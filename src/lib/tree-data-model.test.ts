import { describe, expect, it } from 'vitest';
import reference from '../../tests/browser/fixtures/ant-design-tree-data-model-reference.json';
import registry from '../../docs/reference/ant-design-porting/registry.json';
import { createTree } from './tree-data-model';
import type { TreeDataEntity, TreeFieldNames, TreeInstance, TreeKey } from './tree.types';

function key(value: unknown) {
  return { type: typeof value, value: value == null ? null : String(value) };
}

function queryKey(query: { type: string; value: string | null; }): TreeKey {
  if (query.type === 'number') return Number(query.value);
  return query.value ?? '';
}

function collectObjects(value: unknown, result = new Set<object>()) {
  if (value === null || typeof value !== 'object' || result.has(value)) return result;

  result.add(value);
  for (const child of Object.values(value)) collectObjects(child, result);
  return result;
}

function snapshot(
  model: TreeInstance<object>,
  data: readonly object[],
  fields: TreeFieldNames | undefined,
  queries: { query: { type: string; value: string | null; }; }[],
  savedGetPath = model.getPath
): unknown {
  const originals = collectObjects(data);
  const rawKey = (node: object) => key(Reflect.get(node, fields?.key || 'key'));
  const entry = (entity: TreeDataEntity<object>) => ({
    key: key(entity.key),
    pos: entity.pos,
    level: entity.level,
    index: entity.index,
    nodeKey: rawKey(entity.node),
    originalKey: key(Reflect.get(entity.node, 'key')),
    title: Reflect.get(entity.node, fields?.title || 'title'),
    payload: Reflect.get(entity.node, 'payload'),
    originalNode: originals.has(entity.node),
    nodes: entity.nodes.map(rawKey),
    originalPathNodes: entity.nodes.every(node => originals.has(node)),
    parent: entity.parent ? key(entity.parent.key) : null,
    hasChildren: Object.hasOwn(entity, 'children'),
    children: entity.children?.map(child => key(child.key)) ?? [],
    fields: Object.keys(entity).sort()
  });
  const paths = (getPath: TreeInstance<object>['getPath']) => queries.map(({ query }) => ({
    query,
    path: getPath(queryKey(query)).map(entry)
  }));

  // Raw UMD artifact сериализован JSON: отсутствующие optional поля не записаны.
  return JSON.parse(JSON.stringify({
    stable: savedGetPath === model.getPath,
    paths: paths(model.getPath),
    savedPaths: paths(savedGetPath)
  }));
}

describe('Ant Design Tree.useTree source conformance', () => {
  it('pins data entities, updates and inherited-key observations to the studied source', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256,
      delegate: '@rc-component/tree 1.4.0'
    });
    expect(reference.cases).toHaveLength(5);
    expect(reference.inherited.paths.every(entry => entry.path[0].invalidEntity)).toBe(true);
  });

  it.each(reference.cases)('preserves source entities and raw identities for $sample.id', entry => {
    const fields = 'fields' in entry.sample ? entry.sample.fields : undefined;
    const model = createTree<object>(entry.sample.data, { fieldNames: fields });

    expect(snapshot(model, entry.sample.data, fields, entry.result.paths)).toEqual(entry.result);
  });

  it('keeps the saved function current after data and schema references change', () => {
    let data: readonly object[] = reference.cases[0].sample.data;
    let fields: TreeFieldNames | undefined;
    const model = createTree(() => data, { get fieldNames() { return fields; } });
    const saved = model.getPath;

    expect(snapshot(model, data, fields, reference.updates.initial.paths, saved))
      .toEqual(reference.updates.initial);

    data = reference.updateInputs.data;

    expect(snapshot(model, data, fields, reference.updates.data.paths, saved))
      .toEqual(reference.updates.data);

    data = reference.updateInputs.fieldsData;
    fields = { key: 'id', title: 'caption', children: 'items' };

    expect(snapshot(model, data, fields, reference.updates.fields.paths, saved))
      .toEqual(reference.updates.fields);
  });

  it('updates the schema while retaining the same raw data reference', () => {
    const data = reference.updateInputs.fieldsOnlyData;
    let fields: TreeFieldNames | undefined;
    const model = createTree<object>(data, { get fieldNames() { return fields; } });
    const saved = model.getPath;

    expect(snapshot(model, data, fields, reference.updates.fieldsOnlyInitial.paths, saved))
      .toEqual(reference.updates.fieldsOnlyInitial);

    fields = { key: 'id', title: 'caption' };

    expect(snapshot(model, data, fields, reference.updates.fieldsOnly.paths, saved))
      .toEqual(reference.updates.fieldsOnly);
  });
});

describe('Tree data model', () => {
  it('returns empty paths for missing prototype names instead of inherited non-entities', () => {
    const model = createTree([{ key: 'root' }]);

    for (const name of ['missing', 'constructor', '__proto__', 'toString']) {
      expect(model.getPath(name)).toEqual([]);
    }
  });

  it('treats falsy child fields as empty while retaining their raw values', () => {
    const data = [
      { id: 'false', items: false },
      { id: 'zero', items: 0 },
      { id: 'empty', items: '' }
    ];
    const model = createTree(data, { fieldNames: { key: 'id', children: 'items' } });

    for (const node of data) {
      const path = model.getPath(node.id);

      expect(path).toHaveLength(1);
      expect(path[0].node).toBe(node);
      expect(path[0].children).toBeUndefined();
    }
  });

  it('preserves generic payloads, bigint keys and original aliased nodes', () => {
    interface Node {
      id: TreeKey;
      payload: { writable: boolean; };
      items?: Node[];
    }
    const child: Node = { id: 0n, payload: { writable: true } };
    const root: Node = { id: 'root', payload: { writable: false }, items: [child] };
    const model = createTree([root], { fieldNames: { key: 'id', children: 'items' } });

    const path = model.getPath(0n);
    const writable: boolean = path[1].node.payload.writable;

    expect(path.map(entity => entity.key)).toEqual(['root', 0n]);
    expect(path[0].node).toBe(root);
    expect(path[1].node).toBe(child);
    expect(writable).toBe(true);
  });

  it('reuses entities between lookups and returns an independent path array each time', () => {
    const model = createTree<object>(reference.cases[0].sample.data);
    const first = model.getPath('leaf');

    const second = model.getPath('leaf');

    expect(second).not.toBe(first);
    expect(second).toEqual(first);
    expect(second[0]).toBe(first[0]);
    expect(second.at(-1)).toBe(first.at(-1));
  });
});
