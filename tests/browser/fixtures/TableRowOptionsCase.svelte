<script lang="ts">
  import {
    ConfigProvider, Table, enUS, type TableColumn, type TableKey, type ThemeConfig
  } from 'antd-svelte';
  import { resolveTableRowTheme, type TableRowSample } from './table-row-presets';

  let {
    sample,
    mode = 'normal',
    setting = 'default',
    classMode = 'none',
    customPrefix = 'user-row',
    enabled = true
  }: {
    sample: TableRowSample;
    mode?: string;
    setting?: string;
    classMode?: string;
    customPrefix?: string;
    enabled?: boolean;
  } = $props();
  const rows = [
    { key: 1, name: 'Alpha', score: 10 }, { key: 2, name: 'Beta', score: 20 },
    { key: 3, name: 'Gamma', score: 30 }, { key: 4, name: 'Delta', score: 10 },
    { key: 5, name: 'Epsilon', score: 20 }
  ];
  let selected = $state<TableKey[]>([1, 3]);
  let events = $state<string[]>([]);
  let source = $derived(resolveTableRowTheme(sample.config));
  let configured = $derived<ThemeConfig>(enabled ? { ...source, cssVar: source.cssVar ?? {} }
    : { mode: 'light', primary: 'blue' });
  let classes = $derived(mode === 'classes');
  let columns = $derived<TableColumn<typeof rows[number]>[]>([
    { key: 'name', title: 'Name', dataIndex: 'name',
      ...(mode === 'stateful' ? { render: nameCell } : {}) },
    { key: 'score', title: 'Score', dataIndex: 'score',
      sorter: (left, right) => left.score - right.score,
      ...(classes ? { filters: [{ text: 'Ten', value: 10 }],
        onFilter: (value, row) => row.score === value
      } satisfies Partial<TableColumn<typeof rows[number]>> : {}) }
  ]);

  function rowClass(record: typeof rows[number], index: number, indent: number) {
    return `${customPrefix}-${record.key}-${index}-${indent}`;
  }
</script>

{#snippet nameCell(record: typeof rows[number])}{#if record.key === 1}<input name="draft" aria-label="Row draft" value="Draft" style="width:100px" />{:else}{record.name}{/if}{/snippet}

<ConfigProvider locale={enUS} theme={configured}>
  <div id="table-row-control" style="width:640px;max-width:100%">
    <form aria-label="Table row form">
      <Table columns={columns}
        dataSource={classes && classMode === 'empty' ? [] : classes && classMode === 'zero'
          ? [{ key: 0, name: 'Zero', score: 0 }] : classes ? rows : rows.slice(0, 2)}
        aria-label="Row people" size="middle"
        rowHoverable={setting === 'default' ? undefined : setting === 'enabled'}
        rowClassName={classMode === 'none' ? undefined : classMode === 'constant'
          ? `${customPrefix}-constant ${customPrefix}-extra` : rowClass}
        rowSelection={classes || mode === 'selected' || mode === 'stateful'}
        bind:selectedRowKeys={selected}
        defaultPageSize={2}
        defaultCurrent={['page2', 'sorted', 'filtered'].includes(classMode)
          ? 2 : classMode === 'page3' ? 3 : 1}
        defaultSorter={mode === 'sorted' || classMode === 'sorted'
          ? { columnKey: 'score', order: 'ascend' } : null}
        defaultFilters={classMode === 'filtered' ? { score: [10] } : {}}
        pagination={classes ? { showSizeChanger: false } : false}
        onChange={change => events.push(change.action)}
        onSelectionChange={() => events.push('selection')} />
    </form>
    <output aria-label="Table row events">{JSON.stringify(events)}</output>
  </div>
</ConfigProvider>
