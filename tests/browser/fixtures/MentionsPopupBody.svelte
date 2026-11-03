<script lang="ts">
  import type { Snippet } from 'svelte';
  import { Input } from 'antd-svelte';
  let { menu, replace = false }: { menu: Snippet; replace?: boolean; } = $props();
  let count = $state(0);
</script>

<strong>Mention header</strong>
{#if !replace}{@render menu()}{/if}
<Input aria-label="Popup field" defaultValue="Popup draft" />
<button type="button" data-mention-count onclick={() => count++}>{count}</button>
