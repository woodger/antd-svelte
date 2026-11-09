<script lang="ts">
  import reference from './ant-design-upload-progress-reference.json';
  import UploadProgressScope, { type UploadProgressSample } from './UploadProgressScope.svelte';

  let selected = $state(0);
  let live = $state(false);
  let mode = $state('default');
  let mounted = $state(true);
  let uploading = $state(true);
  let percent = $state(42);
  let sample = $derived<UploadProgressSample>(live ? { id: 'live', mode, uploading, percent }
    : reference.cases[selected].sample);
</script>

<section id="upload-progress-fixture">
  <label>Upload progress sample<select bind:value={selected}>
    {#each reference.cases as entry, index}<option value={index}>{entry.sample.id}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={live} /> Live Upload progress</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount Upload progress</label>
  <label><input type="checkbox" bind:checked={uploading} /> Uploading progress file</label>
  <label>Live Upload progress mode<select bind:value={mode}>
    {#each reference.cases.slice(0, 13) as entry}<option value={entry.sample.mode}>{entry.sample.mode}</option>{/each}
  </select></label>
  <label>Upload progress value<input type="number" bind:value={percent} /></label>
  <input aria-label="Upload progress editor" value="Draft" />
  {#key live ? 'live' : selected}
    {#if mounted}<UploadProgressScope {sample} />{/if}
  {/key}
</section>
