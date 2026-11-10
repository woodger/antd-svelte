import { render } from 'svelte/server';
import type { Snippet } from 'svelte';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import type { TreeSelectProps, TreeSelectValue } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import source from '../browser/fixtures/ant-design-tree-select-labels-reference.json';
import reference from '../browser/fixtures/ant-design-tree-select-labels-ssr-reference.json';
import { treeLabelObservations, treeLabelSamples } from '../browser/fixtures/tree-select-label-cases';
import TreeSelectLabelsScope from '../browser/fixtures/TreeSelectLabelsScope.svelte';

const decode = (value: string) => value.replace(/&(?:quot|amp|lt|gt|#39);/g,
  entity => ({ '&quot;': '"', '&amp;': '&', '&lt;': '<', '&gt;': '>', '&#39;': "'" })[entity]!);
const attr = (tag: string, name: string) => decode(new RegExp(`\\s${name}="([^"]*)"`).exec(tag)?.[1] ?? '');

function readServerLabels(html: string) {
  const records = [...html.matchAll(/<span\b[^>]*\sdata-renderer-record="([^"]+)"[^>]*>\s*<span\b[^>]*\sdata-record-label[^>]*>([\s\S]*?)<\/span>/g)];
  return records.map(([, meta, label]) => ({ ...JSON.parse(decode(meta)),
    text: decode(label.replace(/<!--[^]*?-->|<[^>]*>/g, '')),
    rendered: [...label.matchAll(/<em\b(?=[^>]*\sdata-render-label(?:\s|=|>))[^>]*>/g)].map(([tag]) => ({
      value: attr(tag, 'data-render-value'), payload: attr(tag, 'data-render-payload'),
      context: attr(tag, 'data-render-context')
    }))
  }));
}

describe('TreeSelect renderer labels on the server', () => {
  it('preserves generic Data and pins both independent React references', () => {
    type Data = { code: number; caption: string; payload: { id: number; }; };
    expectTypeOf<TreeSelectProps<TreeSelectValue, Data>['treeTitleRender']>()
      .toEqualTypeOf<Snippet<[Data]> | undefined>();
    for (const metadata of [source.reference, reference.reference]) {
      expect(metadata).toMatchObject({ version: registry.upstream.version,
        revision: registry.upstream.revision, archiveSha256: registry.upstream.archiveSha256,
        treeSelect: '1.16.1', select: '1.10.1', react: '18.3.1' });
    }
    expect(source.reference).toMatchObject({ errors: [], warnings: [] });
    expect(reference.reference.domAvailableDuringRender).toBe(false);
    expect(source.cases).toHaveLength(28);
    expect(source.observations).toHaveLength(2);
    expect(reference.cases).toHaveLength(30);
  });

  it.each(reference.cases)('renders Source summary labels for $id without DOM or effects', entry => {
    const sample = [...treeLabelSamples, ...treeLabelObservations].find(item => item.id === entry.id)!;
    expect(typeof document).toBe('undefined');
    vi.useFakeTimers();
    try {
      const html = render(TreeSelectLabelsScope, { props: { sample } }).body;

      expect(readServerLabels(html)).toEqual(entry.view.omitted);
      expect(html.includes('data-tree-label-omitted')).toBe(entry.view.omitted.length > 0);
      expect(html).toMatch(/data-tree-label-events[^>]*>\[\]<\/output>/);
      expect(html).toMatch(/data-tree-label-refs[^>]*>false:false<\/output>/);
      expect(html).not.toMatch(/\s(?:treeTitleRender|maxTagPlaceholder|tagRender)=/i);
      expect(entry.callbacks).toEqual([]);
      expect(entry.timers).toBe(0);
      expect(entry.inputMutated).toBe(false);
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it('renders bound child markup, head and unique IDs in the original SSR context', () => {
    const result = render(TreeSelectLabelsScope, {
      props: { sample: treeLabelSamples[0], interactive: true }, idPrefix: 'label-ssr'
    });
    const fields = [...result.body.matchAll(/<input\b(?=[^>]*aria-label="header label draft)[^>]*>/g)]
      .map(([tag]) => attr(tag, 'id'));

    expect(fields).toHaveLength(2);
    expect(new Set(fields).size).toBe(2);
    expect(fields.every(id => id.startsWith('label-ssr-'))).toBe(true);
    expect(result.head).toContain('data-tree-label-head="header:0"');
    expect(result.head).toContain('data-tree-label-head="header:1"');
    expect(result.body).toMatch(/data-tree-label-lifecycle[^>]*>\[\]<\/output>/);
  });
});
