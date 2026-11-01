<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import { useConfig } from './config-context';
  import {
    getCarouselItems,
    getCarouselRows,
    getCarouselSettings
  } from './carousel-settings.engine';
  import { connectCarouselResponsive } from './carousel.dom';
  import type { CarouselInnerSlider, CarouselProps, CarouselRef } from './carousel.types';
  import CarouselSlider from './CarouselSlider.svelte';
  import CarouselContent from './CarouselContent.svelte';

  let { ref = $bindable(), nativeElement = $bindable(), ...props }: CarouselProps = $props();
  const config = useConfig();
  let breakpoint = $state<number | null>(null);
  let items = $derived(getCarouselItems(props));
  let resolved = $derived(getCarouselSettings(props, config.direction, breakpoint));
  let groups = $derived(getCarouselRows(items, resolved.rows, resolved.slidesPerRow));
  let settings = $derived({
    ...resolved,
    unslick: resolved.unslick || groups.length <= resolved.slidesToShow
  });
  let initialSlide = $derived(props.initialSlide ?? 0);
  let rootRtl = $derived(resolved.rootRtl);
  let inner = $state<CarouselInnerSlider>();
  let locale = $derived({
    prevSlide: 'Предыдущий слайд',
    nextSlide: 'Следующий слайд',
    ...config.locale.carousel
  });
  let prefixCls = $derived(props.prefixCls ?? 'ant-carousel');
  let className = $derived([props.class, config.carousel?.class].filter(Boolean).join(' '));
  let style = $derived([config.carousel?.style, props.style].filter(Boolean).join(';'));
  let duration = $derived(typeof props.autoplay === 'object' && props.autoplay.dotDuration
    ? `--dot-duration:${props.autoplaySpeed ?? 3000}ms` : undefined);
  let didReset = false;
  let previousInitial: number | undefined;
  let previousRtl: boolean | undefined;
  const api: CarouselRef = {
    get nativeElement() { return nativeElement; },
    goTo: (slide, dontAnimate = false) => inner?.slickGoTo(slide, dontAnimate),
    next: () => inner?.slickNext(),
    prev: () => inner?.slickPrev(),
    autoPlay: type => inner?.autoPlay(type),
    get innerSlider() { return inner; }
  };

  onMount(() => {
    ref = api;
    const responsive = untrack(() => props.responsive?.map(item => item.breakpoint) ?? []);
    const dispose = connectCarouselResponsive(window, responsive, value => { breakpoint = value; });
    return () => {
      dispose();
      ref = undefined;
    };
  });

  $effect(() => {
    const slider = inner;
    const initial = initialSlide;
    const rtl = rootRtl;
    if (!slider) return;
    if (!didReset || initial !== previousInitial || rtl !== previousRtl) {
      didReset = true;
      previousInitial = initial;
      previousRtl = rtl;
      untrack(() => {
        // Ant Design использует число исходных children до Slick rows/slidesPerRow.
        if (items.length > 0) slider.slickGoTo(rtl ? items.length - initial - 1 : initial, false);
      });
    }
  });
</script>

<style>
  :global(.ant-carousel-css-var) :global(.slick-arrow:focus-visible),
  :global(.ant-carousel-css-var) :global(.slick-slide:focus-visible) {
    outline: 2px solid var(--ant-color-primary) !important;
    outline-offset: -2px;
  }
  :global(.ant-carousel-css-var) :global(.slick-dots li:has(button:focus-visible)) {
    box-shadow: 0 0 0 2px var(--ant-color-primary);
  }
</style>

<div bind:this={nativeElement} id={props.id}
  class={[prefixCls, 'ant-carousel-css-var', resolved.rootRtl && `${prefixCls}-rtl`,
    resolved.rootVertical && `${prefixCls}-vertical`, props.rootClassName]} style={duration}>
  {#if settings.regular}
    <div class={['regular', 'slider', className]}>
      {#each items as item}
        <div {...item.attributes} class={item.class} style={`${item.style ?? ''};${item.width === undefined ? '' : `width:${typeof item.width === 'number' ? `${item.width}px` : item.width}`}`}>
          <CarouselContent value={item.children} />
        </div>
      {/each}
    </div>
  {:else}
    <CarouselSlider {settings} {groups} {locale} class={className} {style} bind:inner />
  {/if}
</div>
