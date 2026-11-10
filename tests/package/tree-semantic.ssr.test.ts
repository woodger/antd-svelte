import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-tree-semantic-reference.json';
import TreeSemanticScope from '../browser/fixtures/TreeSemanticScope.svelte';

describe('Tree semantic SSR', () => {
  it('pins slot layers, root-style counterparts and the stale icon observation to Source', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256,
      delegate: '@rc-component/tree 1.4.0'
    });
    expect(reference.cases).toHaveLength(18);
    expect(reference.observations).toHaveLength(3);
    const stale = reference.observations.find(entry => entry.sample.id === 'live-default-icon-observation')!;
    expect(stale.updated.nodes[0].icon).toEqual(stale.initial.nodes[0].icon);
    expect(stale.updated.nodes[0].title.classes).toContain('updated-title');
  });

  it.each(reference.cases)('renders $sample.id without load effects or timers', entry => {
    vi.useFakeTimers();
    try {
      const body = render(TreeSemanticScope, { props: { sample: entry.sample } }).body;

      expect(body).toContain('Root');
      expect(body).toContain('Semantic target');
      for (const name of entry.initial.root.classes) expect(body).toContain(name);
      expect(body).not.toContain('["load"]');
      const ref = /<output[^>]*data-tree-semantic-ref[^>]*>([\s\S]*?)<\/output>/.exec(body);
      expect(ref?.[1].replace(/<!--[\s\S]*?-->/g, '')).toBe('none');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
