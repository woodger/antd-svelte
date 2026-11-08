<script lang="ts">
  import reference from './ant-design-form-constraints-reference.json';
  import FormConstraintsCase from './FormConstraintsCase.svelte';

  let selected = $state(reference.cases[0].sample.id);
  let sample = $derived(reference.cases.find(({ sample }) => sample.id === selected)!.sample);
</script>

<section id="form-constraints-fixture" aria-label="Form length and whitespace constraints">
  <label>Constraint sample
    <select bind:value={selected}>
      {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
    </select>
  </label>
  {#key selected}<FormConstraintsCase {sample} />{/key}
</section>
