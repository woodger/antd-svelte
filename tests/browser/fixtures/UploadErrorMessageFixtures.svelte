<script lang="ts">
  import reference from './ant-design-upload-error-message-reference.json';
  import UploadErrorMessageScope, { type UploadErrorSample } from './UploadErrorMessageScope.svelte';

  let selected = $state(0);
  let live = $state(false);
  let step = $state(0);
  let sample = $derived<UploadErrorSample>(live
    ? { ...reference.transitions[step].sample, id: 'live' } : reference.cases[selected].sample);
</script>

<section id="upload-error-message-fixture">
  <label>Upload error sample<select bind:value={selected}>
    {#each reference.cases as entry, index}<option value={index}>{entry.sample.id}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={live} /> Live Upload error message</label>
  <label>Live Upload error step<select bind:value={step}>
    {#each reference.transitions as entry, index}<option value={index}>{entry.sample.id}</option>{/each}
  </select></label>
  {#key live ? 'live' : selected}<UploadErrorMessageScope {sample} />{/key}
</section>
