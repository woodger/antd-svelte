<script lang="ts">
  import { Table, type TableColumn, type TableKey, type TableSorter } from 'antd-svelte';

  let { mode = 'default' }: { mode?: string; } = $props();
  let selected = $state<TableKey[]>([1]);
  let expanded = $state<TableKey[]>([1]);
  let sorter = $state<TableSorter | null>();
  let events = $state<string[]>([]);
  const rows = [{ key: 1, name: 'Alpha', score: 10 }, { key: 2, name: 'Beta', score: 20 }];
  let selection = $derived(['selection', 'selected-hover', 'bordered-selection', 'stateful']
    .includes(mode));
  let expansion = $derived(['expanded', 'expand-hover', 'stateful'].includes(mode));
  let fixed = $derived(mode === 'stateful' || mode === 'fixed-hover');
  let columns = $derived<TableColumn<typeof rows[number]>[]>([
    { key: 'name', title: 'Name', dataIndex: 'name',
      sorter: (left, right) => left.name.localeCompare(right.name),
      ...(fixed ? { width: 200, fixed: 'start' as const } : {}) },
    ...(mode === 'stateful' ? [{ key: 'details', title: 'Details',
      dataIndex: 'name' as const, width: 500 }] : []),
    { key: 'score', title: 'Score', dataIndex: 'score',
      ...(['filter', 'filter-hover', 'filter-popup'].includes(mode) ? {
        filters: [{ text: 'Ten', value: 10 }, { text: 'Twenty', value: 20 }],
        onFilter: (value, row) => row.score === value
      } satisfies Partial<TableColumn<typeof rows[number]>> : {}),
      ...(mode === 'stateful' ? { width: 160, fixed: 'end' as const } : {}) }
  ]);
</script>

{#snippet details()}<input aria-label="Table draft" name="draft" value="Draft" style="width:100px" />{/snippet}
<div id="table-theme-control" style="width:640px;max-width:100%">
  <form aria-label="Table theme form">
    <Table dataSource={rows} {columns} aria-label="Themed people" pagination={false}
      size={mode === 'large' ? 'large' : mode === 'small' ? 'small' : 'medium'}
      bordered={mode === 'bordered' || mode === 'bordered-selection'}
      rowSelection={selection ? { fixed: mode === 'stateful' } : false}
      bind:selectedRowKeys={selected} bind:sorter
      defaultSorter={mode === 'sorted' ? { columnKey: 'name', order: 'ascend' } : null}
      expandable={expansion ? { expandedRowRender: details, fixed: mode === 'stateful' } : undefined}
      bind:expandedRowKeys={expanded}
      scroll={fixed ? { x: 960, y: 180 } : undefined}
      style={mode === 'root-style' ? '--ant-table-cell-padding-block-md:11px' : undefined}
      onChange={change => events.push(change.action)}
      onSelectionChange={() => events.push('selection')}
      onExpandedRowsChange={() => events.push('expand')} />
  </form>
  <output aria-label="Table theme events">{JSON.stringify(events)}</output>
  <output aria-label="Table theme selected">{JSON.stringify(selected)}</output>
  <output aria-label="Table theme expanded">{JSON.stringify(expanded)}</output>
</div>
