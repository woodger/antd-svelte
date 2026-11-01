<script lang="ts">
  import TourContent from './TourContent.svelte';
  import type { TourContent as Content } from './tour.types';

  let { value }: { value?: Content; } = $props();
</script>

{#if typeof value === 'function'}{@render value()}
{:else if Array.isArray(value)}
  {#each value as entry}<TourContent value={entry} />{/each}
{:else if value !== null && value !== undefined && typeof value !== 'boolean'}{value}{/if}
