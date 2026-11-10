<script lang="ts">
  import reference from './ant-design-tree-fields-reference.json';
  import TreeFieldsScope from './TreeFieldsScope.svelte';
  let selected = $state(0);
</script>

<section id="tree-fields-fixture">
  <label>Tree fields sample<select bind:value={selected}>
    {#each reference.cases as entry, index}<option value={index}>{entry.sample.id}</option>{/each}
  </select></label>
  {#key selected}<TreeFieldsScope sample={reference.cases[selected].sample} />{/key}
</section>
