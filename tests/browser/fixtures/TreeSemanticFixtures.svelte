<script lang="ts">
  import reference from './ant-design-tree-semantic-reference.json';
  import TreeSemanticScope from './TreeSemanticScope.svelte';
  let selected = $state(0);
</script>

<section id="tree-semantic-fixture">
  <label>Tree semantic sample<select bind:value={selected}>
    {#each reference.cases as entry, index}<option value={index}>{entry.sample.id}</option>{/each}
  </select></label>
  {#key selected}<TreeSemanticScope sample={reference.cases[selected].sample} />{/key}
</section>
