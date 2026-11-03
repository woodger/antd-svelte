<script lang="ts">
  import reference from './ant-design-tabs-more-position-reference.json';
  import TabsMorePositionCase from './TabsMorePositionCase.svelte';
  import type { TabsMorePositionCase as PositionCase } from './tabs-more-position-presets';

  let name = $state(reference.cases[0].name);
  let sample = $derived(reference.cases.find(item => item.name === name)! as PositionCase);
  let mounted = $state(true);
  let updated = $state(false);
  let wide = $state(false);
  let motion = $state(false);
  let observe = $state(true);
  let sync = $state(false);
</script>

<section id="tabs-more-position-fixture">
  <h2>Tabs More positioning</h2>
  <label>More position reference <select aria-label="More position reference" bind:value={name}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount position Tabs</label>
  <label><input type="checkbox" bind:checked={updated} /> Update More alignment</label>
  <label><input type="checkbox" bind:checked={wide} /> Widen position content</label>
  <label><input type="checkbox" bind:checked={motion} /> Position motion</label>
  <label><input type="checkbox" bind:checked={observe} /> Observe More alignment</label>
  <label><input type="checkbox" bind:checked={sync} /> Sync More alignment</label>
  {#key name}
    <TabsMorePositionCase {sample} {mounted} {updated} {motion} {observe} {sync}
      width={wide ? 220 : undefined} />
  {/key}
</section>
