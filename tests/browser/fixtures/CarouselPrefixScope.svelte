<script lang="ts">
  import { Carousel, type CarouselRef, type CarouselProps } from 'antd-svelte';

  export interface CarouselPrefixSample {
    id: string;
    prefix?: string;
    childPrefix?: string;
    variablePrefix?: string;
    local?: string;
    rtl?: boolean;
    aliases?: boolean;
    placement?: string;
    fade?: boolean;
  }

  let { scope, sample, local = true }: {
    scope: string;
    sample: CarouselPrefixSample;
    local?: boolean;
  } = $props();
  let api = $state<CarouselRef>();
  let events = $state<string[]>([]);
  let items = $derived([1, 2, 3, 4].map(key => ({ key, children: content })));
  let dotPlacement = $derived<CarouselProps['dotPlacement']>(
    sample.placement === 'top' || sample.placement === 'start' || sample.placement === 'end'
      ? sample.placement : 'bottom'
  );
</script>

{#snippet content()}
  <div style="height:120px"><input aria-label={`${scope} slide draft`} value="Draft"
    style="width:90px;height:32px;box-sizing:border-box;font:inherit;padding:0;border:1px solid" /></div>
{/snippet}
<section data-carousel-prefix-scope={scope} style="width:360px">
  <Carousel bind:ref={api} prefixCls={local ? sample.local : undefined} {items}
    speed={0} arrows {dotPlacement}
    effect={sample.fade ? 'fade' : undefined}
    beforeChange={(from, to) => events.push(`before:${from}:${to}`)}
    afterChange={current => events.push(`after:${current}`)} />
  <output aria-label={`${scope} Carousel prefix current`}>{api?.innerSlider?.state.currentSlide}</output>
  <output aria-label={`${scope} Carousel prefix events`}>{events.join('|')}</output>
  <output aria-label={`${scope} Carousel prefix ref`}>{api?.nativeElement ? 'mounted' : 'empty'}</output>
  <button type="button" onclick={() => api?.goTo(2, true)}>Go to third {scope} slide</button>
</section>
