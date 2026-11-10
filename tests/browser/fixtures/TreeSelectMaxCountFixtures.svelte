<script lang="ts">
  import reference from './ant-design-tree-select-max-count-reference.json';
  import TreeSelectMaxCountScope from './TreeSelectMaxCountScope.svelte';
  import type { TreeSelectMaxCountSample } from './tree-select-max-count-cases';

  const cases = [...reference.cases, ...reference.observations];
  let selected = $state(0);
</script>

<section id="tree-select-max-count-fixture">
  <label>TreeSelect limit case<select bind:value={selected}>
    {#each cases as entry, index}<option value={index}>{entry.sample.id}</option>{/each}
  </select></label>
  {#key selected}<TreeSelectMaxCountScope sample={cases[selected].sample as TreeSelectMaxCountSample} />{/key}
</section>
