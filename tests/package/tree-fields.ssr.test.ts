import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-tree-fields-reference.json';
import TreeFieldsScope from '../browser/fixtures/TreeFieldsScope.svelte';
import TreeGenericFields from '../browser/fixtures/TreeGenericFields.svelte';

describe('Tree fieldNames SSR', () => {
  it('renders custom records with object titles through generic snippets and the recursive helper', () => {
    const body = render(TreeGenericFields).body;

    expect(body).toContain('Typed root');
    expect(body).toContain('Typed zero');
    expect(body).toContain('Helper zero');
    expect(body).toContain('Typed task');
    expect(body).toContain('Typed article');
    expect(body).not.toContain('raw-key');
    expect(body).not.toContain('raw-selected');
    expect(body).toContain('data-typed-icon');
  });
  it('pins alias events and the stale-schema observation to the studied source', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256,
      delegate: '@rc-component/tree 1.4.0'
    });
    expect(reference.cases).toHaveLength(27);
    expect(reference.observations).toHaveLength(1);
    expect(reference.observations[0].sample.id).toBe('schema-only-observation');
    expect(reference.observations[0].steps[0].result.nodes[0].title).toBe('Root');
  });

  it.each(reference.cases)('renders $sample.id without events or lazy loading', entry => {
    vi.useFakeTimers();
    try {
      const body = render(TreeFieldsScope, { props: { sample: entry.sample } }).body;
      const titles = [...body.matchAll(/<span[^>]*class="[^"]*-title"[^>]*>([\s\S]*?)<\/span>/g)]
        .map(match => match[1].replace(/<!--[\s\S]*?-->/g, ''));

      expect(titles).toEqual(entry.initial.nodes.map(node => node.title));
      const events = /<pre[^>]*data-tree-fields-events[^>]*>([\s\S]*?)<\/pre>/.exec(body);
      expect(events?.[1].replace(/<!--[\s\S]*?-->/g, '')).toBe('[]');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
