<script lang="ts">
  import SliderPrefixCase from './SliderPrefixCase.svelte';
  import { sliderPrefixCases } from './slider-prefix-cases';

  let preset = $state('tenant-single');
  let mounted = $state(true);
  let portal = $state(false);
  let styled = $state(false);
</script>

<section id="slider-prefix-fixture">
  <h2>Slider prefixes</h2>
  <label>Slider prefix preset <select bind:value={preset}>
    {#each sliderPrefixCases as sample}<option value={sample.name}>{sample.name}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount prefix slider</label>
  <label><input type="checkbox" bind:checked={portal} /> Portal prefix tooltips</label>
  <label><input type="checkbox" bind:checked={styled} /> Override prefix rail</label>
  {#key preset}<SliderPrefixCase {preset} {mounted} {portal} {styled} />{/key}
</section>
