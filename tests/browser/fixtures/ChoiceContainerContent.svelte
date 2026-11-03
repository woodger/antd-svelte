<script lang="ts">
  import type { Snippet } from 'svelte';
  let { menus }: { menus: Snippet; } = $props();
  let count = $state(0);
</script>

{@render menus()}
<input aria-label="Choice popup draft" value="Draft" />
<button type="button" data-choice-count onclick={() => count++}>{count}</button>
