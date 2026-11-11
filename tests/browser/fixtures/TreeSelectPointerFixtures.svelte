<script lang="ts">
  import TreeSelectPointerCase from './TreeSelectPointerCase.svelte';
  import { treeSelectPointerSamples } from './tree-select-pointer-cases';
  let selected = $state(treeSelectPointerSamples[0].id);
  let sample = $derived(treeSelectPointerSamples.find(sample => sample.id === selected)!);
</script>
<section id="tree-select-pointer-fixture">
  <label>TreeSelect pointer sample<select bind:value={selected}>
    {#each treeSelectPointerSamples as entry}<option value={entry.id}>{entry.id}</option>{/each}
  </select></label>
  {#key selected}<TreeSelectPointerCase {sample} />{/key}
</section>
