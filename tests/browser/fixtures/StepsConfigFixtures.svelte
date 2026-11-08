<script lang="ts">
  import reference from './ant-design-steps-config-reference.json';
  import StepsConfigCase from './StepsConfigCase.svelte';
  import type { StepsConfigSample } from './steps-config-cases';

  let { sample: initialSample }: { sample?: StepsConfigSample } = $props();
  let selected = $state(reference.cases[0].sample.id);
  let transition = $state('matrix');
  let sample = $derived(initialSample ?? (transition === 'matrix'
    ? reference.cases.find(({ sample }) => sample.id === selected)!.sample
    : reference.transitions.find(({ step }) => step === transition)!.sample) as StepsConfigSample);
</script>

<section id="steps-config-fixture" aria-label="Steps component config">
  <label>Steps config sample
    <select bind:value={selected}>
      {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
    </select>
  </label>
  <label>Steps config transition
    <select bind:value={transition}>
      <option value="matrix">matrix</option>
      {#each reference.transitions as { step }}<option value={step}>{step}</option>{/each}
    </select>
  </label>
  <StepsConfigCase {sample} />
</section>
