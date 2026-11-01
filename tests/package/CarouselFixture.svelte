<script lang="ts">
  import {
    Carousel,
    ConfigProvider,
    type CarouselArrowProps,
    type CarouselDotsProps
  } from 'antd-svelte';
  import type { Snippet } from 'svelte';
</script>

{#snippet arrow(info: CarouselArrowProps)}
  <button type="button" class={info.class} style={info.style} onclick={info.onClick}>
    {info.class.includes('slick-next') ? 'Custom next' : 'Custom previous'}
  </button>
{/snippet}

{#snippet dots(content: Snippet, info: CarouselDotsProps)}
  <ol class={info.class} data-custom-dots="yes">{@render content()}</ol>
{/snippet}

<ConfigProvider carousel={{ class: 'provider-slider', style: 'color:red' }}>
  <Carousel children={['A', 'B', 'C']} arrows nextArrow={arrow} prevArrow={arrow}
    appendDots={dots} class="local-slider" style="color:green" rootClassName="outer-class"
    id="ssr-carousel" />
</ConfigProvider>
