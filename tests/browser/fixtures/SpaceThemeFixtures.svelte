<script lang="ts">
  import reference from './ant-design-space-theme-reference.json';
  import SpaceThemeCase from './SpaceThemeCase.svelte';

  let selected = $state('component-aliases');
  let sample = $derived(reference.cases.find(item => item.name === selected)!);
  let mounted = $state(true);
  let enabled = $state(true);
  let inherit = $state(true);
  let replaced = $state(false);
  let reversed = $state(false);
  let padding = $state<number>();
  let configUpdate = $state(false);
</script>

<section id="space-theme-fixture">
  <h2>Source Space theme and configuration</h2>
  <select aria-label="Space theme preset" bind:value={selected}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select>
  <label><input type="checkbox" bind:checked={mounted} /> Mount themed Space controls</label>
  <label><input type="checkbox" bind:checked={enabled} /> Apply source Space theme</label>
  <label><input type="checkbox" bind:checked={inherit} /> Inherit child Space theme</label>
  <label><input type="checkbox" bind:checked={replaced} /> Replace Space config with empty record</label>
  <button type="button" onclick={() => padding = 26}>Update Space padding</button>
  <button type="button" onclick={() => configUpdate = true}>Update Space config</button>
  <button type="button" onclick={() => reversed = !reversed}>Reverse themed Space items</button>
  <SpaceThemeCase {sample} {mounted} {enabled} {inherit} {replaced} {reversed}
    {padding} {configUpdate} />
</section>
