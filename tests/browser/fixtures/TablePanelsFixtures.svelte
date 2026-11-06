<script lang="ts">
  import reference from './ant-design-table-panels-reference.json';
  import TablePanelsCase from './TablePanelsCase.svelte';

  let preset = $state('component-aliases');
  let mode = $state('default');
  let mounted = $state(true);
  let updated = $state(false);
  let showTitle = $state(true);
  let showFooter = $state(true);
  let loading = $state(false);
  let server = $state(false);
  let enabled = $state(true);
  let sample = $derived(reference.cases.find(item => item.name === preset)!);
</script>

<section id="table-panels-fixture">
  <h2>Table title and footer</h2>
  <select aria-label="Table panels preset" bind:value={preset}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select>
  <select aria-label="Table panels mode" bind:value={mode}>
    {#each [
      'default', 'rtl', 'large', 'small', 'bordered', 'page2', 'page3', 'sorted', 'filtered',
      'empty', 'all', 'no-title', 'no-footer', 'empty-panels', 'stateful'
    ] as id}<option value={id}>{id}</option>{/each}
  </select>
  <label><input type="checkbox" bind:checked={mounted} /> Mount table panels</label>
  <label><input type="checkbox" bind:checked={showTitle} /> Show table title</label>
  <label><input type="checkbox" bind:checked={showFooter} /> Show table footer</label>
  <label><input type="checkbox" bind:checked={loading} /> Load table panels</label>
  <label><input type="checkbox" bind:checked={server} /> Server table panels</label>
  <label><input type="checkbox" bind:checked={enabled} /> Apply source panel theme</label>
  <button type="button" onclick={() => { updated = true; }}>Update table panels theme</button>
  {#if mounted}
    {#key `${preset}:${mode}`}
      <TablePanelsCase {sample} {mode} {updated} {showTitle} {showFooter} {loading} {server}
        {enabled} />
    {/key}
  {/if}
</section>
