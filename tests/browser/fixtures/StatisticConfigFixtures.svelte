<script lang="ts">
  import reference from './ant-design-statistic-config-reference.json';
  import StatisticConfigCase from './StatisticConfigCase.svelte';
  import type { StatisticConfigSample } from './statistic-config-cases';

  let selected = $state(reference.cases[0].sample.id);
  let transition = $state('matrix');
  let { sample: initialSample }: { sample?: StatisticConfigSample } = $props();
  let sample = $derived(initialSample ?? (transition === 'matrix'
    ? reference.cases.find(({ sample }) => sample.id === selected)!.sample
    : reference.transitions.find(({ step }) => step === transition)!.sample) as StatisticConfigSample);
</script>

<section id="statistic-config-fixture" aria-label="Statistic component config">
  <label>Statistic config sample
    <select bind:value={selected}>
      {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
    </select>
  </label>
  <label>Statistic config transition
    <select bind:value={transition}>
      <option value="matrix">matrix</option>
      {#each reference.transitions as { step }}<option value={step}>{step}</option>{/each}
    </select>
  </label>
  <StatisticConfigCase {sample} />
</section>
