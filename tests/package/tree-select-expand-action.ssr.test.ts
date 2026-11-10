import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-tree-select-expand-action-reference.json';
import TreeSelectExpandActionScope from '../browser/fixtures/TreeSelectExpandActionScope.svelte';

describe('TreeSelect title expansion SSR', () => {
  it('pins the independent Source event and DOM reference', () => {
    expect(reference.reference).toMatchObject({ version: registry.upstream.version,
      revision: registry.upstream.revision, archiveSha256: registry.upstream.archiveSha256,
      delegate: '@rc-component/tree-select1.16.1', errors: [], warnings: [] });
    expect(reference.cases).toHaveLength(28);
    expect(reference.observations.map(entry => entry.sample.id)).toEqual(['lazy-click']);
  });

  it.each([false, 'click', 'doubleClick'])('consumes title action %s without timers or callbacks', expandAction => {
    vi.useFakeTimers();
    try {
      const html = render(TreeSelectExpandActionScope, {
        props: { sample: { id: 'ssr', action: 'click', expandAction, lazy: true } }
      }).body;

      expect(html).not.toMatch(/treeExpandAction=/i);
      expect(html).not.toContain('role="treeitem"');
      expect(html).toMatch(/data-tree-select-expand-events[^>]*>\[\]<\/output>/);
      expect(html).toMatch(/data-tree-select-expand-refs[^>]*>false:false<\/output>/);
      expect(vi.getTimerCount()).toBe(0);
    } finally { vi.useRealTimers(); }
  });

  it('keeps the native initially open lazy shell free of browser effects', () => {
    vi.useFakeTimers();
    try {
      const html = render(TreeSelectExpandActionScope, {
        props: { initialOpen: true,
          sample: { id: 'ssr-open', action: 'click', expandAction: 'click', lazy: true } }
      }).body;

      expect(html).toContain('aria-expanded="true"');
      expect(html).toMatch(/popover="manual" hidden/);
      expect(html).toMatch(/data-tree-select-expand-events[^>]*>\[\]<\/output>/);
      expect(vi.getTimerCount()).toBe(0);
    } finally { vi.useRealTimers(); }
  });
});
