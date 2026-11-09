<script lang="ts">
  import reference from './ant-design-upload-progress-motion-reference.json';
  import UploadProgressMotionScope from './UploadProgressMotionScope.svelte';

  let selected = $state(0);
  let paired = $state(false);
</script>

<section id="upload-progress-motion-fixture">
  <label>
    Upload progress motion sample<select bind:value={selected}>
      {#each reference.cases as entry, index}
        <option value={index}>{entry.sample.id}</option>
      {/each}
    </select>
  </label>
  <label><input type="checkbox" bind:checked={paired} /> Paired progress scopes</label>
  {#if paired}
    <section data-progress-scope="acme"><UploadProgressMotionScope sample={{
      id: 'acme', prefix: 'acme', localPrefix: 'files', componentDuration: '0.45s'
    }} /></section>
    <section data-progress-scope="beta"><UploadProgressMotionScope sample={{
      id: 'beta', prefix: 'beta', localPrefix: 'files', componentDuration: '0.7s'
    }} /></section>
  {:else}
    {#key selected}
      <UploadProgressMotionScope sample={reference.cases[selected].sample} />
    {/key}
  {/if}
</section>
