import { render } from 'svelte/server';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import type { SliderTooltipConfig, TooltipProps } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-tooltip-lifecycle-reference.json';
import TooltipLifecycleCaseComponent from '../browser/fixtures/TooltipLifecycleCase.svelte';
import type { TooltipLifecycleCase } from '../browser/fixtures/tooltip-lifecycle.types';

const cases = reference.cases as readonly TooltipLifecycleCase[];

describe('Tooltip lifecycle public package SSR', () => {
  it('pins the public reference and exposes matching scalar props to Tooltip and Slider', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256,
      source: 'package/dist/antd.min.js',
      documentMode: 'CSS1Compat',
      delegated: { tooltip: '1.5.2', trigger: '3.10.1', util: '1.14.0' }
    });
    expectTypeOf<TooltipProps['id']>().toEqualTypeOf<string | undefined>();
    expectTypeOf<TooltipProps['disabled']>().toEqualTypeOf<boolean | undefined>();
    expectTypeOf<TooltipProps['forceRender']>().toEqualTypeOf<boolean | undefined>();
    expectTypeOf<TooltipProps['zIndex']>().toEqualTypeOf<number | undefined>();
    expectTypeOf<SliderTooltipConfig['id']>().toEqualTypeOf<TooltipProps['id']>();
    expectTypeOf<SliderTooltipConfig['disabled']>().toEqualTypeOf<TooltipProps['disabled']>();
    expectTypeOf<SliderTooltipConfig['forceRender']>().toEqualTypeOf<TooltipProps['forceRender']>();
    expectTypeOf<SliderTooltipConfig['zIndex']>().toEqualTypeOf<TooltipProps['zIndex']>();
  });

  for (const sample of cases) {
    it(`renders ${sample.name} without opening a popup, resolving a portal or scheduling work`, () => {
      vi.useFakeTimers();
      try {
        const { body } = render(TooltipLifecycleCaseComponent, { props: { sample } });
        const markup = body.replace(/<!--[\s\S]*?-->/g, '');
        const options = sample.frames[0].props;
        const content = markup.match(
          /<span[^>]*data-ant-tooltip-container=""[^>]*>([\s\S]*?)<\/span>/
        )?.[1];

        expect(markup).toContain('Lifecycle trigger');
        expect(markup).toMatch(/role="tooltip"[^>]*\shidden(?:[\s=>])/);
        expect(markup).toContain('aria-describedby="existing-description"');
        expect(markup).toContain('aria-label="Lifecycle getter calls">0</output>');
        expect(markup).toContain('aria-label="Lifecycle ref">empty</output>');
        expect(markup).toContain('aria-label="Lifecycle events">[]</output>');
        expect(content).toBe(options.destroyOnHidden ? '' : options.title);
        if (options.id) expect(markup).toContain(`id="${options.id}"`);
        else expect(markup).toMatch(/id="ant-tooltip-[^"]+"/);
        if (options.zIndex !== undefined) {
          expect(markup).toContain(`z-index:${options.zIndex}`);
        }
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  }
});
