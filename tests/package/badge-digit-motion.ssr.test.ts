import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-badge-digit-motion-reference.json';
import BadgeDigitCase from '../browser/fixtures/BadgeDigitCase.svelte';
import type { BadgeDigitCase as Sample } from '../browser/fixtures/badge-digit-motion-presets';

describe('Badge digit motion SSR', () => {
  it('pins initial digit rendering to the official archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256,
      source: 'package/dist/antd.min.js'
    });
  });

  for (const sample of reference.cases) {
    it(`renders settled units without timers for ${sample.name}`, () => {
      vi.useFakeTimers();
      try {
        const { body } = render(BadgeDigitCase, { props: { sample: sample as Sample } });
        const sup = /<sup\b[^>]*>([\s\S]*?)<\/sup>/.exec(body)![1];
        const spans = [...sup.matchAll(/<span\b[^>]*class="([^"]*)"/g)]
          .map(([, classes]) => classes.split(/\s+/));

        expect({
          text: sup.replace(/<[^>]*>/g, ''),
          digits: spans.filter(classes => classes.includes('ant-scroll-number-only')).length,
          units: spans.filter(classes => classes.includes('ant-scroll-number-only-unit')).length
        }).toEqual(sample.ssr);
        expect(sup).not.toContain('translateY(');
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  }
});
