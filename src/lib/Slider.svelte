<script module lang="ts">
  export type { SliderProps } from './slider.types';
</script>

<script lang="ts" generics="Range extends boolean | SliderRangeConfig = false">
  import SliderSingle from './SliderSingle.svelte';
  import SliderRange from './SliderRange.svelte';
  import type { SliderProps, SliderSingleProps, SliderValue } from './slider.types';
  import type { SliderRangeProps, SliderRangeConfig } from './slider-range.types';

  let {
    value = $bindable(),
    ref = $bindable(),
    nativeElement = $bindable(),
    range,
    ...props
  }: SliderProps<Range> = $props();
</script>

{#if range}
  <SliderRange {...props as Omit<SliderRangeProps, 'range' | 'value' | 'ref' | 'nativeElement'>}
    range={range as SliderRangeProps['range']}
    bind:ref bind:nativeElement
    bind:value={() => value as number[] | null | undefined, next => {
      value = next as SliderValue<Range>;
    }} />
{:else}
  <SliderSingle {...props as SliderSingleProps} bind:ref bind:nativeElement
    bind:value={() => value as number | undefined, next => {
      value = next as SliderValue<Range>;
    }} />
{/if}
