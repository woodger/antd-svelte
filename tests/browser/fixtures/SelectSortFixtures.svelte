<script lang="ts">
  import reference from './ant-design-select-sort-reference.json';
  import SelectSortCase from './SelectSortCase.svelte';

  let selected = $state(reference.cases[0].sample.id as string);
  let sample = $derived((reference.cases.find(entry => entry.sample.id === selected)
    ?? reference.cases[0]).sample);
</script>

<section id="select-sort-fixture" aria-label="Select option sorting">
  <label>Sort sample
    <select bind:value={selected}>
      {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
    </select>
  </label>
  {#each [sample] as current (current.id)}<SelectSortCase sample={current} />{/each}
</section>
