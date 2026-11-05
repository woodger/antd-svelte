import { render } from 'svelte/server';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import type { TooltipProps, TooltipTrigger } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-tooltip-actions-reference.json';
import TooltipLifecycleCase from '../browser/fixtures/TooltipLifecycleCase.svelte';
import type { TooltipActionCase } from '../browser/fixtures/tooltip-actions.types';

describe('Tooltip action public package SSR', () => {
  it('pins action traces and exposes independent actions and focus delays', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256,
      documentMode: 'CSS1Compat',
      delegated: { tooltip: '1.5.2', trigger: '3.10.1' }
    });
    expectTypeOf<TooltipProps['showAction']>().toEqualTypeOf<readonly TooltipTrigger[] | undefined>();
    expectTypeOf<TooltipProps['hideAction']>().toEqualTypeOf<readonly TooltipTrigger[] | undefined>();
    expectTypeOf<TooltipProps['focusDelay']>().toEqualTypeOf<number | undefined>();
    expectTypeOf<TooltipProps['blurDelay']>().toEqualTypeOf<number | undefined>();
  });

  for (const sample of reference.cases as readonly TooltipActionCase[]) {
    it(`keeps ${sample.name} SSR free of timers and callbacks`, () => {
      vi.useFakeTimers();
      try {
        const { body } = render(TooltipLifecycleCase, {
          props: { sample, kind: sample.mode }
        });

        expect(body).toContain('id="lifecycle-trigger"');
        expect(body.replace(/<!--[\s\S]*?-->/g, ''))
          .toContain('aria-label="Lifecycle events">[]');
        if (sample.mode === 'tooltip') {
          expect(body).toMatch(/role="tooltip"[^>]*\shidden(?:[\s=>])/);
        } else expect(body).not.toContain('role="tooltip"');
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  }
});
