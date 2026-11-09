<script lang="ts">
  import reference from './ant-design-upload-directory-reference.json';
  import UploadDirectoryScope, { type UploadDirectorySample } from './UploadDirectoryScope.svelte';

  let selected = $state(0);
  let live = $state(false);
  let directory = $state(true);
  let mounted = $state(true);
  let dragger = $state(false);
  let disabled = $state(false);
  let observed = $state<string[]>([]);
  let sample = $derived<UploadDirectorySample>(live ? {
    id: 'live', directory, paste: true
  } : reference.cases[selected].sample);
</script>

<section id="upload-directory-fixture">
  <label>Upload directory sample<select bind:value={selected}>
    {#each reference.cases as entry, index}<option value={index}>{entry.sample.id}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={live} /> Live directory Upload</label>
  <label><input type="checkbox" bind:checked={directory} /> Enable directory</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount directory Upload</label>
  <label><input type="checkbox" bind:checked={dragger} /> Directory Dragger</label>
  <label><input type="checkbox" bind:checked={disabled} /> Disable directory Upload</label>
  {#key live ? 'live' : selected}
    {#if mounted}<UploadDirectoryScope {sample} {dragger} {disabled}
      onBefore={name => observed.push(name)} />{/if}
  {/key}
  <output aria-label="Directory observed">{JSON.stringify(observed)}</output>
</section>
