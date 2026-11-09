<script lang="ts">
  import reference from './ant-design-descriptions-breakpoints-reference.json';
  import DescriptionsBreakpointsCase from './DescriptionsBreakpointsCase.svelte';
  import type { DescriptionsBreakpointsSample } from './DescriptionsBreakpointsScope.svelte';

  let selected = $state(0);
  let live = $state(false);
  let updated = $state(false);
  let mounted = $state(true);
  let enabled = $state(true);
  let entry = $derived(reference.cases[selected]);
  let sample = $derived<DescriptionsBreakpointsSample>(live
    ? { id: 'live', token: updated ? reference.live.token : undefined } : entry.sample);
</script>

<section id="descriptions-breakpoints-fixture">
  <label>Descriptions breakpoint sample<select bind:value={selected}>
    {#each reference.cases as entry, index}
      <option value={index}>{entry.sample.id}/{entry.scope}</option>
    {/each}
  </select></label>
  <label><input type="checkbox" bind:checked={live} /> Live Descriptions breakpoints</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount responsive Descriptions</label>
  <label><input type="checkbox" bind:checked={enabled} /> Source Descriptions breakpoints</label>
  <button type="button" onclick={() => { updated = !updated; }}>Update Descriptions breakpoints</button>
  {#key live ? 'live' : selected}
    {#if mounted}
      <DescriptionsBreakpointsCase {sample} scope={live ? 'normal' : entry.scope} {enabled} />
    {/if}
  {/key}
</section>
