<script lang="ts">
  import reference from './ant-design-upload-semantic-reference.json';
  import UploadSemanticScope, { type UploadSemanticSample } from './UploadSemanticScope.svelte';

  let selected = $state(0);
  let live = $state(false);
  let mode = $state('default');
  let mounted = $state(true);
  let sample = $derived<UploadSemanticSample>(live ? { id: 'live', mode }
    : reference.cases[selected].sample);
</script>

<section id="upload-semantic-fixture">
  <label>Upload semantic sample<select bind:value={selected}>
    {#each reference.cases as entry, index}<option value={index}>{entry.sample.id}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={live} /> Live Upload semantics</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount Upload semantics</label>
  <label>Live Upload semantic mode<select bind:value={mode}>
    {#each ['default', 'object', 'callback', 'empty'] as value}<option value={value}>{value}</option>{/each}
  </select></label>
  <input aria-label="Upload semantic editor" value="Draft" />
  {#key live ? 'live' : selected}
    {#if mounted}<UploadSemanticScope {sample} />{/if}
  {/key}
</section>
