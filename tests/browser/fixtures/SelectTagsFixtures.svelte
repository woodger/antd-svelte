<script lang="ts">
  import interactions from './ant-design-select-tags-interaction-reference.json';
  import options from './ant-design-select-tags-options-reference.json';
  import SelectTagsCase from './SelectTagsCase.svelte';
  import type { SelectTagsSample } from './select-tags-cases';

  let { sample: initialSample }: { sample?: SelectTagsSample } = $props();
  let phase = $state<'interaction' | 'options'>('interaction');
  let selected = $state(interactions.cases[0].sample.id as string);
  let nativeChecks = $state(false);
  let missingOptions = $state(false);
  let cases = $derived(phase === 'interaction' ? interactions.cases : options.cases);
  let sample = $derived(initialSample ?? (cases.find(entry => entry.sample.id === selected)
    ?? cases[0]).sample as SelectTagsSample);
</script>

<section id="select-tags-fixture" aria-label="Select tags mode">
  <label>Tags reference phase
    <select bind:value={phase}><option>interaction</option><option>options</option></select>
  </label>
  <label>Tags sample
    <select bind:value={selected}>
      {#each cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
    </select>
  </label>
  <label><input type="checkbox" bind:checked={nativeChecks} />Native tags constraints</label>
  <label><input type="checkbox" bind:checked={missingOptions} />Missing remote tags options</label>
  {#key `${phase}:${sample.id}`}
    <SelectTagsCase {sample} {phase} {nativeChecks} {missingOptions} />
  {/key}
</section>
