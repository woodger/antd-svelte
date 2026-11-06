<script lang="ts">
  import reference from './ant-design-border-beam-theme-reference.json';
  import BorderBeamThemeCase from './BorderBeamThemeCase.svelte';

  let selected = $state('component-aliases');
  let sample = $derived(reference.cases.find(item => item.name === selected)!);
  let mounted = $state(true);
  let enabled = $state(true);
  let inherit = $state(true);
  let lineWidth = $state<number>();
  let primary = $state<string>();
</script>

<section id="border-beam-theme-fixture">
  <h2>Source BorderBeam theme</h2>
  <select aria-label="BorderBeam theme preset" bind:value={selected}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select>
  <label><input type="checkbox" bind:checked={mounted} /> Mount themed beam controls</label>
  <label><input type="checkbox" bind:checked={enabled} /> Apply source beam theme</label>
  <label><input type="checkbox" bind:checked={inherit} /> Inherit child beam theme</label>
  <button type="button" onclick={() => {
    lineWidth = 8;
    primary = '#135200';
  }}>Update beam tokens</button>
  <BorderBeamThemeCase {sample} {mounted} {enabled} {inherit} {lineWidth} {primary} />
</section>
