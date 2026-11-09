<script lang="ts">
  import reference from './ant-design-upload-action-icons-reference.json';
  import UploadActionIconsScope, { type UploadActionSample } from './UploadActionIconsScope.svelte';

  let selected = $state(0);
  let live = $state(false);
  let mode = $state('custom');
  let disabled = $state(false);
  let mounted = $state(true);
  let sample = $derived<UploadActionSample>(live
    ? { id: 'live', mode, listType: 'picture-card', disabled, forceRemove: true }
    : reference.cases[selected].sample);
</script>

<section id="upload-action-icons-fixture">
  <label>Upload action sample<select bind:value={selected}>
    {#each reference.cases as entry, index}<option value={index}>{entry.sample.id}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={live} /> Live Upload action icons</label>
  <label><input type="checkbox" bind:checked={disabled} /> Disable Upload action icons</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount Upload action icons</label>
  <label>Live Upload action mode<select bind:value={mode}>
    {#each ['custom', 'empty', 'zero', 'default'] as value}<option value={value}>{value}</option>{/each}
  </select></label>
  <input aria-label="Upload action editor" value="Draft" />
  {#key live ? 'live' : selected}
    {#if mounted}<UploadActionIconsScope {sample} />{/if}
  {/key}
</section>
