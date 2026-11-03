import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-badge-values-reference.json';
import BadgeApiCase from '../browser/fixtures/BadgeApiCase.svelte';
import type { BadgeApiCase as Sample } from '../browser/fixtures/badge-api-presets';

describe('Badge scalar text, offset and size SSR', () => {
  it('pins rendering evidence to the official archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256,
      source: 'package/dist/antd.min.js'
    });
  });

  for (const sample of reference.cases) {
    it(`renders source semantic roots without browser resources for ${sample.name}`, () => {
      vi.useFakeTimers();
      try {
        const { body } = render(BadgeApiCase, { props: { sample: sample as Sample } });
        const root = /<span\b[^>]*\bdata-api-root="badge"[^>]*>/.exec(body)![0];
        const indicator = /<(?:span|sup)\b[^>]*class="[^"]*(?:ant-scroll-number|ant-badge-status-dot)[^"]*"[^>]*>/.exec(body)?.[0];
        const classes = (markup: string | undefined) =>
          (/\bclass="([^"]*)"/.exec(markup ?? '')?.[1].split(/\s+/) ?? [])
            .filter(name => name.startsWith('case-')).sort();

        expect({
          roots: [...body.matchAll(/data-api-root="badge"/g)].length,
          sup: [...body.matchAll(/<sup\b/g)].length,
          custom: [...body.matchAll(/\sdata-api-custom(?:\s|=|>)/g)].length,
          status: [...body.matchAll(/class="[^"]*\bant-badge-status-dot\b/g)].length,
          text: /<span\b[^>]*class="[^"]*\bant-badge-status-text\b[^"]*"[^>]*>([\s\S]*?)<\/span>/
            .exec(body)?.[1].replace(/<[^>]*>/g, '') ?? null,
          classes: { root: classes(root), indicator: classes(indicator) }
        }).toEqual(sample.ssr);
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  }
});
