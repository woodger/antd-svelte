<script lang="ts">
  import reference from './ant-design-badge-prefix-reference.json';
  import BadgeApiCase from './BadgeApiCase.svelte';
  import type { BadgeApiCase as Sample } from './badge-api-presets';

  let name = $state(reference.cases[0].name);
  let sample = $derived(reference.cases.find(sample => sample.name === name)! as Sample);
  let changed = $state(false);
  let mounted = $state(true);
  let interactive = $state(false);
</script>

<section id="badge-prefix-fixture">
  <h2>Badge local prefixes</h2>
  <label>Badge prefix reference <select aria-label="Badge prefix reference" bind:value={name}
    onchange={() => { changed = false; mounted = true; }}>
    {#each reference.cases as sample}<option value={sample.name}>{sample.name}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={interactive} /> Interactive prefix count</label>
  <button type="button" onclick={() => changed = !changed}>Change badge value props</button>
  <button type="button" onclick={() => mounted = !mounted}>Toggle value badge</button>
  {#key name}<BadgeApiCase {sample} {changed} {mounted} {interactive} />{/key}
</section>
