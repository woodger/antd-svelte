<script lang="ts">
  import TagCloseCase from './TagCloseCase.svelte';
  import reference from './ant-design-tag-close-reference.json';
  import type { TagCloseCase as Sample } from './tag-close-presets';

  let name = $state(reference.cases[0].name);
  let changed = $state(false);
  let mounted = $state(true);
  let closeLabel = $state('');
  let focusable = $state(false);
  let sample = $derived(reference.cases.find(sample => sample.name === name)! as Sample);
</script>

<section id="tag-close-fixture">
  <h2>Tag links and closable API</h2>
  <label>Tag close reference <select bind:value={name} onchange={() => {
    changed = false;
    mounted = true;
    closeLabel = '';
  }}>
    {#each reference.cases as sample}<option value={sample.name}>{sample.name}</option>{/each}
  </select></label>
  <label>Tag native close label <input bind:value={closeLabel} /></label>
  <label><input type="checkbox" bind:checked={focusable} /> Focusable Tag root</label>
  <input aria-label="Tag close outside input" value="Outside draft" />
  <button type="button" onclick={() => changed = !changed}>Change close API props</button>
  <button type="button" onclick={() => mounted = !mounted}>Toggle close API Tag</button>
  {#if mounted}{#key name}<TagCloseCase {sample} {changed} {focusable} closeLabel={closeLabel || undefined} />{/key}{/if}
  <div id="tag-close-destination">Tag link destination</div>
  <a href="#outside-tag-reset">Outside Tag link</a>
</section>
