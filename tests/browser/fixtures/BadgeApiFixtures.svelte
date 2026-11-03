<script lang="ts">
  import reference from './ant-design-badge-api-reference.json';
  import BadgeApiCase from './BadgeApiCase.svelte';
  import type { BadgeApiCase as Sample } from './badge-api-presets';

  let name = $state(reference.cases[0].name);
  let sample = $derived(reference.cases.find(sample => sample.name === name)! as Sample);
  let changed = $state(false);
  let mounted = $state(true);
  let interactive = $state(false);
  let legacyStyle = $state(false);
  let nativeAttrs = $state(false);
</script>

<section id="badge-api-fixture">
  <h2>Badge component configuration</h2>
  <label>Badge API reference <select aria-label="Badge API reference" bind:value={name}
    onchange={() => { changed = false; mounted = true; }}>
    {#each reference.cases as sample}<option value={sample.name}>{sample.name}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={interactive} /> Interactive API count</label>
  <label><input type="checkbox" bind:checked={legacyStyle} /> Legacy API root style</label>
  <label><input type="checkbox" bind:checked={nativeAttrs} /> Native span attributes</label>
  <button type="button" onclick={() => changed = !changed}>Change badge API props</button>
  <button type="button" onclick={() => mounted = !mounted}>Toggle API badge</button>
  {#key name}<BadgeApiCase {sample} {changed} {mounted} {interactive} {legacyStyle} {nativeAttrs} />{/key}
</section>
