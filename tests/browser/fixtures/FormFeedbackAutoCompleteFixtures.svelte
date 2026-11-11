<script lang="ts">
  import FormFeedbackAutoCompleteCase from './FormFeedbackAutoCompleteCase.svelte';
  import { feedbackAutoCompleteSamples } from './form-feedback-autocomplete-cases';
  let selected = $state(feedbackAutoCompleteSamples[0].id);
  let sample = $derived(feedbackAutoCompleteSamples.find(sample => sample.id === selected)!);
</script>
<section id="form-feedback-autocomplete-fixture">
  <label>Form feedback completion sample<select bind:value={selected}>
    {#each feedbackAutoCompleteSamples as entry}<option value={entry.id}>{entry.id}</option>{/each}
  </select></label>
  {#key selected}<FormFeedbackAutoCompleteCase {sample} />{/key}
</section>
