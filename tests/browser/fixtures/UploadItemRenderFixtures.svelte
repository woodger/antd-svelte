<script lang="ts">
  import reference from './ant-design-upload-item-render-reference.json';
  import UploadItemRenderScope, { type UploadItemSample } from './UploadItemRenderScope.svelte';

  let selected = $state(0);
  let live = $state(false);
  let mode = $state('wrap');
  let mounted = $state(true);
  let disabled = $state(false);
  let reversed = $state(false);
  let sample = $derived<UploadItemSample>(live ? { id: 'live', mode, disabled, reversed }
    : reference.cases[selected].sample);
</script>

<section id="upload-item-render-fixture">
  <label>Upload item sample<select bind:value={selected}>
    {#each reference.cases as entry, index}<option value={index}>{entry.sample.id}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={live} /> Live Upload item renderer</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount Upload item renderer</label>
  <label><input type="checkbox" bind:checked={disabled} /> Disable item renderer Upload</label>
  <label><input type="checkbox" bind:checked={reversed} /> Reverse item renderer files</label>
  <label>Live Upload item mode<select bind:value={mode}>
    {#each ['wrap', 'replace', 'empty', 'default'] as value}<option value={value}>{value}</option>{/each}
  </select></label>
  <input aria-label="Upload item editor" value="Draft" />
  {#key live ? 'live' : selected}
    {#if mounted}<UploadItemRenderScope {sample} />{/if}
  {/key}
</section>
