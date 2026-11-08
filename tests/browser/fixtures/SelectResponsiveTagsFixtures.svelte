<script lang="ts">
  import reference from './ant-design-select-responsive-tags-reference.json';
  import SelectTagCountCase from './SelectTagCountCase.svelte';

  let selected = $state(reference.cases[0].sample.id as string);
  let sample = $derived((reference.cases.find(entry => entry.sample.id === selected)
    ?? reference.cases[0]).sample);
</script>

<section id="responsive-tags-fixture" aria-label="Select responsive visible tags">
  <label>Responsive tags sample
    <select bind:value={selected}>
      {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
    </select>
  </label>
  {#each [sample] as current (current.id)}<SelectTagCountCase sample={current} />{/each}
</section>
