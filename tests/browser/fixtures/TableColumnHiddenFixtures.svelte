<script lang="ts">
  import {
    ConfigProvider, Table, enUS, type TableColumn, type TableFilters, type TableKey, type TableSorter
  } from 'antd-svelte';
  import reference from './ant-design-table-column-hidden-reference.json' with { type: 'json' };

  let { sample }: { sample?: typeof reference.cases[number]; } = $props();
  let selectedCase = $state('default');
  let expandedKeys = $state<TableKey[]>([0]);
  let current = $derived(sample ?? reference.cases.find(item => item.name === selectedCase)
    ?? reference.cases[0]);
  let nameOverride = $state<boolean>();
  let scoreOverride = $state<boolean>();
  let nameHidden = $derived(nameOverride ?? current.hideName ?? false);
  let scoreHidden = $derived(scoreOverride ?? current.hideScore ?? false);
  let stateful = $state(false);
  let rowHeader = $state(false);
  let selectedKeys = $state<TableKey[] | undefined>();
  let selection = $derived(selectedKeys ?? (current.selection ? [0] : []));
  let sorterState = $state<TableSorter | null | undefined>();
  let sorter = $derived<TableSorter | null>(sorterState === undefined
    ? current.name === 'hidden-sort' ? { columnKey: 'score', order: 'ascend' } : null : sorterState);
  let filtersState = $state<TableFilters | undefined>();
  let filters = $derived(filtersState ?? (current.name === 'hidden-filter' ? { score: [20] } : {}));
  let events = $state<string[]>([]);
  const rows = [{ key: 0, name: 'Alpha', score: 20 }, { key: 1, name: 'Beta', score: 10 },
    { key: 2, name: 'Gamma', score: 30 }];
  let columns = $derived<TableColumn<typeof rows[number]>[]>([
    { key: 'name', title: 'Name', dataIndex: 'name', width: 140, hidden: nameHidden,
      className: 'user-name-cell', rowScope: rowHeader ? 'row' : undefined,
      ...(current.name.includes('fixed') ? { fixed: 'start' } as const : {}),
      ...(stateful ? { render: nameCell } : {}) },
    { key: 'score', title: 'Score', dataIndex: 'score', width: 120, hidden: scoreHidden,
      className: 'user-score-cell', sorter: (left, right) => left.score - right.score,
      filters: [{ text: 'High', value: 20 }], onFilter: (value, row) => row.score >= Number(value),
      ...(stateful ? { render: scoreCell } : {}) }
  ]);

  function resetCase() {
    nameOverride = undefined;
    scoreOverride = undefined;
    selectedKeys = undefined;
    sorterState = undefined;
    filtersState = undefined;
    events = [];
  }
</script>

{#snippet nameCell(record: typeof rows[number])}{#if record.key === 0}<input name="name-draft" aria-label="Visible name draft" value={record.name} style="width:90px" />{:else}{record.name}{/if}{/snippet}
{#snippet scoreCell(record: typeof rows[number])}{#if record.key === 0}<input name="score-draft" aria-label="Visible score draft" value={record.score} style="width:90px" />{:else}{record.score}{/if}{/snippet}
{#snippet details(record: typeof rows[number])}{#if stateful && record.key === 0}<input name="details-draft" aria-label="Hidden columns expanded draft" value="Details draft" />{:else}Details for {record.name}{/if}{/snippet}

<section id="table-column-hidden-fixture" aria-label="Table hidden columns fixture">
  <label>Table hidden column case<select aria-label="Table hidden column case"
      bind:value={selectedCase} onchange={resetCase}>
      {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
    </select></label>
  <label><input type="checkbox" bind:checked={() => nameHidden, value => { nameOverride = value; }} />
    Hide name column</label>
  <label><input type="checkbox" bind:checked={() => scoreHidden, value => { scoreOverride = value; }} />
    Hide score column</label>
  <label><input type="checkbox" bind:checked={stateful} /> Stateful hidden columns</label>
  <label><input type="checkbox" bind:checked={rowHeader} /> Hidden row header column</label>
  <ConfigProvider locale={enUS} direction={current.name === 'rtl-hidden' ? 'rtl' : 'ltr'}
    theme={{ cssVar: {}, token: { motion: false } }}>
    <div id="table-column-hidden-control" style="width:320px;max-width:100%">
      <form aria-label="Table hidden column form">
        <Table {columns} dataSource={current.name === 'all-hidden-empty' ? [] : rows}
          size="medium" pagination={false} rowSelection={current.selection}
          showHeader={current.name !== 'no-header-hidden'}
          scroll={current.name.includes('fixed') ? { x: 600 } : undefined}
          expandable={current.expand ? { expandedRowRender: details, columnTitle: 'Expand',
            expandedRowKeys: expandedKeys, onExpandedRowsChange: keys => { expandedKeys = keys; } } : undefined}
          bind:selectedRowKeys={() => selection, value => { selectedKeys = value; }}
          bind:sorter={() => sorter, value => { sorterState = value; }}
          bind:filters={() => filters, value => { filtersState = value; }}
          onChange={change => events.push(change.action)}
          onSelectionChange={() => events.push('selection')} />
      </form>
    </div>
  </ConfigProvider>
  <output aria-label="Table hidden column events">{JSON.stringify(events)}</output>
</section>
