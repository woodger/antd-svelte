<script lang="ts">
  import {
    ConfigProvider, Table, enUS, type TableColumn, type TableKey
  } from 'antd-svelte';
  import { resolveTableHeaderTheme, type TableHeaderSample } from './table-header-presets';

  let {
    sample,
    mode = 'default',
    visibility = 'preset',
    rtl = false,
    replacement = false,
    empty = false
  }: {
    sample: TableHeaderSample;
    mode?: string;
    visibility?: string;
    rtl?: boolean;
    replacement?: boolean;
    empty?: boolean;
  } = $props();
  const initial = [{ key: 1, name: 'Alpha', score: 10 }, { key: 2, name: 'Beta', score: 20 }];
  const replaced = [{ key: 3, name: 'Gamma', score: 30 }, { key: 4, name: 'Delta', score: 40 }];
  let rows = $derived(empty || mode === 'hidden-empty' ? [] : replacement ? replaced : initial);
  let selected = $state<TableKey[]>([1]);
  let events = $state<string[]>([]);
  let stateful = $derived(mode === 'stateful');
  let header = $derived(visibility === 'shown' ? true : visibility === 'hidden' ? false
    : ['default', 'stateful'].includes(mode) ? undefined : mode === 'explicit');
  let hasTitle = $derived(['hidden-title', 'hidden-title-bordered', 'hidden-empty-title']
    .includes(mode));
  let columns = $derived<TableColumn<typeof initial[number]>[]>([
    { key: 'name', title: 'Name', dataIndex: 'name',
      ...(stateful ? { width: 200, fixed: 'start' as const, render: nameCell } : {}) },
    ...(stateful ? [{ key: 'details', title: 'Details', dataIndex: 'name' as const, width: 500 }] : []),
    { key: 'score', title: 'Score', dataIndex: 'score',
      sorter: (left, right) => left.score - right.score,
      filters: [{ text: 'Ten', value: 10 }], onFilter: (value, row) => row.score === value,
      ...(stateful ? { width: 160, fixed: 'end' as const } : {}) }
  ]);
</script>

{#snippet title()}{#if mode !== 'hidden-empty-title'}Table title{/if}{/snippet}
{#snippet nameCell(record: typeof initial[number])}{#if record.key === 1}<input name="draft" aria-label="Header row draft" value="Draft" style="width:100px" />{:else}{record.name}{/if}{/snippet}
{#snippet details(record: typeof initial[number])}Details for {record.name}{/snippet}

<ConfigProvider locale={enUS} theme={resolveTableHeaderTheme(sample.config)}
  direction={rtl ? 'rtl' : 'ltr'}>
  <div id="table-header-control" style="width:640px;max-width:100%">
    <form aria-label="Table header form">
      <Table dataSource={rows} {columns} showHeader={header} title={hasTitle ? title : undefined}
        caption="Header people" size="middle" pagination={false}
        bordered={stateful || ['hidden-bordered', 'hidden-title-bordered'].includes(mode)}
        rowSelection={stateful ? { fixed: true,
          getCheckboxProps: record => ({ 'aria-label': `Select ${record.name}` }) } : false}
        bind:selectedRowKeys={selected}
        expandable={stateful ? { expandedRowRender: details, fixed: true } : undefined}
        defaultExpandedRowKeys={[1]}
        scroll={stateful ? { x: 960, y: 180 } : undefined}
        onChange={change => events.push(change.action)}
        onSelectionChange={() => events.push('selection')}
        onExpandedRowsChange={() => events.push('expand')} />
    </form>
    <output aria-label="Table header events">{JSON.stringify(events)}</output>
  </div>
</ConfigProvider>
