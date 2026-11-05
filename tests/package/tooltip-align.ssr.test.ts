import { render } from 'svelte/server';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import type { TooltipAlignConfig, TooltipProps } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import TooltipAlignCase from '../browser/fixtures/TooltipAlignCase.svelte';
import reference from '../browser/fixtures/ant-design-tooltip-align-reference.json';
import type { TooltipAlignmentCase } from '../browser/fixtures/tooltip-align.types';

describe('Tooltip alignment public package SSR', () => {
  it('pins alignment evidence and exposes the source configuration type', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256,
      source: 'package/dist/antd.min.js'
    });
    expectTypeOf<TooltipProps['align']>().toEqualTypeOf<TooltipAlignConfig | undefined>();
  });

  for (const sample of reference.cases as readonly TooltipAlignmentCase[]) {
    it(`keeps ${sample.name} hidden without DOM work or alignment callbacks`, () => {
      vi.useFakeTimers();
      try {
        const { body } = render(TooltipAlignCase, { props: { sample } });
        const markup = body.replace(/<!--[\s\S]*?-->/g, '');

        expect(markup).toContain('aria-label="Alignment calls">0</output>');
        expect(markup).toContain('Alignment draft');
        expect(markup).toMatch(/role="tooltip"[^>]*\shidden(?:[\s=>])/);
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  }
});
