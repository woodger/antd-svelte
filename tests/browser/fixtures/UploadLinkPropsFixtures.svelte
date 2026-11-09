<script lang="ts">
  import reference from './ant-design-upload-link-props-reference.json';
  import UploadLinkPropsScope, { type UploadLinkSample } from './UploadLinkPropsScope.svelte';

  let selected = $state(0);
  let live = $state(false);
  let mode = $state('default');
  let mounted = $state(true);
  let sample = $derived<UploadLinkSample>(live ? { id: 'live', mode }
    : reference.cases[selected].sample);
</script>

<section id="upload-link-props-fixture">
  <label>Upload link sample<select bind:value={selected}>
    {#each reference.cases as entry, index}<option value={index}>{entry.sample.id}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={live} /> Live Upload link props</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount Upload link props</label>
  <label>Live Upload link mode<select bind:value={mode}>
    {#each ['default', 'attributes', 'json', 'class'] as value}<option value={value}>{value}</option>{/each}
  </select></label>
  <input aria-label="Upload link editor" value="Draft" />
  {#key live ? 'live' : selected}
    {#if mounted}<UploadLinkPropsScope {sample} />{/if}
  {/key}
</section>
