<script lang="ts">
  import FormFeedbackPickerCase from './FormFeedbackPickerCase.svelte';
  import { feedbackPickerSamples } from './form-feedback-picker-cases';
  let selected = $state(feedbackPickerSamples[0].id);
  let sample = $derived(feedbackPickerSamples.find(entry => entry.id === selected)!);
</script>
<section id="form-feedback-picker-fixture">
  <label>Form feedback picker sample<select bind:value={selected}>
    {#each feedbackPickerSamples as entry}<option value={entry.id}>{entry.id}</option>{/each}
  </select></label>
  {#key selected}<FormFeedbackPickerCase {sample} />{/key}
</section>
