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

<input {name} aria-label={`${name} render draft`} value="Initial render draft" />
<button type="button" onclick={() => count++}>Increment {name} render</button>
<output aria-label={`${name} render count`}>{count}</output>
