<script lang="ts">
  import reference from './ant-design-watermark-theme-reference.json';
  import WatermarkThemeCase from './WatermarkThemeCase.svelte';

  let preset = $state('global-aliases');
  let mounted = $state(true);
  let enabled = $state(true);
  let inherit = $state(true);
  let color = $state<string>();
  let fontSize = $state<number>();
  let popupBase = $state<number>();
  let sample = $derived(reference.cases.find(item => item.name === preset)!);
</script>

<section id="watermark-theme-fixture">
  <h2>Watermark source theme</h2>
  <select aria-label="Watermark theme preset" bind:value={preset}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select>
  <label><input type="checkbox" bind:checked={mounted} /> Mount themed Watermark controls</label>
  <label><input type="checkbox" bind:checked={enabled} /> Apply source Watermark theme</label>
  <label><input type="checkbox" bind:checked={inherit} /> Inherit Watermark theme</label>
  <button type="button" onclick={() => {
    color = '#135200'; fontSize = 26; popupBase = 2300;
  }}>Update Watermark tokens</button>
  {#key preset}
    <WatermarkThemeCase {sample} {mounted} {enabled} {inherit} {color} {fontSize} {popupBase} />
  {/key}
</section>
