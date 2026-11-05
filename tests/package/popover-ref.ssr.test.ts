import { render } from 'svelte/server';
import type { ComponentProps } from 'svelte';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import { Popover, Popconfirm, type PopoverRef } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import PopoverRefCase from '../browser/fixtures/PopoverRefCase.svelte';
import reference from '../browser/fixtures/ant-design-popover-ref-reference.json';

describe('Popover and Popconfirm imperative ref public package SSR', () => {
  it('pins source DOM and layout evidence and exposes the shared Svelte ref', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256,
      source: 'package/dist/antd.min.js',
      documentMode: 'CSS1Compat'
    });
    expectTypeOf<ComponentProps<typeof Popover>['ref']>().toEqualTypeOf<PopoverRef | undefined>();
    expectTypeOf<ComponentProps<typeof Popconfirm>['ref']>().toEqualTypeOf<PopoverRef | undefined>();
    expectTypeOf<PopoverRef['popupElement']>().toEqualTypeOf<HTMLDivElement | undefined>();
    expectTypeOf<PopoverRef['forceAlign']>().toEqualTypeOf<() => void>();
  });

  for (const sample of reference.cases) {
    for (const initialStep of [0, 1]) {
      it(`keeps ${sample.name}/${initialStep} ref unset and shell hidden without browser work`, () => {
        vi.useFakeTimers();
        try {
          const { body } = render(PopoverRefCase, { props: { sample, initialStep } });
          const markup = body.replace(/<!--[\s\S]*?-->/g, '');

          expect(markup).toContain('aria-label="Ref binding">empty</output>');
          expect(markup).toMatch(/role="dialog"[^>]*\shidden(?:[\s=>])/);
          expect(markup.includes('data-lifecycle-payload')).toBe(!sample.destroy);
          expect(vi.getTimerCount()).toBe(0);
        } finally {
          vi.useRealTimers();
        }
      });
    }
  }
});
