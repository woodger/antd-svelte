<script lang="ts">
  import reference from './ant-design-upload-ref-reference.json';
  import UploadRefScope from './UploadRefScope.svelte';

  let selected = $state(0);
</script>

<section id="upload-ref-fixture">
  <label>Upload ref sample<select bind:value={selected}>
    {#each reference.cases as entry, index}
      <option value={index}>{entry.sample.id}</option>
    {/each}
  </select></label>
  {#key selected}<UploadRefScope sample={reference.cases[selected].sample} />{/key}
</section>
