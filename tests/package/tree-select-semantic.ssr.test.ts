import { render } from 'svelte/server';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import type { TreeSelectClassNames, TreeSelectProps, TreeSelectSemanticInfo, TreeSelectStyles } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import browser from '../browser/fixtures/ant-design-tree-select-semantic-reference.json';
import reference from '../browser/fixtures/ant-design-tree-select-semantic-ssr-reference.json';
import { treeSelectSemanticSamples } from '../browser/fixtures/tree-select-semantic-cases';
import TreeSelectSemanticScope from '../browser/fixtures/TreeSelectSemanticScope.svelte';

const decode = (value: string) => value.replace(/&(?:quot|amp|lt|gt|#39);/g,
  entity => ({ '&quot;': '"', '&amp;': '&', '&lt;': '<', '&gt;': '>', '&#39;': "'" })[entity]!);
const attr = (markup: string, name: string) => decode(new RegExp(`\\s${name}="([^"]*)"`).exec(markup)?.[1] ?? '');
const classes = (markup: string) => attr(markup, 'class').split(/\s+/);

function project(markup: string | undefined) {
  return markup ? {
    classes: classes(markup).filter(name => name.startsWith('semantic-')),
    styles: Object.fromEntries(Array.from(attr(markup, 'style').matchAll(/(--semantic-[a-z-]+):([^;]+)/g),
      ([, name, value]) => [name, value.trim()]))
  } : null;
}

describe('TreeSelect semantics on the server', () => {
  it('exposes generic callback props and pins the independent references', () => {
    type Data = { code: string; label: string; };
    type Value = 'a' | 'b';
    type Info = TreeSelectSemanticInfo<Value, Data>;
    type Props = TreeSelectProps<Value, Data>;
    expectTypeOf<Info['props']['treeData']>().toEqualTypeOf<readonly Data[] | undefined>();
    expectTypeOf<Info['props']['value']>().toEqualTypeOf<Value | undefined>();
    expectTypeOf<Info['props']['disabled']>().toEqualTypeOf<boolean>();
    expectTypeOf<Props['classNames']>().toEqualTypeOf<TreeSelectClassNames
      | ((info: Info) => TreeSelectClassNames | undefined) | undefined>();
    expectTypeOf<Props['styles']>().toEqualTypeOf<TreeSelectStyles
      | ((info: Info) => TreeSelectStyles | undefined) | undefined>();
    for (const capture of [browser, reference]) {
      expect(capture.reference).toMatchObject({ version: registry.upstream.version,
        revision: registry.upstream.revision, archiveSha256: registry.upstream.archiveSha256,
        treeSelect: '1.16.1', select: '1.10.1', tree: '1.4.0', react: '18.3.1', errors: [] });
      expect(capture.cases.map(entry => entry.id)).toEqual(treeSelectSemanticSamples.map(entry => entry.id));
    }
    expect(reference.reference.domAvailableDuringRender).toBe(false);
  });

  it.each(reference.cases)('renders semantic markup and original metadata for $id', entry => {
    const sample = treeSelectSemanticSamples.find(item => item.id === entry.id)!;
    expect(typeof document).toBe('undefined');
    vi.useFakeTimers();
    try {
      const html = render(TreeSelectSemanticScope, { props: { sample } }).body;
      const tags = html.match(/<[a-z][^>]*>/gi) ?? [];
      const prefix = sample.rtl ? 'scope-choice' : 'ant-select';
      const parts = (part: string) => tags.filter(tag => classes(tag).includes(`${prefix}-${part}`));
      const [control] = tags.filter(tag => classes(tag).includes(prefix));
      const [input] = parts('input');
      const expected = entry.view;
      expect(project(control)).toEqual(expected.control);
      expect(project(input)).toEqual(expected.input);
      expect(input).not.toMatch(/\s(?:classNames|styles|switcherIcon|treeLine)=/i);
      for (const part of ['prefix', 'suffix', 'content', 'clear'] as const) {
        expect(project(parts(part)[0])).toEqual(expected[part]);
      }
      for (const [part, suffix] of [['item', ''], ['itemContent', '-content'], ['itemRemove', '-remove']] as const) {
        expect(parts(`selection-item${suffix}`).map(project)).toEqual(expected[part]);
      }
      const [placeholder] = parts('placeholder');
      if (expected.placeholder) {
        const body = html.slice(html.indexOf(placeholder) + placeholder.length).split('</div>')[0];
        expect({ ...project(placeholder), text: decode(body.replace(/<!--[^]*?-->|<[^>]*>/g, '')).trim(),
          visible: !attr(placeholder, 'style').includes('visibility:hidden') }).toEqual(expected.placeholder);
      } else expect(placeholder).toBeUndefined();
      const [popup] = parts('dropdown');
      expect(expected.open).toBe(false);
      expect(expected.popup).toBeNull();
      if (sample.initialOpen) {
        expect(popup).toContain('popover="manual" hidden');
        expect(project(popup)).toEqual(browser.cases.find(item => item.id === entry.id)!.initial.popup);
      } else expect(popup).toBeUndefined();
      expect(html).toMatch(/data-semantic-events[^>]*>\[\]<\/output>/);
      expect(entry.timers).toBe(0);
      expect(entry.mutated).toBe(false);
      expect(vi.getTimerCount()).toBe(0);
    } finally { vi.useRealTimers(); }
  });
});
