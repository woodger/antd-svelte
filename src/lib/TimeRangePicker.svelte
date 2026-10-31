<script lang="ts">
  import RangePickerCore from './RangePickerCore.svelte';
  import { timeRangeSharedProps } from './time-range-picker-props.engine';
  import type {
    TimeRangePickerFocusOptions,
    TimeRangePickerProps
  } from './time-range-picker.types';

  let {
    nativeElement = $bindable(),
    startInput = $bindable(),
    endInput = $bindable(),
    ...props
  }: TimeRangePickerProps = $props();
  let shared = $derived(timeRangeSharedProps(props));
  let picker = $state<{
    focus(options?: TimeRangePickerFocusOptions): void;
    blur(): void;
  }>();

  /** Index по умолчанию 0; число 0/1 — совместимый shorthand rc-picker. */
  export function focus(options?: TimeRangePickerFocusOptions | 0 | 1) {
    picker?.focus(typeof options === 'number' ? { index: options } : { index: 0, ...options });
  }

  export function blur() {
    picker?.blur();
  }
</script>

<RangePickerCore
  {...shared}
  time={props}
  bind:nativeElement
  bind:startInput
  bind:endInput
  bind:this={picker}
/>
