<script lang="ts">
  import structure from './ant-design-upload-trigger-structure-reference.json';
  import motion from './ant-design-upload-trigger-motion-reference.json';
  import UploadTriggerScope, { type UploadTriggerSample } from './UploadTriggerScope.svelte';

  let selected = $state('structure:0');
  let animated = $derived(selected.startsWith('motion:'));
  let index = $derived(Number(selected.split(':')[1]));
  let sample = $derived<UploadTriggerSample>(
    animated ? motion.cases[index].sample : structure.cases[index].sample
  );
</script>

<section id="upload-trigger-fixture">
  <label>
    Upload trigger sample<select bind:value={selected}>
      {#each structure.cases as entry, index}
        <option value={`structure:${index}`}>{entry.sample.id}</option>
      {/each}
      {#each motion.cases as entry, index}
        <option value={`motion:${index}`}>motion:{entry.sample.id}</option>
      {/each}
    </select>
  </label>
  {#key selected}<UploadTriggerScope {sample} {animated} />{/key}
</section>
