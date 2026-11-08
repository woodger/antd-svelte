<script lang="ts">
  import reference from './ant-design-steps-prefix-reference.json';
  import StepsConfigCase from './StepsConfigCase.svelte';
  import type { StepsConfigSample } from './steps-config-cases';

  let { sample: initialSample }: { sample?: StepsConfigSample } = $props();
  let selected = $state(reference.cases[0].sample.id);
  let transition = $state('matrix');
  let interactive = $state(false);
  let customIcon = $state(false);
  let removeFirst = $state(false);
  let sample = $derived(initialSample ?? (transition === 'matrix'
    ? reference.cases.find(({ sample }) => sample.id === selected)!.sample
    : reference.transitions.find(({ step }) => step === transition)!.sample) as StepsConfigSample);
</script>

<section id="steps-prefix-fixture" aria-label="Steps local prefix">
  <label>Steps prefix sample
    <select bind:value={selected}>
      {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
    </select>
  </label>
  <label>Steps prefix transition
    <select bind:value={transition}>
      <option value="matrix">matrix</option>
      {#each reference.transitions as { step }}<option value={step}>{step}</option>{/each}
    </select>
  </label>
  <label><input type="checkbox" bind:checked={interactive} />Interactive prefix steps</label>
  <label><input type="checkbox" bind:checked={customIcon} />Custom prefix icons</label>
  <label><input type="checkbox" bind:checked={removeFirst} />Remove first prefix step</label>
  <StepsConfigCase {sample} {interactive} {customIcon} {removeFirst} />
</section>
