import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-tree-node-renderers-reference.json';
import TreeNodeRendererScope from '../browser/fixtures/TreeNodeRendererScope.svelte';

describe('Tree node renderer SSR', () => {
  it('pins renderer priorities and hover observations to the studied source', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256,
      delegate: '@rc-component/tree 1.4.0'
    });
    expect(reference.cases).toHaveLength(14);
    expect(reference.disposal.connected).toBe(false);
    expect(reference.disposal.after).toEqual(reference.disposal.before);
  });

  it.each(reference.cases)('renders $sample.id without hover events or lazy loading', entry => {
    vi.useFakeTimers();
    try {
      const body = render(TreeNodeRendererScope, { props: { sample: entry.sample } }).body;

      expect(body).toContain('Root');
      const events = /<pre[^>]*data-tree-renderer-events[^>]*>([\s\S]*?)<\/pre>/.exec(body);
      expect(events?.[1].replace(/<!--[\s\S]*?-->/g, '')).toBe('[]');
      for (const node of entry.initial.nodes) {
        for (const renderer of node.switcher?.renderers ?? []) expect(body).toContain(renderer.state);
      }
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
