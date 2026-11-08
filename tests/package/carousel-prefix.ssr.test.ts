import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import { Carousel, type CarouselProps } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-carousel-prefix-reference.json';
import CarouselPrefixSSRFixtures from '../browser/fixtures/CarouselPrefixSSRFixtures.svelte';

describe('Carousel local and shared prefixes in the public package', () => {
  it('pins official source measurements and live slide identities', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(14);
    expect(reference.transitions).toHaveLength(3);
    expect(reference.transitions.every(step => step.sameRoot && step.sameSlide
      && step.sameEditor && step.focused)).toBe(true);
  });

  it('renders local wrapper states and keeps CSS variables and inner style priority', () => {
    const props: CarouselProps = {
      prefixCls: 'gallery',
      dotPlacement: 'start',
      autoplay: { dotDuration: true },
      autoplaySpeed: 2500,
      style: 'color:red',
      items: [1, 2, 3].map(key => ({
        key,
        children: createRawSnippet(() => ({ render: () => '<p>Slide</p>' }))
      }))
    };
    const rendered = render(Carousel, { props });

    expect(rendered.body).toContain('gallery-vertical');
    expect(rendered.body).toContain('--dot-duration:2500ms');
    expect(rendered.body).toContain('slick-dots-start');
    expect(rendered.body).toContain('color:red');
    expect(rendered.body).not.toContain('prefixCls=');
    expect(rendered.head).toContain('carousel-prefix:gallery:ant');
    expect(rendered.head).toContain('@keyframes gallery-dot-animation');
  });

  it('inherits provider prefixes in SSR without refs, observers or timers', () => {
    vi.useFakeTimers();
    try {
      const rendered = render(CarouselPrefixSSRFixtures);

      expect(rendered.body).toContain('suite-carousel');
      expect(rendered.body).toContain('gallery');
      expect(rendered.body).toContain('inner-carousel');
      expect(rendered.body).toContain('slick-slide');
      expect(rendered.body).not.toContain('>mounted<');
      expect(rendered.head).toContain('carousel-prefix:suite-carousel:suite');
      expect(rendered.head).toContain('carousel-prefix:gallery:inner');
      expect(rendered.head).toContain('carousel-prefix:inner-carousel:inner');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
