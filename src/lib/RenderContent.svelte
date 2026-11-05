<script lang="ts">
  import type { RenderEmptyContent } from './types';
  let { value }: { value: RenderEmptyContent; } = $props();
</script>

{#snippet content(node: RenderEmptyContent)}
  {#if Array.isArray(node)}
    {#each node as child}{@render content(child)}{/each}
  {:else if typeof node === 'function'}{@render node()}
  {:else if typeof node !== 'boolean'}{node}{/if}
{/snippet}

{@render content(value)}
