<script lang="ts">
  import { untrack } from 'svelte';
  import TreeSelectNodesCase from './TreeSelectNodesCase.svelte';
  import { treeSelectNodesSamples } from './tree-select-nodes-cases';
  let { initialSample = 'declared' }: { initialSample?: string } = $props();
  let selected = $state(untrack(() => initialSample));
  let sample = $derived(treeSelectNodesSamples.find(entry => entry.id === selected)!);
</script>

<section id="tree-select-nodes-fixture">
  <label>TreeSelect node sample<select bind:value={selected}>
    {#each treeSelectNodesSamples as entry}<option value={entry.id}>{entry.id}</option>{/each}
  </select></label>
  {#key selected}<TreeSelectNodesCase {sample} />{/key}
</section>
