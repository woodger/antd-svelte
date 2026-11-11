<script lang="ts">
  import TreeSelectInputResponsiveCase from './TreeSelectInputResponsiveCase.svelte';
  import { treeSelectInputResponsiveSamples } from './tree-select-input-responsive-cases';
  let selected = $state(treeSelectInputResponsiveSamples[0].id);
  let sample = $derived(treeSelectInputResponsiveSamples.find(sample => sample.id === selected)!);
</script>
<section id="tree-select-input-responsive-fixture">
  <label>Responsive custom input sample<select bind:value={selected}>
    {#each treeSelectInputResponsiveSamples as sample}<option value={sample.id}>{sample.id}</option>{/each}
  </select></label>
  {#key selected}<TreeSelectInputResponsiveCase {sample} />{/key}
</section>
