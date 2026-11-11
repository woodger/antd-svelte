<script lang="ts">
  import TreeSelectComponentsFormCase from './TreeSelectComponentsFormCase.svelte';
  import { treeSelectComponentsFormSamples } from './tree-select-components-form-cases';
  let selected = $state(treeSelectComponentsFormSamples[0].id);
  let sample = $derived(treeSelectComponentsFormSamples.find(sample => sample.id === selected)!);
</script>

<section id="tree-select-components-form-fixture">
  <label>TreeSelect components Form sample<select bind:value={selected}>
    {#each treeSelectComponentsFormSamples as sample}<option value={sample.id}>{sample.id}</option>{/each}
  </select></label>
  {#key selected}<TreeSelectComponentsFormCase {sample} />{/key}
</section>
