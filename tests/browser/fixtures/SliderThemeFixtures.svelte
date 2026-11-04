<script lang="ts">
  import SliderThemeCase from './SliderThemeCase.svelte';
  import { sliderThemePresets } from './slider-theme-presets';

  let preset = $state('default');
  let enabled = $state(true);
  let disabled = $state(false);
  let inherited = $state(true);
  let hashed = $state(true);
  let rtl = $state(false);
  let mounted = $state(true);
  let railSize = $state<number>();
  let priority = $state(false);
</script>

<section id="slider-theme-fixture">
  <h2>Source Slider tokens</h2>
  <label>Slider token preset <select bind:value={preset}>
    {#each Object.keys(sliderThemePresets) as name}<option value={name}>{name}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={enabled} /> Apply source Slider tokens</label>
  <label><input type="checkbox" bind:checked={disabled} /> Disable themed Sliders</label>
  <label><input type="checkbox" bind:checked={inherited} /> Inherit child Slider tokens</label>
  <label><input type="checkbox" bind:checked={hashed} /> Hash themed Sliders</label>
  <label><input type="checkbox" bind:checked={rtl} /> Slider theme RTL</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount themed Sliders</label>
  <label><input type="checkbox" bind:checked={priority} /> Slider theme style priority</label>
  <button type="button" onclick={() => railSize = 8}>Set themed rail to eight</button>
  <SliderThemeCase {preset} {enabled} {disabled} {inherited} {hashed} {rtl} {mounted}
    {railSize} {priority} />
</section>
