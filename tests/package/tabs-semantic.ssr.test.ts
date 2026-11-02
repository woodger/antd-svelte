import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-tabs-semantic-reference.json';
import type { TabsSemanticTrace } from '../browser/fixtures/tabs-semantic-presets';
import TabsSemanticFixture from './TabsSemanticFixture.svelte';

describe('Tabs semantic slots and provider config SSR', () => {
  it('pins the class, style and icon reference to the official source archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
  });

  it('merges root and semantic layers before local root and header styles', () => {
    const { body } = render(TabsSemanticFixture);
    const root = /<div(?=[^>]*\bid="semantic-ssr")[^>]*>/.exec(body)![0];
    const header = /<div(?=[^>]*class="ant-tabs-nav )[^>]*>/.exec(body)![0];

    for (const name of reference.cases[0].classes.root!) expect(root).toContain(name);
    expect(root).toContain('color:rgb(10,20,30);color:rgb(20,30,40);color:rgb(30,40,50);color:rgb(40,50,60)');
    expect(header).toContain('margin-bottom:13px;margin-bottom:3px');
    for (const slot of ['item', 'remove', 'indicator', 'body', 'content']) {
      expect(body).toContain(`s-context-${slot} s-local-${slot}`);
    }
    expect(body).toContain('background-color:rgb(40,50,60);width:7px;transform:none');
    expect(body).toContain('padding-left:7px;padding-left:11px');
    expect(body).toContain('Semantic SSR draft');
  });

  it.each(reference.cases.filter(sample => sample.mode === 'callbacks'))(
    'provides normalized source callback props for $name', sample => {
      const info: TabsSemanticTrace[] = [];
      const { body } = render(TabsSemanticFixture, { props: {
        preset: sample.name,
        report: entry => info.push(entry)
      } });

      expect(info.slice(-4)).toEqual(sample.info);
      for (const name of sample.classes.root!) expect(body).toContain(name);
      expect(body).toContain('font-size:21px');
    }
  );

  it.each(['nested-replace', 'context-current-more', 'context-add-remove', 'local-false-icons'])(
    'keeps provider replacement and icon rendering for %s', preset => {
      const sample = reference.cases.find(item => item.name === preset)!;
      const { body } = render(TabsSemanticFixture, { props: { preset } });
      const more = /id="semantic-ssr-more"[^>]*>([\s\S]*?)<\/button>/.exec(body)![1];
      const add = /class="ant-tabs-nav-add[^"]*"[^>]*>([\s\S]*?)<\/button>/.exec(body)![1];
      const remove = /class="ant-tabs-tab-remove[^"]*"[^>]*>([\s\S]*?)<\/button>/.exec(body)![1];

      for (const [element, icon] of [
        [more, sample.icons.more],
        [add, sample.icons.add],
        [remove, sample.icons.remove]
      ] as const) {
        for (const path of icon!.paths) expect(element).toContain(path);
        expect(element.replace(/<[^>]+>/g, '').trim()).toBe(icon!.text);
      }
      if (preset === 'nested-replace') expect(body).not.toContain('s-context-');
    }
  );

  it('forwards native attributes while keeping tablist naming, lazy popup and empty SSR ref', () => {
    const { body } = render(TabsSemanticFixture);
    const root = /<div(?=[^>]*\bid="semantic-ssr")[^>]*>/.exec(body)![0];

    expect(root).toContain('title="Native Tabs root"');
    expect(root).toContain('data-native-owner="semantic"');
    expect(root).not.toContain('aria-label=');
    expect(body).toMatch(/role="tablist"[^>]*aria-label="Semantic sections"/);
    expect(body).toContain('SSR native root">none</output>');
    expect(body).not.toContain('role="listbox"');
    expect(body).not.toContain('onclick=');
    expect(body).not.toContain('nativeElement=');
  });
});
