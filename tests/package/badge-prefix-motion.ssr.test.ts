import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-badge-prefix-motion-reference.json';
import BadgeZoomCase from '../browser/fixtures/BadgeZoomCase.svelte';
import type { BadgeZoomCase as Sample } from '../browser/fixtures/badge-zoom-presets';

describe('Badge prefix zoom SSR', () => {
  it('pins rendering evidence to the official archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256,
      source: 'package/dist/antd.min.js'
    });
  });

  for (const sample of reference.cases) {
    it(`renders settled source counts without browser resources for ${sample.name}`, () => {
      vi.useFakeTimers();
      try {
        const { body } = render(BadgeZoomCase, { props: { sample: sample as Sample } });
        const counter = /<(sup|span)\b([^>]*(?:data-custom-zoom|data-ant-badge-visual)[^>]*)>([\s\S]*?)<\/\1>/.exec(body);
        const classes = /\bclass="([^"]*)"/.exec(counter?.[2] ?? '')?.[1].split(/\s+/) ?? [];

        expect({
          kind: counter ? counter[1] === 'sup' ? 'number'
            : counter[2].includes('data-custom-zoom') ? 'custom' : 'status' : null,
          text: counter?.[3].replace(/<[^>]*>/g, '') ?? null,
          title: /\btitle="([^"]*)"/.exec(counter?.[2] ?? '')?.[1] ?? null,
          show: /\bdata-show="([^"]*)"/.exec(counter?.[2] ?? '')?.[1] ?? null,
          dot: classes.includes(`${sample.prefixCls || 'ant-badge'}-dot`),
          multiple: classes.includes(`${sample.prefixCls || 'ant-badge'}-multiple-words`)
        }).toEqual(sample.ssr);
        expect(body).not.toContain(`${sample.prefixCls || 'ant-badge'}-zoom-enter`);
        expect(body).not.toContain(`${sample.prefixCls || 'ant-badge'}-zoom-leave`);
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  }
});
