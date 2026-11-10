import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import source from '../browser/fixtures/ant-design-tree-select-max-count-reference.json';
import reference from '../browser/fixtures/ant-design-tree-select-max-count-ssr-reference.json';
import TreeSelectMaxCountScope from '../browser/fixtures/TreeSelectMaxCountScope.svelte';
import type { TreeSelectMaxCountSample } from '../browser/fixtures/tree-select-max-count-cases';

const text = (html: string) => html.replace(/<[^>]*>/g, '').replace(/&(?:amp|lt|gt|quot|#39);/g,
  entity => ({ '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'" })[entity]!);

function readSelection(html: string) {
  const input = /<input\b(?=[^>]*data-ant-tree-choice-input)[^>]*>/.exec(html)?.[0] ?? '';
  const tags = [...html.matchAll(/<span\b[^>]*class="[^"]*ant-select-selection-item-content[^"]*"[^>]*>([\s\S]*?)<\/span>/g)]
    .map(match => text(match[1]));
  return { opened: /aria-expanded="true"/.test(input),
    selected: tags[0] ?? text(/\bvalue="([^"]*)"/.exec(input)?.[1] ?? ''), tags, nodes: [] };
}

describe('TreeSelect selection limits SSR', () => {
  it('pins the independent Source browser and DOM-free server references', () => {
    expect(source.reference).toMatchObject({ version: registry.upstream.version,
      revision: registry.upstream.revision, archiveSha256: registry.upstream.archiveSha256,
      delegate: '@rc-component/tree-select1.16.1', errors: [], warnings: [] });
    expect(source.cases).toHaveLength(33);
    expect(source.observations.map(entry => entry.sample.id)).toEqual(['grow', 'single']);
    expect(reference.reference).toMatchObject({ version: registry.upstream.version,
      react: '18.3.1', delegate: '@rc-component/tree-select1.16.1', domAvailableDuringRender: false });
    expect(reference.cases).toHaveLength(35);
  });

  it.each(reference.cases)('preserves the Source initial selection for $id', entry => {
    vi.useFakeTimers();
    try {
      const sample = [...source.cases, ...source.observations]
        .find(sample => sample.sample.id === entry.id)!.sample as TreeSelectMaxCountSample;
      const html = render(TreeSelectMaxCountScope, { props: { sample } }).body;

      expect(readSelection(html)).toEqual(entry.view);
      expect(html).not.toMatch(/\b(?:maxCount|_nodeDisabled)=/i);
      expect(html).not.toContain('role="treeitem"');
      expect(html).toMatch(/data-tree-select-max-count-events[^>]*>\[\]<\/output>/);
      expect(entry.callbacks).toEqual([]);
      expect(entry.timerCalls).toBe(0);
      expect(entry.inputMutated).toBe(false);
      expect(vi.getTimerCount()).toBe(0);
    } finally { vi.useRealTimers(); }
  });

  it('renders the native initially open constrained shell without callbacks or timers', () => {
    vi.useFakeTimers();
    try {
      const sample = source.cases.find(entry => entry.sample.id === 'checked-one')!
        .sample as TreeSelectMaxCountSample;
      const html = render(TreeSelectMaxCountScope, { props: { sample, initialOpen: true } }).body;
      const root = /<div\b(?=[^>]*role="treeitem")(?=[^>]*id="[^"]*-0")[^>]*>/.exec(html)?.[0];

      expect(root).toContain('aria-disabled="true"');
      expect(html).toMatch(/popover="manual" hidden/);
      expect(html).not.toMatch(/\b(?:maxCount|_nodeDisabled)=/i);
      expect(html).toMatch(/data-tree-select-max-count-events[^>]*>\[\]<\/output>/);
      expect(html).toMatch(/data-tree-select-max-count-refs[^>]*>false:false<\/output>/);
      expect(vi.getTimerCount()).toBe(0);
    } finally { vi.useRealTimers(); }
  });
});
