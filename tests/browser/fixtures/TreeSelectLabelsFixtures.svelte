<script lang="ts">
  import TreeSelectLabelsScope from './TreeSelectLabelsScope.svelte';
  import { treeLabelObservations, treeLabelSamples } from './tree-select-label-cases';

  const samples = [...treeLabelSamples, ...treeLabelObservations];
  let selected = $state(samples[0].id);
  let interactive = $state(false);
  let sample = $derived(samples.find(entry => entry.id === selected)!);
</script>

<section id="tree-select-labels-fixture">
  <label>Renderer sample<select bind:value={selected}>
    {#each samples as entry}<option value={entry.id}>{entry.id}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={interactive} />Interactive renderer</label>
  {#key sample.id + ':' + interactive}<TreeSelectLabelsScope {sample} {interactive} />{/key}
</section>
