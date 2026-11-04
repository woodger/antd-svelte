<script lang="ts">
  import type { FlexRootProps } from 'antd-svelte';

  let { children, nativeElement = $bindable(), label, ...rest }: FlexRootProps & {
    label: string;
  } = $props();
  let clicks = $state(0);

  function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLElement; }) {
    clicks++;
    rest.onclick?.(event);
  }
</script>

<section {...rest} bind:this={nativeElement} data-custom-label={label}
  data-custom-state={clicks} onclick={handleClick}>{#if children}{@render children()}{/if}</section>
