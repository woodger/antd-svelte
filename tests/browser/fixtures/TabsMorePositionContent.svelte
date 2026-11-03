<script lang="ts">
  import { onMount } from 'svelte';

  let { width, onLife }: { width: number; onLife: (event: string) => void; } = $props();
  let count = $state(0);
  onMount(() => {
    onLife('mount');
    return () => onLife('destroy');
  });
</script>

<div class="position-content" data-position-content tabindex="-1" role="group"
  aria-label="Position overlay" style={`width:${width}px`}>
  <input aria-label="Position draft" value="Position draft" />
  <button type="button" onclick={() => count++}>Count position</button>
  <output data-position-count>{count}</output>
</div>
