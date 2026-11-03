<script lang="ts">
  import reference from './ant-design-badge-ribbon-reference.json';
  import BadgeRibbonCase from './BadgeRibbonCase.svelte';
  import type { BadgeRibbonCase as Sample } from './badge-ribbon-presets';

  let name = $state(reference.cases[0].name);
  let sample = $derived(reference.cases.find(sample => sample.name === name)! as Sample);
  let changed = $state(false);
  let dark = $state(false);
  let mounted = $state(true);
  let nativeElement = $state<HTMLDivElement>();
</script>

<section id="badge-ribbon-fixture">
  <h2>Badge Ribbon</h2>
  <label>Ribbon reference <select aria-label="Ribbon reference" bind:value={name}>
    {#each reference.cases as sample}<option value={sample.name}>{sample.name}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={changed} /> Change Ribbon props</label>
  <label><input type="checkbox" bind:checked={dark} /> Dark Ribbon theme</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount Ribbon</label>
  {#if mounted}
    {#key name}<BadgeRibbonCase {sample} {changed} {dark} bind:nativeElement />{/key}
  {/if}
  <output aria-label="Ribbon owner ref">{nativeElement ? 'mounted' : 'empty'}</output>
</section>
