import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-carousel-theme-reference.json';
import CarouselThemeCase from '../browser/fixtures/CarouselThemeCase.svelte';

describe('Carousel component theme public package SSR', () => {
  it('pins the official source used for token and geometry expectations', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256,
      source: 'package/dist/antd.min.js'
    });
  });

  it('renders the reported tokens on the wrapper before hydration', () => {
    const sample = reference.cases.find(item => item.name === 'reported')!;

    const { body } = render(CarouselThemeCase, { props: { sample } });

    expect(body).toMatch(/class="ant-carousel ant-carousel-css-var[^>]*style="[^>]*--ant-carousel-dot-width:32px/);
    expect(body).toContain('--ant-carousel-dot-active-width:48px');
    expect(body).toContain('--ant-carousel-arrow-size:28px');
    expect(body).toContain('slick-track');
    expect(body).toContain('Carousel theme draft');
  });

  for (const sample of reference.cases) {
    it(`renders ${sample.name} without DOM, refs, media subscriptions or timers`, () => {
      vi.useFakeTimers();
      try {
        const { body } = render(CarouselThemeCase, { props: { sample } });

        expect(body).toContain('data-carousel-theme="bottom"');
        expect(body).toContain('data-carousel-theme="start"');
        expect(body).toContain('data-carousel-theme="outside"');
        expect(body).toContain('carousel-dot-width:');
        expect(body).toContain('carousel-dot-active-width:');
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  }
});
