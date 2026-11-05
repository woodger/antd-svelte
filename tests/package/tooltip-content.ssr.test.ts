import { render } from 'svelte/server';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import type { TooltipContent, TooltipProps } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import TooltipContentCase from '../browser/fixtures/TooltipContentCase.svelte';
import TooltipCacheCase from '../browser/fixtures/TooltipCacheCase.svelte';
import { contentCases } from '../browser/fixtures/tooltip-content-presets';
import reference from '../browser/fixtures/ant-design-tooltip-content-reference.json';

describe('Tooltip content public package SSR', () => {
  it('pins content and cache evidence to the official archive and delegated versions', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256,
      documentMode: 'CSS1Compat',
      source: 'package/dist/antd.min.js',
      delegated: { tooltip: '1.5.2', trigger: '3.10.1' }
    });
    expectTypeOf<TooltipProps['title']>().toEqualTypeOf<TooltipContent>();
    expectTypeOf<TooltipProps['overlay']>().toEqualTypeOf<TooltipContent>();
    expectTypeOf<TooltipProps['fresh']>().toEqualTypeOf<boolean | undefined>();
  });

  for (const sample of contentCases) {
    it(`renders ${sample.name} without DOM or timers and keeps the native eager shell`, () => {
      vi.useFakeTimers();
      try {
        const { body } = render(TooltipContentCase, { props: { sample } });
        const markup = body.replace(/<!--[\s\S]*?-->/g, '')
          .match(/<span[^>]*data-ant-tooltip-container=""[^>]*>([\s\S]*?)<\/span>/)?.[1];

        expect(body).toContain('Content trigger');
        expect(body).toMatch(/role="tooltip"[^>]*\shidden(?:[\s=>])/);
        expect(markup).toBeDefined();
        if (sample.name === 'escaped') {
          expect(markup).toContain('&lt;img');
          expect(markup).not.toContain('<img');
        } else {
          expect(markup!.replace(/<[^>]*>/g, '')).toBe(sample.snapshot.text ?? '');
        }
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  }

  for (const sample of reference.caches) {
    it(`keeps ${sample.name} SSR eager or lazy according to the existing destroy contract`, () => {
      const { body } = render(TooltipCacheCase, { props: { sample } });
      const markup = body.replace(/<!--[\s\S]*?-->/g, '');
      const firstOpenText = sample.frames.find(frame => frame.step === 'opened')!.snapshot.text;

      expect(markup.includes(`>${firstOpenText}</span>`)).toBe(!sample.destroy);
      expect(markup).toContain('role="tooltip"');
      expect(markup).toContain('popover="manual"');
    });
  }
});
