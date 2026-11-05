<script lang="ts">
  import reference from './ant-design-segmented-theme-reference.json';
  import SegmentedThemeCase from './SegmentedThemeCase.svelte';

  let selected = $state('component-tokens');
  let sample = $derived(reference.cases.find(item => item.name === selected)!);
  let enabled = $state(true);
  let mounted = $state(true);
  let inherit = $state(true);
  let motion = $state(false);
  let trackPadding = $state<number>();
</script>

<section id="segmented-theme-fixture">
  <h2>Source Segmented tokens</h2>
  <select aria-label="Segmented token preset" bind:value={selected}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select>
  <label><input type="checkbox" bind:checked={enabled} /> Apply source Segmented tokens</label>
  <label><input type="checkbox" bind:checked={inherit} /> Inherit child Segmented tokens</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount themed Segmented controls</label>
  <label><input type="checkbox" bind:checked={motion} /> Animate Segmented theme</label>
  <button type="button" onclick={() => trackPadding = 7}>Update Segmented track padding</button>
  <SegmentedThemeCase {sample} {enabled} {mounted} {inherit} {trackPadding} {motion} />
</section>
