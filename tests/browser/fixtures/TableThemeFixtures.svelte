<script lang="ts">
  import { ConfigProvider, Table } from 'antd-svelte';
  import reference from './ant-design-table-theme-reference.json';
  import TableThemeCase from './TableThemeCase.svelte';

  let preset = $state('component-aliases');
  let scope = $state('normal');
  let mode = $state('default');
  let mounted = $state(true);
  let enabled = $state(true);
  let inherit = $state(true);
  let updated = $state(false);
  let sample = $derived(reference.cases.find(item => item.name === preset)!);
</script>

<section id="table-theme-fixture">
  <h2>Table source theme</h2>
  <select aria-label="Table theme preset" bind:value={preset}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select>
  <select aria-label="Table theme scope" bind:value={scope}>
    {#each ['normal', 'rtl', 'nested', 'reset', 'sibling', 'outside'] as id}
      <option value={id}>{id}</option>
    {/each}
  </select>
  <select aria-label="Table theme mode" bind:value={mode}>
    {#each [
      'default', 'large', 'small', 'bordered', 'selection', 'bordered-selection',
      'header-hover', 'sorter-hover', 'sorted', 'selected-hover', 'expanded', 'expand-hover',
      'filter', 'filter-hover', 'filter-popup', 'stateful', 'root-style', 'fixed-hover'
    ] as value}
      <option value={value}>{value}</option>
    {/each}
  </select>
  <label><input type="checkbox" bind:checked={mounted} /> Mount themed Table</label>
  <label><input type="checkbox" bind:checked={enabled} /> Apply source Table theme</label>
  <label><input type="checkbox" bind:checked={inherit} /> Inherit Table theme</label>
  <button type="button" onclick={() => { updated = true; }}>Update Table tokens</button>
  {#key `${preset}:${scope}:${mode}`}
    <TableThemeCase {sample} {scope} {mode} {mounted} {enabled} {inherit} {updated} />
  {/key}
</section>

<div id="table-theme-neighbor">
  <ConfigProvider theme={{ cssVar: {}, components: { Table: {
    headerBg: '#fff0f6', cellFontSizeMD: 13
  } } }}>
    <Table dataSource={[{ key: 1, name: 'Neighbor' }]}
      columns={[{ key: 'name', title: 'Neighbor', dataIndex: 'name' }]}
      pagination={false} aria-label="Neighbor people" />
  </ConfigProvider>
</div>
