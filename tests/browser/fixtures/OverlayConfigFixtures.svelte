<script lang="ts">
  import OverlayConfigCase from './OverlayConfigCase.svelte';
  import reference from './ant-design-overlay-config-reference.json';
  import type { OverlayConfigCase as Sample } from './overlay-config-presets';

  let name = $state(reference.cases[0].name);
  let step = $state(0);
  let interactive = $state(false);
  let native = $state(false);
  let mounted = $state(true);
  let sample = $derived(reference.cases.find(sample => sample.name === name)! as Sample);
</script>

<section id="overlay-config-fixture">
  <h2>Overlay component configuration</h2>
  <label>Config reference <select bind:value={name} onchange={() => step = 0}>
    {#each reference.cases as sample}<option value={sample.name}>{sample.name}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={interactive} /> Interactive config</label>
  <label><input type="checkbox" bind:checked={native} /> Native config theme</label>
  <button type="button" onclick={() => step++}>Next config frame</button>
  <button type="button" onclick={() => mounted = !mounted}>Toggle config component</button>
  <output aria-label="Config frame">{step}</output>
  {#if mounted}{#key `${name}-${interactive}`}<OverlayConfigCase {sample} {step} {interactive} {native} />{/key}{/if}
</section>
