<script lang="ts">
  import reference from './ant-design-form-rule-types-reference.json';
  import FormRuleTypesCase from './FormRuleTypesCase.svelte';

  let selected = $state('string-string');
  let sample = $derived(reference.cases.find(({ sample }) => sample.id === selected)!.sample);
</script>

<section id="form-rule-types-fixture" aria-label="Form primitive rule types">
  <label>Rule type sample
    <select bind:value={selected}>
      {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
    </select>
  </label>
  {#key selected}<FormRuleTypesCase {sample} />{/key}
</section>
