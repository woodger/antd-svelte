<script lang="ts">
  import Radio from './Radio.svelte';
  import { provideRadioOptionType } from './radio-context';
  import type { RadioProps } from './radio.types';

  let {
    checked = $bindable(),
    nativeElement = $bindable(),
    inputElement = $bindable(),
    ...props
  }: RadioProps = $props();

  provideRadioOptionType('button');
</script>

<Radio {...props} bind:checked bind:nativeElement bind:inputElement />
