<script lang="ts">
  import OverlayConfigCase from './OverlayConfigCase.svelte';
  import reference from './ant-design-overlay-prefix-reference.json';
  import type { OverlayConfigCase as Sample } from './overlay-config-presets';

  let name = $state(reference.cases[0].name);
  let step = $state(0);
  let native = $state(false);
  let activeSlider = $state(false);
  let natural = $state(false);
  let mounted = $state(true);
  let sample = $derived(reference.cases.find(sample => sample.name === name)! as Sample);
</script>

<section id="overlay-prefix-fixture">
  <h2>Overlay prefixes</h2>
  <label>Prefix reference <select bind:value={name} onchange={() => step = 0}>
    {#each reference.cases as sample}<option value={sample.name}>{sample.name}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={native} /> Native prefix theme</label>
  <label><input type="checkbox" bind:checked={activeSlider} /> Active prefix slider</label>
  <label><input type="checkbox" bind:checked={natural} /> Natural prefix layout</label>
  <button type="button" onclick={() => step++}>Next prefix frame</button>
  <button type="button" onclick={() => mounted = !mounted}>Toggle prefix component</button>
  <output aria-label="Prefix frame">{step}</output>
  {#if mounted}{#key name}
    <OverlayConfigCase {sample} {step} {native} {activeSlider} {natural} />
  {/key}{/if}
  <button type="button">After prefix component</button>
</section>
