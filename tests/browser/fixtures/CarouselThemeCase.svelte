<script lang="ts">
  import { ConfigProvider, type ThemeConfig } from 'antd-svelte';
  import CarouselThemeSlider from './CarouselThemeSlider.svelte';
  import {
    resolveCarouselTheme,
    type CarouselReferenceTheme,
    type CarouselThemeSample
  } from './carousel-theme-presets';

  let { sample, enabled = true, mounted = true, dotWidth, inherit = true }: {
    sample: CarouselThemeSample;
    enabled?: boolean;
    mounted?: boolean;
    dotWidth?: number;
    inherit?: boolean;
  } = $props();
  let config = $derived(resolveCarouselTheme(sample.config as CarouselReferenceTheme));
  let current = $derived<ThemeConfig>(enabled ? {
    ...config,
    components: { ...config.components, Carousel: {
      ...config.components?.Carousel,
      ...(dotWidth === undefined ? {} : { dotWidth })
    } }
  } : { mode: 'light', primary: 'blue' });
  let priority = $derived('priority' in sample && sample.priority);
</script>

{#if mounted}
  <ConfigProvider theme={current} direction={'rtl' in sample && sample.rtl ? 'rtl' : 'ltr'}
    carousel={priority ? { style: '--ant-carousel-dot-width:33px' } : undefined}>
    {#each ['bottom', 'top', 'start', 'end'] as placement}
      <CarouselThemeSlider id={placement} placement={placement as 'bottom' | 'top' | 'start' | 'end'}
        {priority} />
    {/each}
    <ConfigProvider theme={{ inherit, components: { Carousel: { dotWidth: 9, arrowSize: 12 } } }}>
      <CarouselThemeSlider id="nested" {priority} />
    </ConfigProvider>
    <ConfigProvider theme={{ inherit: false, token: { motion: false },
      components: { Carousel: { dotWidth: 11 } } }}>
      <CarouselThemeSlider id="reset" {priority} />
    </ConfigProvider>
  </ConfigProvider>
  <ConfigProvider theme={resolveCarouselTheme({ components: { Carousel: { dotWidth: 10 } } })}>
    <CarouselThemeSlider id="sibling" {priority} />
  </ConfigProvider>
{/if}
<CarouselThemeSlider id="outside" {priority} />
