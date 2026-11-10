<script lang="ts">
  import reference from './ant-design-tree-select-expand-action-reference.json';
  import TreeSelectExpandActionScope from './TreeSelectExpandActionScope.svelte';

  const cases = [...reference.cases, ...reference.observations];
  let selected = $state(0);
</script>

<section id="tree-select-expand-action-fixture">
  <label>TreeSelect title case<select bind:value={selected}>
    {#each cases as entry, index}<option value={index}>{entry.sample.id}</option>{/each}
  </select></label>
  {#key selected}<TreeSelectExpandActionScope sample={cases[selected].sample} />{/key}
</section>
