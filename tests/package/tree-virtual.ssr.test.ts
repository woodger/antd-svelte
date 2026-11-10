import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import { Tree } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-tree-virtual-reference.json';
import TreeVirtualScope from '../browser/fixtures/TreeVirtualScope.svelte';

describe('Tree virtual SSR', () => {
  it('pins browser and server windows and the raw Source defects to the studied delegates', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256,
      delegates: ['@rc-component/tree1.4.0', '@rc-component/virtual-list1.5.1']
    });
    expect(reference.cases).toHaveLength(28);
    expect(reference.observations.map(entry => entry.sample.id)).toEqual([
      'global-undefined-observation', 'horizontal-rtl-observation', 'stale-height-observation',
      'active-missing-observation', 'zero-focus-observation', 'undersized-width-observation'
    ]);
    expect(reference.ssr).toHaveLength(12);
  });

  it.each(reference.ssr)('renders the Source server window for $sample.id without effects', entry => {
    vi.useFakeTimers();
    try {
      const body = render(TreeVirtualScope, { props: { sample: entry.sample } }).body;
      const titles = [...body.matchAll(/<span[^>]*class="[^"]*-title"[^>]*>([\s\S]*?)<\/span>/g)]
        .map(match => match[1].replace(/<!--[\s\S]*?-->/g, ''));

      expect(titles).toEqual(entry.result.titles);
      for (const [name, value] of Object.entries(entry.result.viewport)) {
        if (value) expect(body).toContain(`${name === 'maxHeight' ? 'max-height' : 'overflow-y'}:${value}`);
      }
      for (const [name, value] of Object.entries(entry.result.content)) {
        if (value) expect(body).toContain(`${name}:${value}`);
      }
      expect(body).not.toContain('aria-activedescendant=');
      const ref = /<output[^>]*data-tree-virtual-ref[^>]*>([\s\S]*?)<\/output>/.exec(body);
      expect(ref?.[1].replace(/<!--[\s\S]*?-->/g, '')).toBe('none');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it('keeps hierarchy positions for virtual rows and never loads expanded children during SSR', () => {
    vi.useFakeTimers();
    const load = vi.fn(() => Promise.resolve());
    try {
      const body = render(Tree, { props: {
        height: 56,
        treeData: Array.from({ length: 20 }, (_, key) => ({ key, title: `Branch ${key}`, isLeaf: false })),
        defaultExpandAll: true,
        loadData: load
      } }).body;

      expect(body).toContain('Branch 3');
      expect(body).not.toContain('Branch 4');
      expect(body).toContain('aria-setsize="20"');
      expect(body).toContain('aria-posinset="4"');
      expect(load).not.toHaveBeenCalled();
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
