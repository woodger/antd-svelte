<script module lang="ts">
  export type { InputNumberProps } from './input-number.types';
</script>

<script lang="ts" generics="Value extends InputNumberValue = number">
  import type {
    InputNumberFocusOptions,
    InputNumberProps,
    InputNumberValue
  } from './input-number.types';
  import InputNumberControl from './InputNumberControl.svelte';

  let {
    value = $bindable(),
    inputElement = $bindable(),
    nativeElement = $bindable(),
    ref = $bindable(),
    ...props
  }: InputNumberProps<Value> = $props();

  export function focus(options?: InputNumberFocusOptions) {
    ref?.focus(options);
  }

  export function blur() {
    ref?.blur();
  }
</script>

<InputNumberControl {...props} rootClassName={props.rootClassName}
  bind:value bind:inputElement bind:nativeElement bind:ref />
