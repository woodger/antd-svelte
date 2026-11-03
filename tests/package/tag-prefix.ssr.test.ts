import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import TagPrefixCase from '../browser/fixtures/TagPrefixCase.svelte';
import reference from '../browser/fixtures/ant-design-tag-prefix-reference.json';
import type { TagPrefixCase as Sample } from '../browser/fixtures/tag-prefix-presets';

describe('Tag source prefixes SSR', () => {
  it('pins evidence to the official archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256,
      source: 'package/dist/antd.min.js'
    });
  });

  for (const sample of reference.cases) {
    it(`renders source root classes and a scoped stylesheet for ${sample.name}`, () => {
      vi.useFakeTimers();
      try {
        const { body, head } = render(TagPrefixCase, { props: { sample: sample as Sample } });
        const root = [...body.matchAll(/<(span|a|button|div)\b([^>]*)>/g)]
          .find(match => match[2].includes('data-tag-prefix-root'))!;
        const classes = /\bclass="([^"]*)"/.exec(root[2])![1].split(/\s+/);

        expect(classes).toEqual(expect.arrayContaining(sample.snapshot.classes));
        expect(root[2]).not.toMatch(/\bprefixcls=/i);
        expect(body).toMatch(/aria-label="Tag prefix ref">(?:<!--[\s\S]*?-->)*empty/);
        if (sample.prefixCls && sample.prefixCls !== 'ant-tag') {
          expect(head).toContain(`data-ant-svelte-theme="tag-prefix:${sample.prefixCls}"`);
          expect(head).toContain(`.${sample.prefixCls}:where(.ant-tag-css-var)`);
          expect(head).toContain(`.${sample.prefixCls}-checkable-group`);
          expect(head).toContain('--ant-tag-default-bg');
        } else {
          expect(head).not.toContain('data-ant-svelte-theme="tag-prefix:');
        }
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  }

  it('escapes a closing style tag in the custom prefix', () => {
    const sample = {
      ...reference.cases[0], prefixCls: 'tag-</style><script>window.bad=true</script>'
    } as Sample;
    const { head } = render(TagPrefixCase, { props: { sample } });

    const styleTag = /<style\b((?:[^>"']|"[^"]*"|'[^']*')*)>([\s\S]*?)<\/style>/g;
    const css = [...head.matchAll(styleTag)]
      .find(match => match[1].includes('tag-prefix:'))![2];

    expect(css).not.toContain('</style');
    expect(css).toContain('&lt;\\/style>');
    expect(head.replace(styleTag, '')).not.toContain('<script>');
  });
});
