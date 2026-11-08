<script lang="ts">
  import reference from './ant-design-form-validate-messages-reference.json';
  import FormValidateMessagesCase from './FormValidateMessagesCase.svelte';
  import FormValidateMessagesScopes from './FormValidateMessagesScopes.svelte';
  import FormValidateMessagesLifecycle from './FormValidateMessagesLifecycle.svelte';
  import type { FormValidateMessagesSample } from './form-validate-messages-cases';

  let selected = $state(reference.cases[0].sample.id);
  let showScopes = $state(false);
  let sample = $derived(
    reference.cases.find(({ sample }) => sample.id === selected)!.sample as FormValidateMessagesSample
  );
</script>

<section id="form-validate-messages-fixture" aria-label="Form validation templates">
  <label>Template sample
    <select bind:value={selected}>
      {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
    </select>
  </label>
  {#key selected}<FormValidateMessagesCase {sample} />{/key}
  <label><input type="checkbox" bind:checked={showScopes} />Show template scopes</label>
  {#if showScopes}
    <FormValidateMessagesScopes />
    <FormValidateMessagesLifecycle />
  {/if}
</section>
