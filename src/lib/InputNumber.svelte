<script module lang="ts">
  export type { InputNumberProps } from './input-number.types';
</script>

<script lang="ts" generics="Value extends InputNumberValue = number">
  import { useFormField } from './form-context';
  import type {
    InputNumberFocusOptions,
    InputNumberProps,
    InputNumberValue
  } from './input-number.types';
  import InputNumberControl from './InputNumberControl.svelte';
  import InputAddonContent from './InputAddonContent.svelte';
  import SpaceCompact from './SpaceCompact.svelte';
  import SpaceAddon from './SpaceAddon.svelte';

  let {
    value = $bindable(),
    inputElement = $bindable(),
    nativeElement = $bindable(),
    ref = $bindable(),
    ...props
  }: InputNumberProps<Value> = $props();
  const field = useFormField();
  let addons = $derived(Boolean(props.addonBefore || props.addonAfter));

  export function focus(options?: InputNumberFocusOptions) {
    ref?.focus(options);
  }

  export function blur() {
    ref?.blur();
  }
</script>

{#snippet control()}
  <InputNumberControl {...props} rootClassName={addons ? undefined : props.rootClassName}
    bind:value bind:inputElement bind:nativeElement bind:ref />
{/snippet}

{#snippet before()}
  <SpaceAddon class="ant-input-number-addon ant-input-number-css-var" variant={props.variant}
    disabled={props.disabled ?? undefined} status={props.status ?? field?.status}>
    <InputAddonContent>
      {#if typeof props.addonBefore === 'function'}{@render props.addonBefore()}
      {:else}{props.addonBefore}{/if}
    </InputAddonContent>
  </SpaceAddon>
{/snippet}

{#snippet after()}
  <SpaceAddon class="ant-input-number-addon ant-input-number-css-var" variant={props.variant}
    disabled={props.disabled ?? undefined} status={props.status ?? field?.status}>
    <InputAddonContent>
      {#if typeof props.addonAfter === 'function'}{@render props.addonAfter()}
      {:else}{props.addonAfter}{/if}
    </InputAddonContent>
  </SpaceAddon>
{/snippet}

{#if addons}
  <SpaceCompact rootClassName={props.rootClassName} items={[
    ...(props.addonBefore ? [{ key: 'before', children: before }] : []),
    { key: 'control', children: control },
    ...(props.addonAfter ? [{ key: 'after', children: after }] : [])
  ]} />
{:else}{@render control()}{/if}
