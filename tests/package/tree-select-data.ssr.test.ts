import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import source from '../browser/fixtures/ant-design-tree-select-data-reference.json';
import reference from '../browser/fixtures/ant-design-tree-select-data-ssr-reference.json';
import TreeSelectDataScope from '../browser/fixtures/TreeSelectDataScope.svelte';
import TreeSelectDataGeneric from '../browser/fixtures/TreeSelectDataGeneric.svelte';
import { treeSelectDataSamples } from '../browser/fixtures/tree-select-data-cases';

const text = (html: string) => html.replace(/<[^>]*>/g, '').replace(/&(?:amp|lt|gt|quot|#39);/g,
  entity => ({ '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'" })[entity]!);

function readSelection(html: string) {
  const input = /<input\b(?=[^>]*data-ant-tree-choice-input)[^>]*>/.exec(html)?.[0] ?? '';
  const tags = [...html.matchAll(/<span\b[^>]*class="[^"]*ant-select-selection-item-content[^"]*"[^>]*>([\s\S]*?)<\/span>/g)]
    .map(match => text(match[1]));
  const rich = /<span\b[^>]*class="[^"]*single-snippet[^"]*"[^>]*>([\s\S]*?)<\/span>/.exec(html)?.[1];
  return { opened: /aria-expanded="true"/.test(input),
    selected: rich === undefined ? tags[0] ?? text(/\bvalue="([^"]*)"/.exec(input)?.[1] ?? '') : text(rich),
    tags, nodes: [] };
}

describe('TreeSelect data schemas SSR', () => {
  it('pins the independent Source browser and DOM-free server render references', () => {
    expect(source.reference).toMatchObject({ version: registry.upstream.version,
      revision: registry.upstream.revision, archiveSha256: registry.upstream.archiveSha256,
      delegate: '@rc-component/tree-select1.16.1', errors: [], warnings: [] });
    expect(source.cases).toHaveLength(32);
    expect(source.observations.map(sample => sample.id))
      .toEqual(['simple-input-mutation', 'raw-renderer-data']);
    expect(reference.reference).toMatchObject({ version: registry.upstream.version,
      react: '18.3.1', delegate: '@rc-component/tree-select1.16.1', domAvailableDuringRender: false });
    expect(reference.cases).toHaveLength(32);
  });

  it.each(reference.cases)('preserves Source initial selection and label content for $id', entry => {
    vi.useFakeTimers();
    try {
      const sample = treeSelectDataSamples.find(sample => sample.id === entry.id)!;
      const html = render(TreeSelectDataScope, { props: { sample } }).body;

      expect(readSelection(html)).toEqual(entry.view);
      expect(html).not.toContain('role="treeitem"');
      expect(html).not.toMatch(/\b(?:fieldNames|treeDataSimpleMode)="/i);
      expect(html).toMatch(/data-tree-select-data-events[^>]*>\[\]<\/output>/);
      expect(entry.callbacks).toEqual([]);
      expect(entry.timerCalls).toBe(0);
      expect(entry.inputMutated).toBe(false);
      expect(vi.getTimerCount()).toBe(0);
    } finally { vi.useRealTimers(); }
  });

  it('renders typed generic payload snippets and keeps deferred loaders idle on the server', () => {
    vi.useFakeTimers();
    try {
      const html = render(TreeSelectDataGeneric).body;

      expect(readSelection(html).selected).toBe('1:Alpha');
      expect(html).toContain('type="hidden" name="generic" value="1"');
      expect(html).toMatch(/data-tree-select-generic-loads[^>]*>\[\]<\/output>/);
      expect(html).toMatch(/data-tree-select-generic-refs[^>]*>false:false<\/output>/);
      expect(vi.getTimerCount()).toBe(0);
    } finally { vi.useRealTimers(); }
  });
});
