import { render } from 'svelte/server';
import type { Snippet } from 'svelte';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import type { TreeSelectAllowClear, TreeSelectProps, TreeSelectSuffix, TreeSelectSuffixInfo } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import browser from '../browser/fixtures/ant-design-tree-select-surface-reference.json';
import reference from '../browser/fixtures/ant-design-tree-select-surface-ssr-reference.json';
import { treeSelectSurfaceSamples } from '../browser/fixtures/tree-select-surface-cases';
import TreeSelectSurfaceScope from '../browser/fixtures/TreeSelectSurfaceScope.svelte';

const decode = (value: string) => value.replace(/&(?:quot|amp|lt|gt|#39);/g,
  entity => ({ '&quot;': '"', '&amp;': '&', '&lt;': '<', '&gt;': '>', '&#39;': "'" })[entity]!);
const attr = (tag: string, name: string) => decode(new RegExp(`\\s${name}="([^"]*)"`).exec(tag)?.[1] ?? '');

function slots(html: string, tag: 'div' | 'button', name: string) {
  const pattern = new RegExp(`<${tag}\\b(?=[^>]*\\sclass="(?:[^"]* )?${name}(?: |"))[^>]*>([\\s\\S]*?)</${tag}>`, 'g');
  return Array.from(html.matchAll(pattern), ([markup, body]) => ({ markup, body,
    text: decode(body.replace(/<!--[^]*?-->|<[^>]*>/g, '')), icons: [...body.matchAll(/<svg\b/g)].length,
    rich: Array.from(body.matchAll(/<strong\b[^>]*data-surface-rich[^>]*>([^<]*)<\/strong>/g), ([, text]) => text) }));
}

describe('TreeSelect control slots and custom popup on the server', () => {
  it('exports the current slot types and pins both independent Source captures', () => {
    expectTypeOf<TreeSelectProps['popupRender']>().toEqualTypeOf<Snippet<[Snippet]> | undefined>();
    expectTypeOf<TreeSelectProps['allowClear']>().toEqualTypeOf<boolean | TreeSelectAllowClear | undefined>();
    expectTypeOf<TreeSelectProps['suffix']>().toEqualTypeOf<TreeSelectSuffix>();
    expectTypeOf<Snippet<[TreeSelectSuffixInfo]>>().toExtend<TreeSelectSuffix>();
    expectTypeOf<Snippet>().toExtend<TreeSelectSuffix>();
    for (const capture of [browser, reference]) {
      expect(capture.reference).toMatchObject({ version: registry.upstream.version,
        revision: registry.upstream.revision, archiveSha256: registry.upstream.archiveSha256,
        treeSelect: '1.16.1', select: '1.10.1', react: '18.3.1', errors: [] });
      expect(capture.cases.map(entry => entry.id)).toEqual(treeSelectSurfaceSamples.map(entry => entry.id));
    }
    expect(reference.reference.domAvailableDuringRender).toBe(false);
  });

  it.each(reference.cases)('renders the Source control content for $id without DOM or effects', entry => {
    const sample = treeSelectSurfaceSamples.find(item => item.id === entry.id)!;
    expect(typeof document).toBe('undefined');
    vi.useFakeTimers();
    try {
      const html = render(TreeSelectSurfaceScope, { props: { sample } }).body;
      const prefix = sample.rtl ? 'surface-choice' : 'ant-select';
      const control = html.match(/<div\b(?=[^>]*data-ant-tree-choice-control)[^>]*>/)?.[0] ?? '';
      const input = html.match(/<input\b(?=[^>]*data-ant-tree-choice-input)[^>]*>/)?.[0] ?? '';
      const classes = attr(control, 'class').split(' ');
      const open = Boolean(sample.defaultOpen && !sample.disabled);
      const view = entry.view;
      const project = (value: { text: string; rich: readonly string[]; icons: readonly string[]; }) => ({ text: value.text,
        rich: value.rich, icons: value.icons.length });
      expect(attr(input, 'aria-expanded')).toBe(String(open));
      expect(input).not.toMatch(/\s(?:prefix|suffix|suffixIcon|removeIcon|allowClear|popupRender)=/i);
      expect(classes.includes(`${prefix}-show-arrow`)).toBe(view.showArrow);
      expect(classes.includes(`${prefix}-allow-clear`)).toBe(view.allowClear);
      expect(classes.includes(`${prefix}-loading`)).toBe(view.loading);
      for (const part of ['prefix', 'suffix'] as const) {
        const [native] = slots(html, 'div', `${prefix}-${part}`);
        expect(native && { text: native.text, rich: native.rich, icons: native.icons }).toEqual(
          view[part] ? project(view[part]) : undefined);
        if (part === 'suffix' && view.info) {
          expect(JSON.parse(attr(native.body, 'data-surface-suffix-info'))).toEqual({ ...view.info, open });
        }
      }
      const [clear] = slots(html, 'button', `${prefix}-clear`);
      expect(clear && { text: clear.text, rich: clear.rich, icons: clear.icons,
        label: attr(clear.markup, 'aria-label') }).toEqual(view.clear ? { ...project(view.clear), label: view.clear.label } : undefined);
      expect(slots(html, 'button', `${prefix}-selection-item-remove`)
        .map(({ text, rich, icons }) => ({ text, rich, icons }))).toEqual(view.remove.map(project));
      expect(view.open).toBe(false);
      expect(view.popup).toBeNull();
      expect(html.includes('popover="manual" hidden')).toBe(open);
      expect(html.includes('data-surface-draft')).toBe(open && sample.popup === 'wrap');
      expect(html).toMatch(/data-surface-events[^>]*>\[\]<\/output>/);
      expect(html).toMatch(/data-surface-lifecycle[^>]*>\[\]<\/output>/);
      expect(entry.timers).toBe(0);
      expect(entry.mutated).toBe(false);
      expect(vi.getTimerCount()).toBe(0);
    } finally { vi.useRealTimers(); }
  });
});
