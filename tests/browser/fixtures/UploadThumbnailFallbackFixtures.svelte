<script lang="ts">
  import reference from './ant-design-upload-thumbnail-fallback-reference.json';
  import UploadThumbnailFallbackScope, {
    type UploadThumbnailSample
  } from './UploadThumbnailFallbackScope.svelte';

  let selected = $state(0);
  let live = $state(false);
  let mode = $state('url-only');
  let sample = $derived<UploadThumbnailSample>(
    live ? { id: 'live', mode } : reference.cases[selected].sample
  );
</script>

<section id="upload-thumbnail-fallback-fixture">
  <label>
    Upload thumbnail sample<select bind:value={selected}>
      {#each reference.cases as entry, index}
        <option value={index}>{entry.sample.id}</option>
      {/each}
    </select>
  </label>
  <label><input type="checkbox" bind:checked={live} /> Live Upload thumbnail fallback</label>
  <label>
    Live Upload thumbnail mode<select bind:value={mode}>
      {#each ['url-only', 'empty-thumb', 'thumb-and-url', 'empty-no-url'] as value}
        <option {value}>{value}</option>
      {/each}
    </select>
  </label>
  <input aria-label="Upload thumbnail editor" value="Draft" />
  {#key live ? 'live' : selected}
    <UploadThumbnailFallbackScope {sample} />
  {/key}
</section>
