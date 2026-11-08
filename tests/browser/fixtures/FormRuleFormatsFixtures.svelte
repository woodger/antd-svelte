<script lang="ts">
  import reference from './ant-design-form-rule-formats-reference.json';
  import FormRuleFormatsCase from './FormRuleFormatsCase.svelte';

  let selected = $state('email-format-0');
  let sample = $derived(reference.cases.find(({ sample }) => sample.id === selected)!.sample);
</script>

<section id="form-rule-formats-fixture" aria-label="Form format rules">
  <label>Rule format sample
    <select bind:value={selected}>
      {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
    </select>
  </label>
  {#key selected}<FormRuleFormatsCase {sample} />{/key}
</section>
