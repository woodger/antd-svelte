<script lang="ts">
  import reference from './ant-design-responsive-controls-reference.json';
  import ResponsiveControlsCase from './ResponsiveControlsCase.svelte';
  import type { ResponsiveControlsSample } from './ResponsiveControlsScope.svelte';

  let selected = $state(0);
  let live = $state(false);
  let updated = $state(false);
  let mounted = $state(true);
  let enabled = $state(true);
  let entry = $derived(reference.cases[selected]);
  let sample = $derived<ResponsiveControlsSample>(live
    ? { id: 'live', token: updated ? reference.live.token : undefined } : { ...entry.sample, size: entry.sample.size === 'large' ? 'large' : undefined });
</script>

<section id="responsive-controls-fixture">
  <label>Responsive controls sample<select bind:value={selected}>
    {#each reference.cases as entry, index}
      <option value={index}>{entry.sample.id}/{entry.scope}</option>
    {/each}
  </select></label>
  <label><input type="checkbox" bind:checked={live} /> Live responsive controls</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount responsive controls</label>
  <label><input type="checkbox" bind:checked={enabled} /> Source responsive theme</label>
  <button type="button" onclick={() => { updated = !updated; }}>Update responsive breakpoints</button>
  {#key live ? 'live' : selected}
    {#if mounted}
      <ResponsiveControlsCase {sample} scope={live ? 'normal' : entry.scope} {enabled} />
    {/if}
  {/key}
</section>
