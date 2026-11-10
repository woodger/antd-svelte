<script lang="ts">
  import TreeSelectDataScope from './TreeSelectDataScope.svelte';
  import { treeSelectDataSamples, treeSelectDataObservations } from './tree-select-data-cases';
  const samples = [...treeSelectDataSamples, ...treeSelectDataObservations];
  let id = $state('canonical');
  let sample = $derived(samples.find(sample => sample.id === id)!);
</script>

<label>TreeSelect data case <select bind:value={id}>
  {#each samples as sample}<option value={sample.id}>{sample.id}</option>{/each}
</select></label>
<section id="tree-select-data-fixture">{#key id}<TreeSelectDataScope {sample} />{/key}</section>
