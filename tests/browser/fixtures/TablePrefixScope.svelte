<script module lang="ts">
  export interface TablePrefixSample {
    id: string;
    prefix?: string;
    childPrefix?: string;
    local?: string;
    dropdown?: string;
    variablePrefix?: string;
    aliases?: boolean;
    mode?: string;
    size?: 'small' | 'medium' | 'large';
    rtl?: boolean;
    paging?: boolean;
  }
</script>

<script lang="ts">
  import { Table, type TableColumn, type TableKey, type TableSorter } from 'antd-svelte';

  let { sample, rootPrefix, local = true, fixed = false }: {
    sample: TablePrefixSample;
    rootPrefix: string;
    local?: boolean;
    fixed?: boolean;
  } = $props();
  let prefix = $derived(local && sample.local || `${rootPrefix}-table`);
  let mode = $derived(sample.mode || 'default');
  let selection = $derived(['selection', 'selected-hover', 'bordered-selection', 'stateful']
    .includes(mode));
  let expansion = $derived(['expanded', 'expand-hover', 'stateful'].includes(mode));
  let filter = $derived(['filter', 'filter-hover', 'filter-popup', 'stateful'].includes(mode));
  let selected = $state<TableKey[]>([1]);
  let expanded = $state<TableKey[]>([1]);
  let sorter = $state<TableSorter | null>();
  let events = $state<string[]>([]);
  const rows = [{ key: 1, name: 'Alpha', score: 10 }, { key: 2, name: 'Beta', score: 20 }];
  let columns = $derived<TableColumn<typeof rows[number]>[]>([
    { key: 'name', title: 'Name', dataIndex: 'name',
      sorter: (left, right) => left.name.localeCompare(right.name),
      ...(fixed ? { fixed: 'start' as const, width: 200 } : {}) },
    { key: 'score', title: 'Score', dataIndex: 'score', ...(filter ? {
      filters: [{ text: 'Ten', value: 10 }, { text: 'Twenty', value: 20 }],
      onFilter: (value, row) => row.score === value
    } satisfies Partial<TableColumn<typeof rows[number]>> : {}),
      ...(fixed ? { width: 700 } : {}) }
  ]);
</script>

{#snippet details()}<input aria-label="Table prefix draft" name="draft" value="Draft" style="width:100px" />{/snippet}
<section data-table-prefix-host data-table-prefix={prefix} data-root-prefix={rootPrefix}
  style="width:640px;padding:16px">
  <form aria-label="Table prefix form">
    <Table prefixCls={local ? sample.local : undefined}
      dropdownPrefixCls={local ? sample.dropdown : undefined} class="fixture-table-prefix"
      dataSource={rows} {columns} aria-label="Prefix people"
      size={sample.paging ? 'large' : sample.size || 'medium'}
      pagination={sample.paging ? { showSizeChanger: false } : false} pageSize={sample.paging ? 1 : 10}
      bordered={mode === 'bordered' || mode === 'bordered-selection'}
      rowSelection={selection ? { fixed } : false}
      bind:selectedRowKeys={selected} bind:sorter
      defaultSorter={mode === 'sorted' ? { columnKey: 'name', order: 'ascend' } : null}
      expandable={expansion ? { expandedRowRender: details, fixed,
        expandedRowKeys: expanded, onExpandedRowsChange: keys => {
          expanded = keys;
          events.push('expand');
        } } : undefined}
      scroll={fixed ? { x: 1000, y: 180 } : undefined}
      onChange={change => events.push(change.action)}
      onSelectionChange={() => events.push('selection')} />
  </form>
  <output aria-label="Table prefix events">{events.join('|')}</output>
  <output aria-label="Table prefix selected">{JSON.stringify(selected)}</output>
  <output aria-label="Table prefix expanded">{JSON.stringify(expanded)}</output>
</section>
