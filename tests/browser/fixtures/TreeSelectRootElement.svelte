<script lang="ts">
  import type { TreeSelectRootContext } from 'antd-svelte';
  let { context, button, nativeElement = $bindable() }: {
    context: TreeSelectRootContext<HTMLElement>;
    button: boolean;
    nativeElement?: HTMLElement;
  } = $props();
</script>
{#if button}
  <button {...context.attributes} bind:this={nativeElement} {@attach context.register}>Component root</button>
{:else}
  <input {...context.attributes} bind:this={nativeElement} {@attach context.register} />
{/if}
