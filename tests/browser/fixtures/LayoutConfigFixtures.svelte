<script lang="ts">
  import reference from './ant-design-layout-config-reference.json';
  import LayoutConfigCase from './LayoutConfigCase.svelte';
  import type { LayoutConfigSample } from './layout-config-cases';

  let { sample: initialSample }: { sample?: LayoutConfigSample } = $props();
  let selected = $state(reference.cases[0].sample.id);
  let transition = $state('matrix');
  let interactive = $state(false);
  let updated = $state(false);
  let selectedSample = $derived(initialSample ?? (transition === 'matrix'
    ? reference.cases.find(({ sample }) => sample.id === selected)!.sample
    : reference.transitions.find(({ step }) => step === transition)!.sample) as LayoutConfigSample);
  let sample = $derived(updated ? {
    ...selectedSample,
    context: { className: 'ctx-updated', style: { padding: 12, color: '#112233' } }
  } : selectedSample);
</script>

<section id="layout-config-fixture" aria-label="Layout component config">
  <label>Layout config sample
    <select bind:value={selected}>
      {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
    </select>
  </label>
  <label>Layout config transition
    <select bind:value={transition}>
      <option value="matrix">matrix</option>
      {#each reference.transitions as { step }}<option value={step}>{step}</option>{/each}
    </select>
  </label>
  <label><input type="checkbox" bind:checked={interactive} />Interactive Layout config</label>
  <button type="button" onclick={() => { updated = !updated; }}>Update Layout config record</button>
  <LayoutConfigCase {sample} {interactive} />
</section>
