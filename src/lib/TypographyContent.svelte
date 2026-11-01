<script lang="ts">
  import TypographyContent from './TypographyContent.svelte';
  import type { TypographyContent as Content } from './typography.types';
  let { value }: { value?: Content; } = $props();
</script>

{#if typeof value === 'function'}{@render value()}
{:else if Array.isArray(value)}
  {#each value as entry}<TypographyContent value={entry} />{/each}
{:else if value !== null && value !== undefined && typeof value !== 'boolean'}{value}{/if}
