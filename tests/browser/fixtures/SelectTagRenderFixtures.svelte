<script lang="ts">
  import reference from './ant-design-select-tag-render-reference.json';
  import SelectTagRenderCase from './SelectTagRenderCase.svelte';

  let selected = $state(reference.cases[0].sample.id as string);
  let sample = $derived((reference.cases.find(entry => entry.sample.id === selected)
    ?? reference.cases[0]).sample);
</script>

<section id="tag-render-fixture" aria-label="Select custom tag renderer">
  <label>Tag renderer sample
    <select bind:value={selected}>
      {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
    </select>
  </label>
  {#each [sample] as current (current.id)}<SelectTagRenderCase sample={current} />{/each}
</section>
