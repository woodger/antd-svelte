import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import { createTree, type TreeFieldNames, type TreeKey } from 'antd-svelte';
import reference from '../browser/fixtures/ant-design-tree-data-model-reference.json';
import TreeDataModelScope from '../browser/fixtures/TreeDataModelScope.svelte';

describe('Tree data model package/SSR', () => {
  it.each(reference.cases)('renders $sample.id through the public factory without timers', entry => {
    vi.useFakeTimers();
    try {
      const fields = 'fields' in entry.sample ? entry.sample.fields : undefined;
      const expected = entry.result.paths.at(-2)!;

      const body = render(TreeDataModelScope, { props: {
        data: entry.sample.data,
        fieldNames: fields,
        lookup: expected.query.value ?? ''
      } }).body;

      for (const entity of expected.path) expect(body).toContain(entity.pos);
      expect(body.replace(/<!--[\s\S]*?-->/g, '')).toMatch(/data-model-stable[^>]*>true</);
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it('reads current getter data outside component lifecycle and preserves generic payloads', () => {
    interface Node {
      id: TreeKey;
      payload: { label: string; };
      items?: Node[];
    }
    let data: Node[] = [{ id: 'root', payload: { label: 'Original' } }];
    let fields: TreeFieldNames = { key: 'id', children: 'items' };
    const model = createTree(() => data, { get fieldNames() { return fields; } });
    const getPath = model.getPath;

    const initial: string = getPath('root')[0].node.payload.label;
    expect(initial).toBe('Original');

    data = [{ id: 0n, payload: { label: 'Updated' } }];
    fields = { key: 'id' };

    expect(getPath(0n)[0].node).toBe(data[0]);
    expect(getPath('root')).toEqual([]);
    expect(getPath('constructor')).toEqual([]);
    expect(model.getPath).toBe(getPath);
  });
});
