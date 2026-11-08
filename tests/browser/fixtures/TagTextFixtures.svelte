<script lang="ts">
  import reference from './ant-design-select-tag-text-reference.json';
  import TagTextCase from './TagTextCase.svelte';

  let selected = $state(reference.cases[0].sample.id as string);
  let sample = $derived((reference.cases.find(entry => entry.sample.id === selected)
    ?? reference.cases[0]).sample);
</script>

<section id="tag-text-fixture" aria-label="Select and Cascader tag text truncation">
  <label>Tag text sample
    <select bind:value={selected}>
      {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
    </select>
  </label>
  {#each [sample] as current (current.id)}<TagTextCase sample={current} />{/each}
</section>
