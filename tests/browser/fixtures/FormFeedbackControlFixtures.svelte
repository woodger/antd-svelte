<script lang="ts">
  import FormFeedbackControlCase from './FormFeedbackControlCase.svelte';
  import { feedbackControlSamples } from './form-feedback-control-cases';
  let selected = $state(feedbackControlSamples[0].id);
  let sample = $derived(feedbackControlSamples.find(entry => entry.id === selected)!);
</script>
<section id="form-feedback-control-fixture">
  <label>Form feedback control sample<select bind:value={selected}>
    {#each feedbackControlSamples as entry}<option value={entry.id}>{entry.id}</option>{/each}
  </select></label>
  {#key selected}<FormFeedbackControlCase {sample} />{/key}
</section>
