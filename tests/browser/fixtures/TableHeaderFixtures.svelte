<script lang="ts">
  import reference from './ant-design-table-header-reference.json';
  import TableHeaderCase from './TableHeaderCase.svelte';

  let preset = $state('component-tokens');
  let mode = $state('default');
  let visibility = $state('preset');
  let rtl = $state(false);
  let mounted = $state(true);
  let replacement = $state(false);
  let empty = $state(false);
  let sample = $derived(reference.cases.find(item => item.name === preset)!);
</script>

<section id="table-header-fixture">
  <h2>Table header visibility</h2>
  <select aria-label="Table header theme" bind:value={preset}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select>
  <select aria-label="Table header mode" bind:value={mode}>
    {#each [
      'default', 'explicit', 'hidden', 'hidden-bordered', 'hidden-title',
      'hidden-title-bordered', 'hidden-empty-title', 'hidden-empty', 'stateful'
    ] as value}<option value={value}>{value}</option>{/each}
  </select>
  <select aria-label="Table header visibility" bind:value={visibility}>
    {#each ['preset', 'shown', 'hidden'] as value}<option value={value}>{value}</option>{/each}
  </select>
  <label><input type="checkbox" bind:checked={rtl} /> Right to left header table</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount header table</label>
  <button type="button" onclick={() => { replacement = true; }}>Replace header table rows</button>
  <button type="button" onclick={() => { empty = !empty; }}>Toggle empty header table</button>
  {#if mounted}
    {#key `${preset}:${mode}`}<TableHeaderCase {sample} {mode} {visibility} {rtl}
      {replacement} {empty} />{/key}
  {/if}
</section>
