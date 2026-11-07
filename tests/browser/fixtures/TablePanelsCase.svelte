<script lang="ts">
  import {
    ConfigProvider, Table, enUS, type TableColumn, type TableFilters,
    type TableSorter, type ThemeConfig
  } from 'antd-svelte';
  import { resolveTablePanelsTheme, type TablePanelsSample } from './table-panels-presets';

  let {
    sample, mode = 'default', updated = false, showTitle = true,
    showFooter = true, loading = false, server = false, enabled = true
  }: {
    sample: TablePanelsSample;
    mode?: string;
    updated?: boolean;
    showTitle?: boolean;
    showFooter?: boolean;
    loading?: boolean;
    server?: boolean;
    enabled?: boolean;
  } = $props();
  const rows = [
    { key: 1, name: 'Alpha', score: 10 }, { key: 2, name: 'Beta', score: 20 },
    { key: 3, name: 'Gamma', score: 30 }, { key: 4, name: 'Delta', score: 10 },
    { key: 5, name: 'Epsilon', score: 20 }
  ];
  const columns: TableColumn<typeof rows[number]>[] = [
    { key: 'name', title: 'Name', dataIndex: 'name' },
    { key: 'score', title: 'Score', dataIndex: 'score',
      sorter: (left, right) => left.score - right.score,
      filters: [{ text: 'Ten', value: 10 }], onFilter: (value, row) => row.score === value }
  ];
  let current = $state<number>();
  let sorter = $state<TableSorter | null>();
  let filters = $state<TableFilters>();
  let events = $state<string[]>([]);
  let source = $derived(resolveTablePanelsTheme(sample.config));
  let configured = $derived<ThemeConfig>(enabled ? {
    ...source, cssVar: source.cssVar ?? {}, components: { ...source.components, Table: {
      ...source.components?.Table,
      ...(updated ? { footerBg: '#e6fffb', footerColor: '#cf1322', cellFontSizeMD: 19,
        cellPaddingBlockMD: 10 } : {})
    } }
  } : { mode: 'light', primary: 'blue' });
</script>

{#snippet header(data: readonly typeof rows[number][])}{#if mode !== 'empty-panels'}<div><output data-title-data>{JSON.stringify(data.map(row => row.key))}</output>{#if mode === 'stateful'}<input name="titleDraft" aria-label="Title draft" value="Title draft" />{/if}</div>{/if}{/snippet}
{#snippet bottom(data: readonly typeof rows[number][])}{#if mode !== 'empty-panels'}<div><output data-footer-data>{JSON.stringify(data.map(row => row.key))}</output>{#if mode === 'stateful'}<input name="footerDraft" aria-label="Footer draft" value="Footer draft" />{/if}</div>{/if}{/snippet}

<ConfigProvider locale={enUS} theme={configured} direction={mode === 'rtl' ? 'rtl' : 'ltr'}>
  <div id="table-panels-control" style="width:640px;max-width:100%">
    <form aria-label="Table panels form">
      <Table dataSource={mode === 'empty' ? [] : server ? rows.slice(2, 4) : rows} {columns}
        caption="Panel people" mode={server ? 'server' : 'client'} total={server ? 50 : undefined}
        size={mode === 'large' ? 'large' : mode === 'small' ? 'small' : 'medium'}
        bordered={mode === 'bordered'} {loading}
        pagination={mode === 'all' ? false : { showSizeChanger: false }}
        defaultPageSize={2}
        defaultCurrent={['page2', 'sorted', 'filtered'].includes(mode) ? 2 : mode === 'page3' ? 3 : 1}
        defaultSorter={mode === 'sorted' ? { columnKey: 'score', order: 'ascend' } : null}
        defaultFilters={mode === 'filtered' ? { score: [10] } : {}}
        bind:current bind:sorter bind:filters
        title={showTitle && mode !== 'no-title' ? header : undefined}
        footer={showFooter && mode !== 'no-footer' ? bottom : undefined}
        onChange={change => events.push(change.action)} />
    </form>
    <output aria-label="Table panels events">{JSON.stringify(events)}</output>
  </div>
</ConfigProvider>
