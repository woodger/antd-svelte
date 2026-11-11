<script lang="ts">
  import FormFeedbackMentionsCase from './FormFeedbackMentionsCase.svelte';
  import { mentionsFeedbackSamples } from './form-feedback-mentions-cases';
  let selected = $state(mentionsFeedbackSamples[0].id);
  let sample = $derived(mentionsFeedbackSamples.find(entry => entry.id === selected)!);
</script>
<section id="form-feedback-mentions-fixture">
  <label>Form feedback mentions sample<select bind:value={selected}>
    {#each mentionsFeedbackSamples as entry}<option value={entry.id}>{entry.id}</option>{/each}
  </select></label>
  {#key selected}<FormFeedbackMentionsCase {sample} />{/key}
</section>
