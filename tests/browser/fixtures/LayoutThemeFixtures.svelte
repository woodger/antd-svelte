<script lang="ts">
  import reference from './ant-design-layout-theme-reference.json';
  import LayoutThemeCase from './LayoutThemeCase.svelte';

  let selected = $state('component-tokens');
  let sample = $derived(reference.cases.find(item => item.name === selected)!);
  let enabled = $state(true);
  let mounted = $state(true);
  let inherit = $state(true);
  let headerHeight = $state<number>();
  let triggerHeight = $state<number>();
  let background = $state<string>();
</script>

<section id="layout-theme-fixture">
  <h2>Source Layout theme</h2>
  <select aria-label="Layout theme preset" bind:value={selected}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select>
  <label><input type="checkbox" bind:checked={enabled} /> Apply source Layout theme</label>
  <label><input type="checkbox" bind:checked={inherit} /> Inherit child Layout theme</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount themed Layout controls</label>
  <button type="button" onclick={() => {
    headerHeight = 84;
    triggerHeight = 60;
    background = '#e6f4ff';
  }}>Update Layout tokens</button>
  <LayoutThemeCase {sample} {enabled} {mounted} {inherit}
    {headerHeight} {triggerHeight} {background} />
</section>
