<script lang="ts">
  import SinglePicker from './SinglePicker.svelte';
  import type { DatePickerProps } from './date-picker.types';

  let { nativeElement = $bindable(), ...props }: DatePickerProps = $props();
  let picker = $state<{
    focus(options?: FocusOptions & { cursor?: 'start' | 'end' | 'all'; }): void;
    blur(): void;
  }>();

  export function focus(options?: FocusOptions & { cursor?: 'start' | 'end' | 'all'; }) {
    picker?.focus(options);
  }

  export function blur() {
    picker?.blur();
  }
</script>

<SinglePicker {...props} bind:nativeElement bind:this={picker} />
