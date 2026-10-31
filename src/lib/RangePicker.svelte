<script lang="ts">
  import RangePickerCore from './RangePickerCore.svelte';
  import type { RangePickerProps } from './range-picker.types';

  let {
    nativeElement = $bindable(),
    startInput = $bindable(),
    endInput = $bindable(),
    ...props
  }: RangePickerProps = $props();
  let picker = $state<{
    focus(options?: FocusOptions & { index?: 0 | 1; cursor?: 'start' | 'end' | 'all'; }): void;
    blur(): void;
  }>();

  export function focus(
    options?: FocusOptions & { index?: 0 | 1; cursor?: 'start' | 'end' | 'all'; }
  ) {
    picker?.focus(options);
  }

  export function blur() {
    picker?.blur();
  }
</script>

<RangePickerCore {...props} bind:nativeElement bind:startInput bind:endInput bind:this={picker} />
