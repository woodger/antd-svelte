<script lang="ts">
  import { untrack } from 'svelte';
  import FormFeedbackCase from './FormFeedbackCase.svelte';
  import { feedbackSamples } from './form-feedback-cases';
  let { initialSample = 'status-error' }: { initialSample?: string } = $props();
  let selected = $state(untrack(() => initialSample));
  let sample = $derived(feedbackSamples.find(entry => entry.id === selected)!);
</script>
<section id="form-feedback-fixture">
  <label>Form feedback sample<select bind:value={selected}>
    {#each feedbackSamples as entry}<option value={entry.id}>{entry.id}</option>{/each}
  </select></label>
  {#key selected}<FormFeedbackCase {sample} />{/key}
</section>
