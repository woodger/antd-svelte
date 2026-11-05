<script lang="ts">
  import reference from './ant-design-splitter-theme-reference.json';
  import SplitterThemeCase from './SplitterThemeCase.svelte';

  let selected = $state('component-tokens');
  let sample = $derived(reference.cases.find(item => item.name === selected)!);
  let enabled = $state(true);
  let mounted = $state(true);
  let inherit = $state(true);
  let triggerSize = $state<number>();
  let barSize = $state<number>();
</script>

<section id="splitter-theme-fixture">
  <h2>Source Splitter tokens</h2>
  <select aria-label="Splitter token preset" bind:value={selected}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select>
  <label><input type="checkbox" bind:checked={enabled} /> Apply source Splitter tokens</label>
  <label><input type="checkbox" bind:checked={inherit} /> Inherit child Splitter tokens</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount themed Splitter controls</label>
  <button type="button" onclick={() => triggerSize = 22}>Update Splitter trigger size</button>
  <button type="button" onclick={() => barSize = 7}>Update Splitter bar size</button>
  <SplitterThemeCase {sample} {enabled} {mounted} {inherit} {triggerSize} {barSize} />
</section>
