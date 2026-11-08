<script lang="ts">
  import reference from './ant-design-layout-section-prefix-reference.json';
  import LayoutSectionPrefixCase from './LayoutSectionPrefixCase.svelte';
  import type { LayoutSectionPrefixSample } from './layout-section-prefix-cases';

  let { sample: initialSample }: { sample?: LayoutSectionPrefixSample } = $props();
  let selected = $state(reference.cases[0].sample.id);
  let enabled = $state(true);
  let interactive = $state(false);
  let legacy = $state(false);
  let sample = $derived(initialSample ?? reference.cases.find(({ sample }) => sample.id === selected)!
    .sample as LayoutSectionPrefixSample);
</script>

<section id="layout-section-prefix-fixture" aria-label="Layout section local prefixes">
  <label>Layout section prefix sample
    <select bind:value={selected}>
      {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
    </select>
  </label>
  <label><input type="checkbox" bind:checked={enabled} />Use section prefixes</label>
  <label><input type="checkbox" bind:checked={interactive} />Interactive Layout sections</label>
  <label><input type="checkbox" bind:checked={legacy} />Legacy dark compact sections</label>
  <LayoutSectionPrefixCase {sample} {enabled} {interactive} {legacy} />
</section>
