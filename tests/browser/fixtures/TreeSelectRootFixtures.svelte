<script lang="ts">
  import TreeSelectRootCase from './TreeSelectRootCase.svelte';
  import { treeSelectRootSamples } from './tree-select-root-cases';
  let selected = $state(treeSelectRootSamples[0].id);
  let sample = $derived(treeSelectRootSamples.find(sample => sample.id === selected)!);
</script>
<section id="tree-select-root-fixture">
  <label>TreeSelect root sample<select bind:value={selected}>
    {#each treeSelectRootSamples as entry}<option value={entry.id}>{entry.id}</option>{/each}
  </select></label>
  {#key selected}<TreeSelectRootCase {sample} />{/key}
</section>
