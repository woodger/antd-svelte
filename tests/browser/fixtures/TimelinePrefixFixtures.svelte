<script lang="ts">
  import reference from './ant-design-timeline-prefix-reference.json';
  import TimelineConfigCase from './TimelineConfigCase.svelte';
  import type { TimelineConfigSample } from './timeline-config-cases';

  let { sample: initialSample }: { sample?: TimelineConfigSample } = $props();
  let selected = $state(reference.cases[0].sample.id);
  let transition = $state('matrix');
  let sample = $derived(initialSample ?? (transition === 'matrix'
    ? reference.cases.find(({ sample }) => sample.id === selected)!.sample
    : reference.transitions.find(({ step }) => step === transition)!.sample) as TimelineConfigSample);
</script>

<section id="timeline-prefix-fixture" aria-label="Timeline local prefix">
  <label>Timeline prefix sample
    <select bind:value={selected}>
      {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
    </select>
  </label>
  <label>Timeline prefix transition
    <select bind:value={transition}>
      <option value="matrix">matrix</option>
      {#each reference.transitions as { step }}<option value={step}>{step}</option>{/each}
    </select>
  </label>
  <TimelineConfigCase {sample} />
</section>
