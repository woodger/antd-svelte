<script lang="ts">
  import OverlayCornerCase from './OverlayCornerCase.svelte';
  import reference from './ant-design-overlay-corner-reference.json';
  import type { OverlayCornerCase as Sample } from './overlay-corner-presets';

  let name = $state(reference.cases[0].name);
  let step = $state(0);
  let mounted = $state(true);
  let native = $state(false);
  let sample = $derived(reference.cases.find(sample => sample.name === name)! as Sample);
</script>

<section id="overlay-corner-fixture">
  <h2>Overlay corner placements</h2>
  <label>Corner reference <select bind:value={name} onchange={() => step = 0}>
    {#each reference.cases as sample}<option value={sample.name}>{sample.name}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={native} /> Native corner defaults</label>
  <button type="button" onclick={() => step++}>Next corner frame</button>
  <button type="button" onclick={() => mounted = !mounted}>Toggle corner component</button>
  <output aria-label="Corner frame">{step}</output>
  {#if mounted}{#key name}<OverlayCornerCase {sample} {step} {native} />{/key}{/if}
</section>
