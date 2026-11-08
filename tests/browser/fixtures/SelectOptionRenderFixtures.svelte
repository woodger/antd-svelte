<script lang="ts">
  import reference from './ant-design-select-option-render-reference.json';
  import SelectOptionRenderCase, {
    type SelectOptionRenderSample
  } from './SelectOptionRenderCase.svelte';

  let selected = $state(reference.cases[0].sample.id as string);
  let sample = $derived((reference.cases.find(entry => entry.sample.id === selected)
    ?? reference.cases[0]).sample as SelectOptionRenderSample);
</script>

<section id="select-option-render-fixture" aria-label="Select option renderer">
  <label>Option renderer sample <select bind:value={selected}>
    {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
  </select></label>
  {#each [sample] as current (current.id)}<SelectOptionRenderCase sample={current} />{/each}
</section>
