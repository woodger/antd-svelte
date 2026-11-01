<script lang="ts">
  import type { Snippet } from 'svelte';
  let { tags, children }: {
    tags: readonly ('strong' | 'u' | 'del' | 'code' | 'mark' | 'kbd' | 'i')[];
    children: Snippet;
  } = $props();
</script>

{#snippet wrap(index: number)}
  {#if index < tags.length}
    <svelte:element this={tags[index]}>{@render wrap(index + 1)}</svelte:element>
  {:else}{@render children()}{/if}
{/snippet}
{@render wrap(0)}
