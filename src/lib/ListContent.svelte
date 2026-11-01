<script lang="ts">
  import type { ListContent } from './list.types';
  let { value }: { value: ListContent; } = $props();
</script>

{#snippet content(node: ListContent)}
  {#if Array.isArray(node)}
    {#each node as child}{@render content(child)}{/each}
  {:else if typeof node === 'function'}{@render node()}
  {:else if typeof node !== 'boolean'}{node}{/if}
{/snippet}

{@render content(value)}
