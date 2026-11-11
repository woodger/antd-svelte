<script lang="ts">
  import TreeSelectSemanticScope from './TreeSelectSemanticScope.svelte';
  import { treeSelectSemanticSamples } from './tree-select-semantic-cases';

  let selected = $state(treeSelectSemanticSamples[0].id);
  let sample = $derived(treeSelectSemanticSamples.find(item => item.id === selected)!);
</script>

<section id="tree-select-semantic-fixture">
  <label>Semantic sample<select bind:value={selected}>
    {#each treeSelectSemanticSamples as entry}<option value={entry.id}>{entry.id}</option>{/each}
  </select></label>
  {#key selected}<TreeSelectSemanticScope {sample} />{/key}
</section>
