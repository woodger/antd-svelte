<script lang="ts">
  import { onMount } from 'svelte';

  let { record }: { record: (event: string) => void; } = $props();
  let count = $state(0);
  onMount(() => {
    record('mount');
    return () => record('destroy');
  });
</script>

<div class="runtime-overlay" tabindex="-1" role="group" aria-label="Raw More content">
  <input aria-label="Raw More draft" value="Initial draft" />
  <button type="button" onclick={() => count++}>Increment raw More</button>
  <output data-runtime-count>{count}</output>
</div>
