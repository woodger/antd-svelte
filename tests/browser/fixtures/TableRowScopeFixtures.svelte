<script lang="ts">
  import {
    ConfigProvider, Table, enUS, theme, type TableColumn, type TableKey, type TableSorter
  } from 'antd-svelte';
  import reference from './ant-design-table-row-scope-reference.json' with { type: 'json' };

  let { sample }: { sample?: typeof reference.cases[number]; } = $props();
  let selectedCase = $state('default');
  let expandedKeys = $state<TableKey[]>([0]);
  let current = $derived(sample ?? reference.cases.find(item => item.name === selectedCase)
    ?? reference.cases[0]);
  let override = $state<'preset' | 'none' | 'row' | 'rowgroup'>('preset');
  let scope = $derived(override === 'none' ? undefined : override !== 'preset' ? override
    : current.rowScope === 'row' || current.rowScope === 'rowgroup' ? current.rowScope : undefined);
  let stateful = $state(false);
  let expandable = $state(false);
  let selectedKeys = $state<TableKey[] | undefined>();
  let selection = $derived(selectedKeys ?? (current.name.includes('selected')
    ? [0] : []));
  let sorterState = $state<TableSorter | null | undefined>();
  let sorter = $derived<TableSorter | null>(sorterState === undefined
    ? current.name.includes('sorted') ? { columnKey: 'name', order: 'ascend' } : null : sorterState);
  let events = $state<string[]>([]);
  const rows = [{ key: 0, name: 'Alpha', score: 10 }, { key: 1, name: 'Beta', score: 20 }];
  let columns = $derived<TableColumn<typeof rows[number]>[]>([
    { key: 'name', title: 'Name', dataIndex: 'name', rowScope: scope,
      className: 'user-row-header', sorter: (left, right) => left.name.localeCompare(right.name),
      ...(current.name.startsWith('fixed') ? { fixed: 'start', width: 140 } as const : {}),
      ...(stateful ? { render: nameCell } : {}) },
    { key: 'score', title: 'Score', dataIndex: 'score', width: 120 }
  ]);

  function resetCase() {
    selectedKeys = undefined;
    sorterState = undefined;
    override = 'preset';
  }
</script>

{#snippet nameCell(record: typeof rows[number])}{#if record.key === 0}<input name="draft" aria-label="Row header draft" value="Draft" style="width:80px" />{:else}{record.name}{/if}{/snippet}
{#snippet details(record: typeof rows[number])}Details for {record.name}{/snippet}

<section id="table-row-scope-fixture" aria-label="Table row scope fixture">
  <label>Table row scope case<select aria-label="Table row scope case"
      bind:value={selectedCase} onchange={resetCase}>
      {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
    </select></label>
  <label>Table row scope override<select aria-label="Table row scope override" bind:value={override}>
    <option>preset</option><option>none</option><option>row</option><option>rowgroup</option>
  </select></label>
  <label><input type="checkbox" bind:checked={stateful} /> Stateful row headers</label>
  <label><input type="checkbox" bind:checked={expandable} /> Expandable scoped rows</label>
  <ConfigProvider locale={enUS} direction={current.name === 'rtl' ? 'rtl' : 'ltr'}
    theme={{ cssVar: {}, token: { motion: false },
      algorithm: current.name.includes('dark') ? theme.darkAlgorithm
        : current.name === 'compact' ? theme.compactAlgorithm : theme.defaultAlgorithm,
      ...(current.name.includes('custom') ? { components: { Table: { headerBg: '#ffeedd',
        headerColor: '#123456', bodySortBg: '#334455' } } } : {}) }}>
    <div id="table-row-scope-control" style="width:320px;max-width:100%">
      <form aria-label="Table row scope form">
        <Table {columns} dataSource={rows} size="medium" rowSelection pagination={false}
          rowHoverable={!current.name.includes('no-hover')} showHeader={current.name !== 'no-header'}
          scroll={current.name.startsWith('fixed') ? { x: 600 } : undefined}
          expandable={expandable ? { expandedRowRender: details, expandedRowKeys: expandedKeys, onExpandedRowsChange: keys => { expandedKeys = keys; } } : undefined}
          bind:selectedRowKeys={() => selection, value => { selectedKeys = value; }}
          bind:sorter={() => sorter, value => { sorterState = value; }}
          onChange={change => events.push(change.action)}
          onSelectionChange={() => events.push('selection')} />
      </form>
    </div>
  </ConfigProvider>
  <output aria-label="Table row scope events">{JSON.stringify(events)}</output>
</section>
