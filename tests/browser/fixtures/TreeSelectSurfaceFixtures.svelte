<script lang="ts">
  import TreeSelectSurfaceScope from './TreeSelectSurfaceScope.svelte';
  import { treeSelectSurfaceSamples } from './tree-select-surface-cases';

  let selected = $state(treeSelectSurfaceSamples[0].id);
  let sample = $derived(treeSelectSurfaceSamples.find(entry => entry.id === selected)!);
</script>

<section id="tree-select-surface-fixture">
  <label>Surface sample<select bind:value={selected}>
    {#each treeSelectSurfaceSamples as entry}<option value={entry.id}>{entry.id}</option>{/each}
  </select></label>
  {#key selected}<TreeSelectSurfaceScope {sample} />{/key}
</section>
