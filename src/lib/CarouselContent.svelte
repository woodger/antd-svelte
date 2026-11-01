<script lang="ts">
  import CarouselContent from './CarouselContent.svelte';
  import type { CarouselContent as Content } from './carousel.types';

  let { value }: { value?: Content; } = $props();
</script>

{#if typeof value === 'function'}{@render value()}
{:else if Array.isArray(value)}
  {#each value as child}<CarouselContent value={child} />{/each}
{:else if value !== null && value !== undefined && typeof value !== 'boolean'}{value}{/if}
