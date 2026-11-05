import { render } from 'svelte/server';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import type { PopoverProps, PopconfirmProps, PopoverTrigger } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-popover-actions-reference.json';
import PopoverActionsCase from '../browser/fixtures/PopoverActionsCase.svelte';
import type { PopoverActionCase } from '../browser/fixtures/popover-actions.types';

describe('Popover action public package SSR', () => {
  it('pins inherited action traces and exposes the public action types', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256,
      documentMode: 'CSS1Compat',
      delegated: { tooltip: '1.5.2', trigger: '3.10.1' }
    });
    expectTypeOf<PopoverProps['showAction']>().toEqualTypeOf<readonly PopoverTrigger[] | undefined>();
    expectTypeOf<PopconfirmProps['hideAction']>().toEqualTypeOf<readonly PopoverTrigger[] | undefined>();
    expectTypeOf<PopoverProps['focusDelay']>().toEqualTypeOf<number | undefined>();
    expectTypeOf<PopconfirmProps['blurDelay']>().toEqualTypeOf<number | undefined>();
    expectTypeOf<PopoverProps['disabled']>().toEqualTypeOf<boolean | undefined>();
  });

  for (const sample of reference.cases as readonly PopoverActionCase[]) {
    it(`keeps ${sample.name} SSR hidden without timers or callbacks`, () => {
      vi.useFakeTimers();
      try {
        const { body } = render(PopoverActionsCase, { props: { sample } });

        expect(body).toMatch(/role="dialog"[^>]*\shidden(?:[\s=>])/);
        expect(body.replace(/<!--[\s\S]*?-->/g, ''))
          .toContain('aria-label="Popover action events">[]');
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  }
});
