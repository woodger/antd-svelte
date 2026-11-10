<script lang="ts">
  import { treeTagSamples, treeTagObservations } from './tree-select-tag-cases';
  import TreeSelectTagsScope from './TreeSelectTagsScope.svelte';

  const cases = [...treeTagSamples, ...treeTagObservations];
  let selected = $state(cases[0].id as string);
  let sample = $derived(cases.find(sample => sample.id === selected)!);
</script>

<section id="tree-select-tags-fixture">
  <label>Tree tag sample<select bind:value={selected}>
    {#each cases as sample}<option value={sample.id}>{sample.id}</option>{/each}
  </select></label>
  {#key sample.id}<TreeSelectTagsScope {sample} />{/key}
</section>
