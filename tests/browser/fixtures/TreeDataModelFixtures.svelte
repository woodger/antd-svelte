<script lang="ts">
  import reference from './ant-design-tree-data-model-reference.json';
  import TreeDataModelScope from './TreeDataModelScope.svelte';
  let selected = $state(0);
  let entry = $derived(reference.cases[selected]);
</script>

<section id="tree-data-model-fixture">
  <label>Tree model sample<select bind:value={selected}>
    {#each reference.cases as item, index}<option value={index}>{item.sample.id}</option>{/each}
  </select></label>
  {#key selected}<TreeDataModelScope data={entry.sample.data}
    fieldNames={'fields' in entry.sample ? entry.sample.fields : undefined}
    lookup={entry.result.paths.at(-2)?.query.value ?? ''} />{/key}
</section>
