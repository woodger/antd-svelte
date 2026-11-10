<script lang="ts">
  import TreeDragScope from './TreeDragScope.svelte';
  import { treeDragSamples, treeDragObservations, treeDragNativeSamples } from './tree-drag-cases';
  let selected = $state(0);
  const samples = [...treeDragSamples, ...treeDragObservations, ...treeDragNativeSamples];
</script>

<section id="tree-drag-fixture">
  <label>Tree drag sample<select bind:value={selected}>
    {#each samples as sample, index}<option value={index}>{sample.id}</option>{/each}
  </select></label>
  {#key selected}<TreeDragScope sample={samples[selected]} />{/key}
</section>
