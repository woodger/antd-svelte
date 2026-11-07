<script lang="ts">
  import reference from './ant-design-table-hover-reference.json';
  import TableRowOptionsCase from './TableRowOptionsCase.svelte';

  let preset = $state('component-tokens');
  let mode = $state('normal');
  let setting = $state('default');
  let classMode = $state('none');
  let customPrefix = $state('user-row');
  let mounted = $state(true);
  let enabled = $state(true);
  let sample = $derived(reference.cases.find(item => item.name === preset)!);
</script>

<section id="table-row-options-fixture">
  <h2>Table row options</h2>
  <select aria-label="Table row theme" bind:value={preset}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select>
  <select aria-label="Table row mode" bind:value={mode}>
    {#each ['normal', 'selected', 'sorted', 'stateful', 'classes'] as value}
      <option value={value}>{value}</option>
    {/each}
  </select>
  <select aria-label="Table row hover" bind:value={setting}>
    {#each ['default', 'enabled', 'disabled'] as value}<option value={value}>{value}</option>{/each}
  </select>
  <select aria-label="Table row class" bind:value={classMode}>
    {#each ['none', 'constant', 'callback', 'page2', 'page3', 'sorted', 'filtered', 'empty', 'zero'] as value}
      <option value={value}>{value}</option>
    {/each}
  </select>
  <label><input type="checkbox" bind:checked={mounted} /> Mount row table</label>
  <label><input type="checkbox" bind:checked={enabled} /> Apply source row theme</label>
  <button type="button" onclick={() => { customPrefix = 'updated-row'; }}>Update row class</button>
  {#if mounted}
    {#key `${preset}:${mode}:${classMode}`}
      <TableRowOptionsCase {sample} {mode} {setting} {classMode} {customPrefix} {enabled} />
    {/key}
  {/if}
</section>
