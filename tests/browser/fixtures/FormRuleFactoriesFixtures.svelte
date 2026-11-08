<script lang="ts">
  import { untrack } from 'svelte';
  import reference from './ant-design-form-rule-factories-reference.json';
  import FormRuleFactoriesCase from './FormRuleFactoriesCase.svelte';

  let { initialCase = 'required-enabled' }: { initialCase?: string } = $props();
  let selected = $state(untrack(() => initialCase));
  const cases = reference.cases.filter(entry => entry.phase === 'initial');
  let sample = $derived(cases.find(({ sample }) => sample.id === selected)!.sample);
</script>

<section id="form-rule-factories-fixture" aria-label="Form rule factories">
  <label>Rule factory sample
    <select bind:value={selected}>
      {#each cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
    </select>
  </label>
  {#key selected}<FormRuleFactoriesCase {sample} />{/key}
</section>
