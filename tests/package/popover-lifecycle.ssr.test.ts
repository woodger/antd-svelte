import { render } from 'svelte/server';
import type { ComponentProps } from 'svelte';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import { Popover, Popconfirm } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import PopoverLifecycleCase from '../browser/fixtures/PopoverLifecycleCase.svelte';
import type { PopoverLifecycleCase as LifecycleSample } from '../browser/fixtures/popover-lifecycle.types';
import reference from '../browser/fixtures/ant-design-popover-lifecycle-reference.json';

describe('Popover lifecycle public package SSR', () => {
  it('pins lifecycle evidence and exposes id, forceRender, fresh and zIndex in both components', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256,
      source: 'package/dist/antd.min.js'
    });
    expectTypeOf<ComponentProps<typeof Popover>['id']>().toEqualTypeOf<string | undefined>();
    expectTypeOf<ComponentProps<typeof Popconfirm>['forceRender']>()
      .toEqualTypeOf<boolean | undefined>();
    expectTypeOf<ComponentProps<typeof Popconfirm>['fresh']>().toEqualTypeOf<boolean | undefined>();
    expectTypeOf<ComponentProps<typeof Popconfirm>['zIndex']>().toEqualTypeOf<number | undefined>();
  });

  for (const sample of reference.cases as readonly LifecycleSample[]) {
    for (const initialStep of [0, 1]) {
      it(`keeps ${sample.name}/${initialStep} SSR hidden without DOM, portals or timers`, () => {
        vi.useFakeTimers();
        try {
          const { body } = render(PopoverLifecycleCase, { props: { sample, initialStep } });
          const markup = body.replace(/<!--[\s\S]*?-->/g, '');
          const options = sample.frames[initialStep].props;
          const destroyed = options.destroyOnHidden ?? sample.mode === 'avatar';

          expect(markup).toMatch(/role="dialog"[^>]*\shidden(?:[\s=>])/);
          expect(markup).toContain('aria-label="Lifecycle getter calls">0</output>');
          expect(markup).toContain('aria-label="Lifecycle ref">empty</output>');
          expect(markup).toContain('aria-label="Lifecycle events">[]</output>');
          expect(markup.includes('data-lifecycle-payload'))
            .toBe(Boolean(options.widget && !destroyed && sample.mode !== 'avatar'));
          expect(vi.getTimerCount()).toBe(0);
        } finally {
          vi.useRealTimers();
        }
      });
    }
  }
});
