<script lang="ts">
  import reference from './ant-design-select-tag-count-reference.json';
  import SelectTagCountCase from './SelectTagCountCase.svelte';

  const cases = reference.cases.filter(entry => entry.sample.count !== 'responsive');
  let selected = $state(cases[0].sample.id as string);
  let sample = $derived((cases.find(entry => entry.sample.id === selected) ?? cases[0]).sample);
</script>

<section id="tag-count-fixture" aria-label="Select numeric visible tags">
  <label>Tag count sample
    <select bind:value={selected}>
      {#each cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
    </select>
  </label>
  {#each [sample] as current (current.id)}<SelectTagCountCase sample={current} />{/each}
</section>
