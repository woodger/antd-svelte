<script lang="ts">
  import BadgeDigit from './BadgeDigit.svelte';

  let { count }: { count: string | number | boolean | undefined; } = $props();
  let digits = $derived(Boolean(count) && Number(count) % 1 === 0);
</script>

<bdi>{#if digits}{#each [...String(count)] as value, index (String(count).length - index)}<BadgeDigit
  {value} count={Number(count)} />{/each}{:else}{typeof count === 'boolean' ? '' : count ?? ''}{/if}</bdi>
