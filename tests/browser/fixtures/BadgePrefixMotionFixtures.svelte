<script lang="ts">
  import reference from './ant-design-badge-prefix-motion-reference.json';
  import BadgeZoomCase from './BadgeZoomCase.svelte';
  import type { BadgeZoomCase as Sample } from './badge-zoom-presets';

  let name = $state(reference.cases[0].name);
  let sample = $derived(reference.cases.find(sample => sample.name === name)! as Sample);
  let interactive = $state(false);
  let fast = $state(false);
  let mounted = $state(true);
</script>

<section id="badge-prefix-motion-fixture">
  <h2>Badge prefix zoom motion</h2>
  <label>Badge zoom reference <select aria-label="Badge zoom reference" bind:value={name}
    onchange={() => mounted = true}>
    {#each reference.cases as sample}<option value={sample.name}>{sample.name}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={interactive} /> Interactive zoom count</label>
  <label><input type="checkbox" bind:checked={fast} /> Short zoom duration</label>
  <button type="button" onclick={() => mounted = false}>Remove prefix motion badge</button>
  {#if mounted}{#key name}<BadgeZoomCase {sample} {interactive} {fast} />{/key}{/if}
</section>
