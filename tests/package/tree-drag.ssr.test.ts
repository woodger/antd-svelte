import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import source from '../browser/fixtures/ant-design-tree-drag-reference.json';
import reference from '../browser/fixtures/ant-design-tree-drag-ssr-reference.json';
import { treeDragSamples } from '../browser/fixtures/tree-drag-cases';
import TreeDragScope from '../browser/fixtures/TreeDragScope.svelte';
import TreeDragGeneric from '../browser/fixtures/TreeDragGeneric.svelte';

describe('Tree drag SSR', () => {
  it('pins the independent browser, geometry and DOM-free server references', () => {
    expect(source.reference).toMatchObject({ version: registry.upstream.version,
      revision: registry.upstream.revision, archiveSha256: registry.upstream.archiveSha256,
      delegates: ['@rc-component/tree1.4.0'] });
    expect(reference.reference).toEqual({ version: registry.upstream.version,
      react: '18.3.1', domAvailable: false, delegate: '@rc-component/tree1.4.0' });
    expect(source.cases).toHaveLength(38);
    expect(source.observations.map(entry => entry.sample.id)).toEqual([
      'stale-allow-observation', 'window-end-observation', 'unmount-timer-observation',
      'zero-container-observation', 'prefix-cache-observation', 'late-descendant-observation'
    ]);
  });

  it('renders generic field names and bigint keys without replacing raw predicate data', () => {
    vi.useFakeTimers();
    try {
      const html = render(TreeDragGeneric).body;

      expect(html).toContain('data-tree-drag-key="0"');
      expect(html).toContain('data-tree-drag-key="2"');
      expect(html).toContain('Alias moving');
      expect(html).toMatch(/data-tree-drag-generic-valid[^>]*>true<\/output>/);
      expect(html).toMatch(/data-tree-drag-generic-events[^>]*>\[\]<\/pre>/);
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it.each(reference.cases)('renders Source draggable rows and handles for $sample.id', entry => {
    const sample = treeDragSamples.find(sample => sample.id === entry.sample.id)!;
    const prefix = sample.localPrefix ?? `${sample.prefix ?? 'ant'}-tree`;
    vi.useFakeTimers();
    try {
      const html = render(TreeDragScope, { props: { sample } }).body;
      const rows = [...html.matchAll(/<div\b(?=[^>]*\brole="treeitem")[^>]*>/g)];
      const keys = [...html.matchAll(/data-tree-drag-key="([^"]*)"/g)].map(match => match[1]);
      const nodes = rows.map((match, index) => {
        const classes = /\bclass="([^"]*)"/.exec(match[0])?.[1].split(' ') ?? [];
        return { key: keys[index], draggable: /\bdraggable="true"/.test(match[0]),
          draggableClass: classes.includes(`${prefix}-treenode-draggable`),
          disabled: /\baria-disabled="true"/.test(match[0]) };
      });

      expect(nodes).toEqual(entry.result.nodes);
      expect([...html.matchAll(new RegExp(`class="${prefix}-draggable-icon"`, 'g'))])
        .toHaveLength(entry.result.handleCount);
      expect([...html.matchAll(/class="[^"]*anticon-holder[^"]*"/g)])
        .toHaveLength(entry.result.defaultIconCount);
      expect(html).not.toContain('class="dragging"');
      expect(html).not.toContain(`class="${prefix}-drop-indicator"`);
      expect(html).toMatch(/data-tree-drag-events[^>]*>\[\]<\/pre>/);
      expect(entry.result.callbacks).toEqual([]);
      expect(entry.result.timerCalls).toBe(0);
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
