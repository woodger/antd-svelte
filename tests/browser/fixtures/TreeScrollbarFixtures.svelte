<script lang="ts">
  import { untrack } from 'svelte';
  import TreeScrollbarCase from './TreeScrollbarCase.svelte';
  import { treeScrollbarSamples } from './tree-scrollbar-cases';
  let { initialSample = 'tree-select-default' }: { initialSample?: string } = $props();
  let selected = $state(untrack(() => initialSample));
  let sample = $derived(treeScrollbarSamples.find(entry => entry.id === selected)!);
</script>
<section id="tree-scrollbar-fixture">
  <label>Tree scrollbar sample<select bind:value={selected}>
    {#each treeScrollbarSamples.filter(entry => entry.kind === 'tree-select') as entry}
      <option value={entry.id}>{entry.id}</option>
    {/each}
  </select></label>
  {#key selected}<TreeScrollbarCase {sample} />{/key}
</section>
