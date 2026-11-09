<script lang="ts">
  import reference from './ant-design-upload-icon-render-reference.json';
  import UploadIconRenderScope, { type UploadIconSample } from './UploadIconRenderScope.svelte';

  let selected = $state(0);
  let live = $state(false);
  let mode = $state('custom');
  let mounted = $state(true);
  let sample = $derived<UploadIconSample>(live ? { id: 'live', mode } : reference.cases[selected].sample);
</script>

<section id="upload-icon-render-fixture">
  <label>Upload icon sample<select bind:value={selected}>
    {#each reference.cases as entry, index}<option value={index}>{entry.sample.id}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={live} /> Live Upload icon renderer</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount Upload icon renderer</label>
  <label>Live Upload icon mode<select bind:value={mode}>
    {#each ['custom', 'empty', 'default'] as value}<option value={value}>{value}</option>{/each}
  </select></label>
  <input aria-label="Upload icon editor" value="Draft" />
  {#key live ? 'live' : selected}
    {#if mounted}<UploadIconRenderScope {sample} />{/if}
  {/key}
</section>
