<script lang="ts">
  import reference from './ant-design-tree-expand-action-reference.json';
  import settled from './ant-design-tree-expand-action-settled-reference.json';
  import TreeExpandActionScope from './TreeExpandActionScope.svelte';

  const cases = [...reference.cases, ...settled.cases];
  let selected = $state(0);
</script>

<section id="tree-expand-action-fixture">
  <label>Tree expansion sample<select bind:value={selected}>
    {#each cases as entry, index}<option value={index}>{entry.sample.id}</option>{/each}
  </select></label>
  {#key selected}<TreeExpandActionScope sample={cases[selected].sample} />{/key}
</section>
