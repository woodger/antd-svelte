<script lang="ts">
  import SinglePicker from './SinglePicker.svelte';
  import { timePickerSharedProps } from './time-picker-props.engine';
  import type { TimePickerFocusOptions, TimePickerProps } from './time-picker.types';

  let { nativeElement = $bindable(), ...props }: TimePickerProps = $props();
  let shared = $derived(timePickerSharedProps(props));
  let picker = $state<{ focus(options?: TimePickerFocusOptions): void; blur(): void; }>();

  export function focus(options?: TimePickerFocusOptions) {
    picker?.focus(options);
  }

  export function blur() {
    picker?.blur();
  }
</script>

<SinglePicker {...shared} time={props} bind:nativeElement bind:this={picker} />
