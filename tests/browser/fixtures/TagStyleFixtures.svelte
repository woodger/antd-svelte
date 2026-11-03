<script lang="ts">
  import TagStyleCase from './TagStyleCase.svelte';
  import reference from './ant-design-tag-style-reference.json';
  import type { TagStyleCase as Sample } from './tag-style-presets';

  let name = $state(reference.cases[0].name);
  let changed = $state(false);
  let mounted = $state(true);
  let sample = $derived(reference.cases.find(sample => sample.name === name)! as Sample);
</script>

<section id="tag-style-fixture">
  <h2>Tag colors and semantic styles</h2>
  <label>Tag style reference <select bind:value={name} onchange={() => {
    changed = false;
    mounted = true;
  }}>
    {#each reference.cases as sample}<option value={sample.name}>{sample.name}</option>{/each}
  </select></label>
  <input aria-label="Tag style outside input" value="Outside draft" />
  <button type="button" onclick={() => changed = !changed}>Change Tag styles</button>
  <button type="button" onclick={() => mounted = !mounted}>Toggle styled Tag</button>
  {#if mounted}{#key name}<TagStyleCase {sample} {changed} />{/key}{/if}
</section>
