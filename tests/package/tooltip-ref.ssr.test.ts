import { render } from 'svelte/server';
import type { ComponentProps } from 'svelte';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import { Tooltip, type TooltipRef } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import TooltipRefCase from '../browser/fixtures/TooltipRefCase.svelte';
import reference from '../browser/fixtures/ant-design-tooltip-ref-reference.json';

describe('Tooltip imperative ref public package SSR', () => {
  it('pins imperative DOM and layout evidence to the official archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256,
      source: 'package/dist/antd.min.js',
      documentMode: 'CSS1Compat'
    });
    expectTypeOf<ComponentProps<typeof Tooltip>['ref']>().toEqualTypeOf<TooltipRef | undefined>();
    expectTypeOf<TooltipRef['forceAlign']>().toEqualTypeOf<() => void>();
  });

  for (const sample of reference.cases) {
    for (const initialStep of [0, 1]) {
      it(`keeps ${sample.name}/${initialStep} ref unset and shell hidden without browser work`, () => {
        vi.useFakeTimers();
        try {
          const { body } = render(TooltipRefCase, { props: { sample, initialStep } });
          const markup = body.replace(/<!--[\s\S]*?-->/g, '');

          expect(markup).toContain('aria-label="Ref binding">empty</output>');
          expect(markup).toMatch(/role="tooltip"[^>]*\shidden(?:[\s=>])/);
          expect(markup.includes('data-lifecycle-payload')).toBe(!sample.destroy);
          expect(vi.getTimerCount()).toBe(0);
        } finally {
          vi.useRealTimers();
        }
      });
    }
  }
});
