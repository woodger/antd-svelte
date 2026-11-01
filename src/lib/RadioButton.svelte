<script lang="ts">
  import Radio from './Radio.svelte';
  import { provideRadioOptionType } from './radio-context';
  import type { RadioProps } from './radio.types';

  let {
    checked = $bindable(),
    nativeElement = $bindable(),
    inputElement = $bindable(),
    ref = $bindable(),
    ...props
  }: RadioProps = $props();

  provideRadioOptionType('button');

  export function focus(options?: FocusOptions) {
    inputElement?.focus(options);
  }

  export function blur() {
    inputElement?.blur();
  }
</script>

<Radio {...props} bind:checked bind:nativeElement bind:inputElement bind:ref />
