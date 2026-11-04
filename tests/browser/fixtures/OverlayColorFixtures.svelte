<script lang="ts">
  import OverlayConfigCase from './OverlayConfigCase.svelte';
  import OverlayColorNestedCase from './OverlayColorNestedCase.svelte';
  import reference from './ant-design-overlay-color-reference.json';
  import type { OverlayConfigCase as Sample } from './overlay-config-presets';
  import type { NestedColorCase } from './overlay-color-presets';

  let name = $state(reference.cases[0].name);
  let step = $state(0);
  let native = $state(false);
  let activeSlider = $state(false);
  let mounted = $state(true);
  let sample = $derived(reference.cases.find(sample => sample.name === name) as Sample | undefined);
  let nested = $derived(reference.nested.find(sample => sample.name === name) as NestedColorCase);
</script>

<section id="overlay-color-fixture">
  <h2>Overlay colors</h2>
  <label>Color reference <select bind:value={name} onchange={() => step = 0}>
    {#each reference.cases as sample}<option value={sample.name}>{sample.name}</option>{/each}
    {#each reference.nested as sample}<option value={sample.name}>{sample.name}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={native} /> Native color theme</label>
  <label><input type="checkbox" bind:checked={activeSlider} /> Active color slider</label>
  <button type="button" onclick={() => step++}>Next color frame</button>
  <button type="button" onclick={() => mounted = !mounted}>Toggle color component</button>
  <output aria-label="Color frame">{step}</output>
  {#if mounted}{#key name}
    {#if sample}<OverlayConfigCase {sample} {step} {native} {activeSlider} />
    {:else}<OverlayColorNestedCase sample={nested} />{/if}
  {/key}{/if}
</section>
