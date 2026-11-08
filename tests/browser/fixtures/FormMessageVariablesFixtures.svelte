<script lang="ts">
  import reference from './ant-design-form-message-variables-reference.json';
  import FormMessageVariablesCase from './FormMessageVariablesCase.svelte';
  import type { FormMessageVariablesSample } from './form-message-variables-cases';

  let selected = $state(reference.cases[0].sample.id);
  let sample = $derived(
    reference.cases.find(({ sample }) => sample.id === selected)!.sample as FormMessageVariablesSample
  );
</script>

<section id="form-message-variables-fixture" aria-label="Form message variables">
  <label>Message variable sample
    <select bind:value={selected}>
      {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
    </select>
  </label>
  {#key selected}<FormMessageVariablesCase {sample} />{/key}
</section>
