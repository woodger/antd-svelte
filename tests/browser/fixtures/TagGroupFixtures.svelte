<script lang="ts">
  import TagGroupCase from './TagGroupCase.svelte';
  import reference from './ant-design-tag-group-reference.json';
  import type { TagGroupCase as Sample } from './tag-group-presets';

  let name = $state(reference.cases[0].name);
  let changed = $state(false);
  let sample = $derived(reference.cases.find(sample => sample.name === name)! as Sample);
</script>

<section id="tag-group-fixture">
  <h2>CheckableTagGroup source API</h2>
  <label>Tag group reference <select bind:value={name} onchange={() => changed = false}>
    {#each reference.cases as sample}<option value={sample.name}>{sample.name}</option>{/each}
  </select></label>
  <button type="button" onclick={() => changed = !changed}>Change tag group props</button>
  {#key name}<TagGroupCase {sample} {changed} />{/key}
</section>
