<script lang="ts">
  import type { Snippet } from 'svelte';

  let { children }: { children?: Snippet; } = $props();
  let count = $state(0);
</script>

<div data-provider-content role="group" tabindex="-1" aria-label="Container overlay"
  style="width:200px;min-height:100px;background:white">
  <input aria-label="Container draft" data-provider-draft value="Container draft" />
  <button type="button" data-provider-count onclick={() => count++}>{count}</button>
  {@render children?.()}
</div>
