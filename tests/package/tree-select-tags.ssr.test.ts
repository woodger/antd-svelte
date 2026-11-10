import { render } from 'svelte/server';
import type { Snippet } from 'svelte';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import type { TreeSelectProps, TreeSelectTagInfo, TreeSelectTagPlaceholder } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-tree-select-tags-ssr-reference.json';
import source from '../browser/fixtures/ant-design-tree-select-tags-reference.json';
import { treeTagSamples, treeTagObservations } from '../browser/fixtures/tree-select-tag-cases';
import TreeSelectTagsScope from '../browser/fixtures/TreeSelectTagsScope.svelte';

const decode = (text: string) => text.replace(/&(?:amp|lt|gt|quot|#39);/g,
  entity => ({ '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'" })[entity]!);
const text = (html: string) => decode(html.replace(/<[^>]*>/g, ''));
interface Span { start: number; end: number; attrs: string; body: string; parent?: Span; }

/** Публичный SSR HTML: balanced spans сохраняют rich content и hidden measurement ancestors. */
function readHeader(html: string, prefix: string, single: boolean) {
  const spans: Span[] = [];
  const stack: Span[] = [];
  for (const token of html.matchAll(/<\/?span\b[^>]*>/g)) {
    if (token[0].startsWith('</')) {
      const node = stack.pop()!;
      node.end = token.index!;
      node.body = html.slice(node.start + node.attrs.length, node.end);
    } else {
      const node: Span = { start: token.index!, end: 0, attrs: token[0], body: '', parent: stack.at(-1) };
      spans.push(node);
      stack.push(node);
    }
  }
  const visible = (node: Span) => {
    for (let current: Span | undefined = node; current; current = current.parent) {
      if (/\sinert(?:\s|>|=)|\saria-hidden="true"/.test(current.attrs)) return false;
    }
    return true;
  };
  const attribute = (node: Span, name: string) => {
    const found = new RegExp(`\\s${name}="([^"]*)"`).exec(node.attrs)?.[1];
    return found === undefined ? null : decode(found);
  };
  const child = (node: Span, marker: string) => spans.find(item =>
    item.start > node.start && item.end < node.end && item.attrs.includes(marker));
  const tags = spans.filter(node => /\sdata-ant-tree-choice-selection-item(?:\s|>|=)|\sdata-tree-tag-custom=/.test(node.attrs))
    .filter(visible).map(node => ({
      text: text(child(node, `${prefix}-selection-item-content`)?.body
        ?? child(node, 'data-tree-tag-label')?.body ?? ''),
      title: attribute(node, 'title') || null,
      disabled: node.attrs.includes(`${prefix}-selection-item-disabled`),
      removable: /data-ant-tree-choice-selection-item-remove|data-tree-tag-close=/.test(node.body),
      custom: attribute(node, 'data-tree-tag-custom') ? JSON.parse(attribute(node, 'data-tree-tag-custom')!) : null
    }));
  const omitted = spans.find(node => node.attrs.includes('data-tree-tag-omitted=') && visible(node));
  const input = /<input\b(?=[^>]*data-ant-tree-choice-input)[^>]*>/.exec(html)?.[0] ?? '';
  return { opened: /aria-expanded="true"/.test(input),
    selected: single ? decode(/\bvalue="([^"]*)"/.exec(input)?.[1] ?? '') : '',
    tags, omitted: omitted ? JSON.parse(attribute(omitted, 'data-tree-tag-omitted')!) : null };
}

function expected(entry: typeof reference.cases[number]) {
  if (entry.id === 'count-nan') return reference.cases.find(entry => entry.id === 'default')!.view;
  const replacements: Record<string, string> = { 'emoji-split': '...', 'middle-emoji-split': 'A...' };
  const titles: Record<string, readonly string[]> = {
    'opaque-array-title': ['Array0 label'], 'title-renderer': ['Alphabet', 'Beta']
  };
  return { ...entry.view, tags: entry.view.tags.map((tag, index) => ({ ...tag,
    ...(!index && replacements[entry.id] ? { text: replacements[entry.id] } : {}),
    ...(titles[entry.id]?.[index] ? { title: titles[entry.id][index] } : {})
  })) };
}

describe('TreeSelect tag display SSR', () => {
  it('publishes typed snippets and pins the independent Source browser/server references', () => {
    expectTypeOf<TreeSelectProps['tagRender']>().toEqualTypeOf<Snippet<[TreeSelectTagInfo]> | undefined>();
    expectTypeOf<TreeSelectProps['maxTagPlaceholder']>().toEqualTypeOf<TreeSelectTagPlaceholder | undefined>();
    expect(source.reference).toMatchObject({ version: registry.upstream.version,
      revision: registry.upstream.revision, archiveSha256: registry.upstream.archiveSha256,
      select: '@rc-component/select1.10.1', treeSelect: '@rc-component/tree-select1.16.1', errors: [], warnings: [] });
    expect(source.cases).toHaveLength(49);
    expect(source.observations).toHaveLength(6);
    expect(reference.reference).toMatchObject({ version: registry.upstream.version,
      revision: registry.upstream.revision, archiveSha256: registry.upstream.archiveSha256,
      domAvailableDuringRender: false, react: '18.3.1' });
    expect(reference.cases).toHaveLength(55);
  });

  it.each(reference.cases)('preserves Source tag content and established Native boundaries for $id', entry => {
    vi.useFakeTimers();
    try {
      const sample = [...treeTagSamples, ...treeTagObservations].find(sample => sample.id === entry.id)!;
      const html = render(TreeSelectTagsScope, { props: { sample } }).body;

      expect(readHeader(html, sample.prefix || 'ant-select', Boolean(sample.single))).toEqual(expected(entry));
      expect(html).not.toMatch(/\s(?:maxTagCount|maxTagTextLength|maxTagPlaceholder|tagRender)=/i);
      expect(html).toMatch(/data-tree-tag-events[^>]*>\[\]<\/output>/);
      expect(html).toMatch(/data-tree-tag-refs[^>]*>false:false<\/output>/);
      expect(entry.callbacks).toEqual([]);
      expect(entry.timers).toBe(0);
      expect(entry.inputMutated).toBe(false);
      expect(vi.getTimerCount()).toBe(0);
    } finally { vi.useRealTimers(); }
  });
});
