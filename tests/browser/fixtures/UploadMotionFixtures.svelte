<script lang="ts">
  import reference from './ant-design-upload-motion-reference.json';
  import UploadMotionScope from './UploadMotionScope.svelte';

  let selected = $state(0);
</script>

<section id="upload-motion-fixture">
  <label>
    Upload motion sample<select bind:value={selected}>
      {#each reference.cases as entry, index}
        <option value={index}>{entry.sample.id}</option>
      {/each}
    </select>
  </label>
  {#key selected}
    <UploadMotionScope sample={reference.cases[selected].sample} />
  {/key}
</section>
