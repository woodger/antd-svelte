<script lang="ts">
  import reference from './ant-design-tree-node-renderers-reference.json';
  import TreeNodeRendererScope from './TreeNodeRendererScope.svelte';
  let selected = $state(0);
</script>

<section id="tree-node-renderer-fixture">
  <label>Tree renderer sample<select bind:value={selected}>
    {#each reference.cases as entry, index}<option value={index}>{entry.sample.id}</option>{/each}
  </select></label>
  {#key selected}<TreeNodeRendererScope sample={reference.cases[selected].sample} />{/key}
</section>
