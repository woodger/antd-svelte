<script lang="ts">
  import reference from './ant-design-upload-paste-reference.json';
  import UploadPasteScope, { type UploadPasteSample } from './UploadPasteScope.svelte';

  let selected = $state(0);
  let live = $state(false);
  let enabled = $state(false);
  let disabled = $state(false);
  let dragger = $state(false);
  let mounted = $state(true);
  let manual = $state(true);
  let sample = $derived<UploadPasteSample>(live
    ? { id: 'live', pastable: enabled, disabled } : reference.cases[selected].sample);
</script>

<section id="upload-paste-fixture">
  <label>Upload paste sample<select bind:value={selected}>
    {#each reference.cases as entry, index}<option value={index}>{entry.sample.id}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={live} /> Live pastable Upload</label>
  <label><input type="checkbox" bind:checked={enabled} /> Enable file paste</label>
  <label><input type="checkbox" bind:checked={disabled} /> Disable pastable Upload</label>
  <label><input type="checkbox" bind:checked={dragger} /> Paste through Dragger</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount pastable Upload</label>
  <label><input type="checkbox" bind:checked={manual} /> Manual paste Upload</label>
  <textarea aria-label="Outside Upload editor"></textarea>
  {#key live ? 'live' : selected}
    {#if mounted}<UploadPasteScope {sample} {dragger} {manual} />{/if}
  {/key}
</section>
