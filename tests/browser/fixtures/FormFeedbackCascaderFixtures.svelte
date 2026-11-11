<script lang="ts">
  import { untrack } from 'svelte';
  import FormFeedbackCascaderCase from './FormFeedbackCascaderCase.svelte';
  import { feedbackCascaderSamples } from './form-feedback-cascader-cases';
  let { initialSample = 'status-error' }: { initialSample?: string } = $props();
  let selected = $state(untrack(() => initialSample));
  let sample = $derived(feedbackCascaderSamples.find(entry => entry.id === selected)!);
</script>
<section id="form-feedback-cascader-fixture">
  <label>Cascader feedback sample<select bind:value={selected}>
    {#each feedbackCascaderSamples as entry}<option value={entry.id}>{entry.id}</option>{/each}
  </select></label>
  {#key selected}<FormFeedbackCascaderCase {sample} />{/key}
</section>
