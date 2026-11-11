<script lang="ts">
  import { untrack } from 'svelte';
  import TreeSelectTriggerCase from './TreeSelectTriggerCase.svelte';
  import { treeSelectTriggerSamples } from './tree-select-trigger-cases';
  let { initialSample = 'default' }: { initialSample?: string } = $props();
  let selected = $state(untrack(() => initialSample));
  let sample = $derived(treeSelectTriggerSamples.find(entry => entry.id === selected)!);
</script>
<section id="tree-select-trigger-fixture">
  <label>TreeSelect trigger sample<select bind:value={selected}>
    {#each treeSelectTriggerSamples as entry}<option value={entry.id}>{entry.id}</option>{/each}
  </select></label>
  {#key selected}<TreeSelectTriggerCase {sample} />{/key}
</section>
