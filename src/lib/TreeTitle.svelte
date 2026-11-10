<script lang="ts" generics="Data extends object">
  import type { TreeTitleContent } from './tree.types';
  let { value, node }: { value: TreeTitleContent<Data>; node: Data; } = $props();
</script>

{#snippet content(value: TreeTitleContent<Data>)}
  {#if Array.isArray(value)}
    {#each value as child}{@render content(child)}{/each}
  {:else if typeof value === 'function'}{@render value(node)}
  {:else if typeof value !== 'boolean'}{value}{/if}
{/snippet}

{@render content(value)}
