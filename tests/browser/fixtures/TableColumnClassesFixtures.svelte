<script lang="ts">
  import {
    ConfigProvider, Table, enUS, type TableColumn, type TableKey, type TableSorter
  } from 'antd-svelte';
  import reference from './ant-design-table-column-classes-reference.json' with { type: 'json' };

  let { sample }: { sample?: typeof reference.cases[number]; } = $props();
  let selectedCase = $state('none');
  let current = $derived(sample ?? reference.cases.find(item => item.name === selectedCase)
    ?? reference.cases[0]);
  let updated = $state(false);
  let stateful = $state(false);
  let selectedKeys = $state<TableKey[] | undefined>();
  let selection = $derived(selectedKeys ?? (current.name === 'selected' ? [0] : []));
  let sorterState = $state<TableSorter | null | undefined>();
  let sorter = $derived<TableSorter | null>(sorterState === undefined
    ? current.name === 'sorted' ? { columnKey: 'name', order: 'ascend' } : null : sorterState);
  let events = $state<string[]>([]);
  const rows = [{ key: 0, name: 'Alpha', score: 10 }, { key: 1, name: 'Beta', score: 20 }];
  let columns = $derived<TableColumn<typeof rows[number]>[]>([
    { key: 'name', title: 'Name', dataIndex: 'name',
      className: updated ? 'user-col-alternate' : current.className,
      sorter: (left, right) => left.name.localeCompare(right.name),
      ...(current.name === 'fixed' ? { fixed: 'start', width: 140 } as const : {}),
      ...(stateful ? { render: nameCell } : {}) },
    { key: 'score', title: 'Score', dataIndex: 'score', width: 120 }
  ]);

  function resetCase() {
    selectedKeys = undefined;
    sorterState = undefined;
    updated = false;
  }
</script>

<style>
  :global(.user-col-accent) { text-transform: uppercase; letter-spacing: 2px; }
  :global(.user-col-alternate) { text-transform: lowercase; letter-spacing: 1.25px; }
</style>

{#snippet nameCell(record: typeof rows[number])}{#if record.key === 0}<input name="draft" aria-label="Column draft" value="Draft" style="width:80px" />{:else}{record.name}{/if}{/snippet}

<section id="table-column-classes-fixture" aria-label="Table column classes fixture">
  <label>Table column class case<select aria-label="Table column class case"
      bind:value={selectedCase} onchange={resetCase}>
      {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
    </select></label>
  <label><input type="checkbox" bind:checked={stateful} /> Stateful column classes</label>
  <button type="button" onclick={() => { updated = !updated; }}>Update column classes</button>
  <ConfigProvider locale={enUS} direction={current.name === 'rtl' ? 'rtl' : 'ltr'}
    theme={{ cssVar: {}, token: { motion: false } }}>
    <div id="table-column-classes-control" style="width:320px;max-width:100%">
      <form aria-label="Table column form">
        <Table {columns} dataSource={current.name === 'empty-data' ? [] : rows}
          size="middle" rowSelection pagination={false}
          scroll={current.name === 'fixed' ? { x: 600 } : undefined}
          bind:selectedRowKeys={() => selection, value => { selectedKeys = value; }}
          bind:sorter={() => sorter, value => { sorterState = value; }}
          onChange={change => events.push(change.action)}
          onSelectionChange={() => events.push('selection')} />
      </form>
    </div>
  </ConfigProvider>
  <output aria-label="Table column events">{JSON.stringify(events)}</output>
</section>
