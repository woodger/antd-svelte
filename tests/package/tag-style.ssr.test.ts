import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import TagStyleCase from '../browser/fixtures/TagStyleCase.svelte';
import reference from '../browser/fixtures/ant-design-tag-style-reference.json';
import type { TagStyleCase as Sample } from '../browser/fixtures/tag-style-presets';

describe('Tag source styling SSR', () => {
  it('pins evidence to the official archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256,
      source: 'package/dist/antd.min.js'
    });
  });

  for (const sample of reference.cases) {
    it(`renders semantic classes without browser resources for ${sample.name}`, () => {
      vi.useFakeTimers();
      try {
        const { body } = render(TagStyleCase, { props: { sample: sample as Sample } });
        const tags = [...body.matchAll(/<(?:span|button)\b(?:[^>"']|"[^"]*"|'[^']*')*>/g)]
          .map(match => match[0]);
        const classes = (tag: string | undefined) =>
          [...new Set(/\bclass="([^"]*)"/.exec(tag ?? '')?.[1].split(/\s+/) ?? [])]
            .filter(name => /^(?:case-|ctx-|local-)/.test(name)).sort();
        const has = (tag: string, name: RegExp) =>
          name.test(/\bclass="([^"]*)"/.exec(tag)?.[1] ?? '');
        const root = tags.find(tag => has(tag, /(?:^|\s)ant-tag(?:\s|$)/));

        expect({
          classes: classes(root),
          icon: classes(tags.find(tag => has(tag, /(?:^|\s)(?:case-|ctx-)icon(?:\s|$)/))),
          content: classes(tags.find(tag => has(tag, /(?:^|\s)(?:case-|ctx-)content(?:\s|$)/))),
          close: classes(tags.find(tag => has(tag, /(?:^|\s)(?:case-|ctx-)close(?:\s|$)/)))
        }).toEqual(sample.ssr);
        expect(body).toContain('Tag label');
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  }
});
