import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import { Carousel, type CarouselProps, type CarouselItem } from 'antd-svelte';
import CarouselFixture from './CarouselFixture.svelte';

describe('Carousel public package', () => {
  it('renders percentage track geometry, source clone indexes and native hidden states', () => {
    const body = render(Carousel, { props: { children: ['First', 'Second', 'Third'] } }).body;

    expect(body.match(/data-index="-?\d+"/g))
      .toEqual([
        'data-index="-1"',
        'data-index="0"',
        'data-index="1"',
        'data-index="2"',
        'data-index="3"'
      ]);
    expect(body).toContain('width:500%;left:-100%');
    expect(body).toContain('width:20%');
    expect(body).toContain('aria-hidden="false"');
    expect(body).toContain('aria-hidden="true"');
    expect(body).toContain('dir="ltr"');
  });

  it('uses wrapper class/id separately from provider and local inner slider styles', () => {
    const body = render(CarouselFixture).body;

    expect(body).toContain('id="ssr-carousel"');
    expect(body).toContain('ant-carousel ant-carousel-css-var outer-class');
    expect(body).toContain('slick-slider local-slider provider-slider');
    expect(body).toContain('color:red;color:green');
    expect(body).toContain('Custom next');
    expect(body).toContain('data-custom-dots="yes"');
  });

  it('groups rows before creating clones and preserves a short terminal row', () => {
    const body = render(Carousel, {
      props: { children: ['A', 'B', 'C', 'D', 'E', 'F', 'G'], rows: 2, slidesPerRow: 2 }
    }).body;

    expect(body.match(/data-index="-?\d+"/g)).toHaveLength(4);
    expect(body.match(/width:50%;display:inline-block/g)).toHaveLength(14);
    expect(body).toContain('>G');
  });

  it('keeps numeric variable widths and cloned totals during SSR', () => {
    const items: readonly CarouselItem[] = Object.freeze([
      { children: 'Narrow', width: 80 }, { children: 'Wide', width: 120 }
    ]);
    const props: CarouselProps = { items, variableWidth: true };
    const body = render(Carousel, { props }).body;

    expect(body).toContain('width:600px;left:-200px');
    expect(body.match(/data-index="-?\d+"/g)).toHaveLength(6);
    expect(body).toContain('width:80px');
    expect(body).toContain('width:120px');
  });

  it('renders lazy placeholders without calling load callbacks on the server', () => {
    const onLazyLoad = vi.fn();
    const body = render(Carousel, {
      props: {
        children: ['Unloaded A', 'Unloaded B', 'Unloaded C'],
        lazyLoad: 'ondemand',
        onLazyLoad
      }
    }).body;

    expect(body.match(/data-index="-?\d+"/g)).toHaveLength(5);
    expect(body).not.toContain('Unloaded');
    expect(onLazyLoad).not.toHaveBeenCalled();
  });

  it.each([{ children: [] }, { children: ['Only'] }])(
    'omits controls and clones for an unslick collection (%j)',
    ({ children }) => {
      const body = render(Carousel, { props: { children, arrows: true } }).body;

      expect(body).not.toContain('slick-cloned');
      expect(body).not.toContain('slick-prev');
      expect(body).not.toContain('slick-dots');
      expect(body.match(/data-index="-?\d+"/g) ?? []).toHaveLength(children.length);
    }
  );

  it('renders opaque snippets inside slide children and leaves responsive activation to mount', () => {
    const content = createRawSnippet(() => ({ render: () => '<h3>Snippet slide</h3>' }));
    const body = render(Carousel, {
      props: {
        children: [content, content, content],
        responsive: [{ breakpoint: 600, settings: 'unslick' }]
      }
    }).body;

    expect(body.match(/<h3>Snippet slide<\/h3>/g)).toHaveLength(5);
    expect(body).toContain('slick-slider');
    expect(body).not.toContain('regular slider');
  });

  it('does not create animation, autoplay, progressive loading or responsive resources in SSR', () => {
    const callback = vi.fn();
    vi.useFakeTimers();
    try {
      const body = render(Carousel, {
        props: {
          children: ['A', 'B', 'C'],
          autoplay: { dotDuration: true },
          lazyLoad: 'progressive',
          onInit: callback,
          onReInit: callback,
          beforeChange: callback,
          afterChange: callback
        }
      }).body;

      expect(body).toContain('--dot-duration:3000ms');
      expect(vi.getTimerCount()).toBe(0);
      expect(callback).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });
});
