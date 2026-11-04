<script lang="ts">
  import SliderScalarCase from './SliderScalarCase.svelte';
  import { sliderScalarCases } from './slider-scalar-cases';

  let preset = $state('mark-only');
  let alternate = $state(false);
  let disabled = $state(false);
  let mounted = $state(true);
  let cancelKeys = $state(false);
  let styled = $state(false);
</script>

<section id="slider-scalar-fixture">
  <h2>Scalar Slider source API</h2>
  <label>Scalar preset <select bind:value={preset}>
    {#each sliderScalarCases as sample}<option value={sample.name}>{sample.name}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={alternate} /> Use alternate scalar marks</label>
  <label><input type="checkbox" bind:checked={disabled} /> Disable scalar</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount scalar</label>
  <label><input type="checkbox" bind:checked={cancelKeys} /> Cancel scalar keys</label>
  <label><input type="checkbox" bind:checked={styled} /> Override scalar styles</label>
  {#key preset}<SliderScalarCase {preset} {alternate} {disabled} {mounted} {cancelKeys}
    {styled} />{/key}
</section>
