<script lang="ts">
  import CheckableTagApiCase from './CheckableTagApiCase.svelte';
  import reference from './ant-design-checkable-tag-api-reference.json';
  import type { CheckableTagApiCase as Sample } from './checkable-tag-api-presets';

  let name = $state(reference.cases[0].name);
  let aliases = $state(false);
  let localRtl = $state(false);
  let sample = $derived(reference.cases.find(sample => sample.name === name)! as Sample);
</script>

<section id="checkable-tag-api-fixture">
  <h2>CheckableTag callbacks and DOM</h2>
  <label>CheckableTag reference <select bind:value={name}>
    {#each reference.cases as sample}<option value={sample.name}>{sample.name}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={aliases} /> Native CheckableTag callbacks</label>
  <label><input type="checkbox" bind:checked={localRtl} /> Local CheckableTag RTL</label>
  {#key name}<CheckableTagApiCase {sample} {aliases} direction={localRtl ? 'rtl' : undefined} />{/key}
</section>
