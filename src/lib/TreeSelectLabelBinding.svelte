<script lang="ts" generics="Data">
  import { untrack, type Snippet } from 'svelte';

  let { renderer, data, capture }: {
    renderer: Snippet<[Data]>;
    data: Data;
    capture: (label: Snippet) => void;
  } = $props();

  const template = untrack(() => renderer);
  const snapshot = untrack(() => data);
  untrack(() => capture(label));
</script>

{#snippet label()}{@render template(snapshot)}{/snippet}
