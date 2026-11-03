import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import TagCloseCase from '../browser/fixtures/TagCloseCase.svelte';
import reference from '../browser/fixtures/ant-design-tag-close-reference.json';
import type { TagCloseCase as Sample } from '../browser/fixtures/tag-close-presets';

describe('Tag source links and closable SSR', () => {
  it('pins evidence to the official archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256,
      source: 'package/dist/antd.min.js'
    });
  });

  for (const sample of reference.cases) {
    it(`renders source attributes with native controls for ${sample.name}`, () => {
      vi.useFakeTimers();
      try {
        const { body } = render(TagCloseCase, { props: { sample: sample as Sample } });
        const root = [...body.matchAll(/<(span|a)\b((?:[^>"']|"[^"]*"|'[^']*')*)>/g)]
          .find(match => match[2].includes('data-tag-api-root'))!;
        const close = [...body.matchAll(
          /<button\b((?:[^>"']|"[^"]*"|'[^']*')*)>([\s\S]*?)<\/button>/g
        )].find(match => /\bclass="[^"]*\bant-tag-close-icon\b/.test(match[1]));
        const attribute = (text: string, key: string) =>
          new RegExp(`(?:^|\\s)${key}="([^"]*)"`).exec(text)?.[1] ?? null;

        expect({
          tag: root[1].toUpperCase(),
          href: attribute(root[2], 'href'),
          target: attribute(root[2], 'target'),
          ariaDisabled: attribute(root[2], 'aria-disabled'),
          close: close ? {
            label: attribute(close[1], 'aria-label'),
            text: close[2].replace(/<[^>]*>/g, ''),
            glyph: close[2].includes('data-custom-close') ? 'snippet'
              : close[2].includes('<svg') ? 'default' : 'text'
          } : null
        }).toEqual(sample.ssr);
        expect(root[2]).toContain('title="API &lt;Tag>"');
        expect(body).toMatch(/aria-label="Tag close events">(?:<!--[\s\S]*?-->)*\[\]/);
        expect(body).toMatch(/aria-label="Tag root ref">(?:<!--[\s\S]*?-->)*empty/);
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  }
});
