import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-tree-expand-action-reference.json';
import settled from '../browser/fixtures/ant-design-tree-expand-action-settled-reference.json';
import TreeExpandActionScope from '../browser/fixtures/TreeExpandActionScope.svelte';

describe('Tree title expansion SSR', () => {
  it('pins source interaction cases and the rapid callback observation', () => {
    for (const evidence of [reference.reference, settled.reference]) {
      expect(evidence).toMatchObject({
        version: registry.upstream.version,
        revision: registry.upstream.revision,
        archiveSha256: registry.upstream.archiveSha256,
        delegate: '@rc-component/tree 1.4.0'
      });
    }
    expect(reference.cases).toHaveLength(22);
    const rapid = reference.cases.find(entry => entry.sample.id === 'click-double')!;
    expect(rapid.result.expanded).toBe('false');
    expect(rapid.result.events.filter(event => event.kind === 'expand')).toHaveLength(1);
    expect(settled.cases[0].result.events.filter(event => event.kind === 'expand')).toHaveLength(2);
  });

  it.each(reference.cases)('renders $sample.id without interactions or loading', ({ sample }) => {
    vi.useFakeTimers();
    try {
      const body = render(TreeExpandActionScope, { props: { sample } }).body;

      expect(body).toContain('Root');
      expect(body).not.toContain('expandAction=');
      const events = /<pre[^>]*data-tree-expand-events[^>]*>([\s\S]*?)<\/pre>/.exec(body);
      expect(events?.[1].replace(/<!--[\s\S]*?-->/g, '')).toBe('[]');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
