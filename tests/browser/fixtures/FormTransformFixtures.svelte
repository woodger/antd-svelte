<script lang="ts">
  import reference from './ant-design-form-transform-reference.json';
  import FormTransformCase from './FormTransformCase.svelte';

  let selected = $state(reference.cases[0].sample.id);
  let sample = $derived(reference.cases.find(({ sample }) => sample.id === selected)!.sample);
</script>

<section id="form-transform-fixture" aria-label="Form transforms">
  <label>Transform sample
    <select bind:value={selected}>
      {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
    </select>
  </label>
  {#key selected}<FormTransformCase {sample} />{/key}
</section>
