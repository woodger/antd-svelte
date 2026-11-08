<script lang="ts">
  import reference from './ant-design-form-nested-rules-reference.json';
  import FormNestedRulesCase from './FormNestedRulesCase.svelte';

  let selected = $state(reference.cases[0].sample.id);
  let sample = $derived(reference.cases.find(({ sample }) => sample.id === selected)!.sample);
</script>

<section id="form-nested-rules-fixture" aria-label="Form nested validation rules">
  <label>Nested rule sample
    <select bind:value={selected}>
      {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
    </select>
  </label>
  {#key selected}<FormNestedRulesCase {sample} />{/key}
</section>
