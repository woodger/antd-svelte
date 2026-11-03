<script lang="ts">
  import reference from './ant-design-badge-zoom-reference.json';
  import BadgeZoomCase from './BadgeZoomCase.svelte';
  import type { BadgeZoomCase as Sample } from './badge-zoom-presets';

  let name = $state(reference.cases[0].name);
  let sample = $derived(reference.cases.find(sample => sample.name === name)! as Sample);
  let interactive = $state(false);
  let fast = $state(false);
</script>

<section id="badge-zoom-fixture">
  <h2>Badge zoom motion</h2>
  <label>Badge zoom reference <select aria-label="Badge zoom reference" bind:value={name}>
    {#each reference.cases as sample}<option value={sample.name}>{sample.name}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={interactive} /> Interactive zoom count</label>
  <label><input type="checkbox" bind:checked={fast} /> Short zoom duration</label>
  {#key name}<BadgeZoomCase {sample} {interactive} {fast} />{/key}
</section>
