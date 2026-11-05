import { render } from 'svelte/server';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import type { PopoverProps, PopconfirmProps, TooltipAlignConfig } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import PopoverAlignCase from '../browser/fixtures/PopoverAlignCase.svelte';
import reference from '../browser/fixtures/ant-design-popover-align-reference.json';
import type { PopoverAlignmentCase } from '../browser/fixtures/popover-align.types';

describe('Popover alignment public package SSR', () => {
  it('pins alignment evidence and exposes shared source configuration types', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256,
      source: 'package/dist/antd.min.js'
    });
    expectTypeOf<PopoverProps['align']>().toEqualTypeOf<TooltipAlignConfig | undefined>();
    expectTypeOf<PopconfirmProps['align']>().toEqualTypeOf<PopoverProps['align']>();
    expectTypeOf<PopconfirmProps['builtinPlacements']>()
      .toEqualTypeOf<PopoverProps['builtinPlacements']>();
    expectTypeOf<PopconfirmProps['onPopupAlign']>().toEqualTypeOf<PopoverProps['onPopupAlign']>();
  });

  for (const sample of reference.cases as readonly PopoverAlignmentCase[]) {
    it(`keeps ${sample.name} hidden without DOM work or alignment callbacks`, () => {
      vi.useFakeTimers();
      try {
        const { body } = render(PopoverAlignCase, { props: { sample } });
        const markup = body.replace(/<!--[\s\S]*?-->/g, '');

        expect(markup).toContain('aria-label="Alignment calls">0</output>');
        expect(markup).toMatch(/role="dialog"[^>]*\shidden(?:[\s=>])/);
        if (sample.mode !== 'avatar') expect(markup).toContain('Alignment draft');
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  }
});
