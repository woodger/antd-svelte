<script lang="ts">
  import { onMount } from 'svelte';

  let { name, onLifecycle }: {
    name: string;
    onLifecycle: (event: string) => void;
  } = $props();
  let count = $state(0);
  onMount(() => {
    onLifecycle(`mount:${name}`);
    return () => onLifecycle(`destroy:${name}`);
  });
</script>

<input {name} aria-label={`${name} motion draft`} value={`${name} initial`} />
<button type="button" onclick={() => count++}>Increment {name} motion</button>
<output aria-label={`${name} motion count`}>{count}</output>
