<script lang="ts">
  import TreeMotionScope from './TreeMotionScope.svelte';
  import { treeMotionSamples, nativeTreeMotionSamples } from './tree-motion-cases';
  const samples = [...treeMotionSamples, ...nativeTreeMotionSamples];
  let selected = $state('default');
  let sample = $derived(samples.find(sample => sample.id === selected)!);
</script>

<label>Tree motion case <select bind:value={selected}>
  {#each samples as sample}<option value={sample.id}>{sample.id}</option>{/each}
</select></label>
<section id="tree-motion-fixtures">{#key selected}<TreeMotionScope {sample} />{/key}</section>
