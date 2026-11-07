<script lang="ts">
  import type { Snippet } from 'svelte';
  import {
    ConfigProvider, Select, TreeSelect, Cascader, CascaderPanel, Transfer,
    Mentions, Table, AutoComplete, enUS
  } from 'antd-svelte';
  import type {
    RenderEmptyComponent, RenderEmptyContent, RenderEmptyHandler, TableColumn
  } from 'antd-svelte';

  export interface RenderEmptySample {
    name: string;
    component: RenderEmptyComponent | 'CascaderPanel' | 'AutoComplete';
    renderer: string;
    local?: string;
    nested?: string;
  }

  let { sample, alternate = false, suffix = '', observed }: {
    sample: RenderEmptySample;
    alternate?: boolean;
    suffix?: string;
    observed?: (RenderEmptyComponent | undefined)[];
  } = $props();
  let count = $state(0);
  let local = $derived<string | number | Snippet | null | undefined>(
    sample.local === 'null' ? null : sample.local === 'zero' ? 0
      : sample.local === 'empty' ? '' : sample.local === 'text' ? 'Local empty'
        : sample.local === 'snippet' ? localContent : undefined
  );
  const columns: TableColumn<{ id: string; name: string; }>[] = [
    { key: 'name', title: 'Name', dataIndex: 'name' }
  ];
  const filterColumns = [{ ...columns[0], filters: [] }];
  const rows = [{ id: 'row', name: 'Row' }];

  function produce(component?: RenderEmptyComponent): RenderEmptyContent {
    observed?.push(component);
    const mode = sample.renderer;

    if (mode === 'undefined') return undefined;
    if (mode === 'null') return null;
    if (mode === 'false') return false;
    if (mode === 'zero') return 0;
    if (mode === 'empty') return '';
    if (mode === 'true') return true;
    if (mode === 'empty-array') return [];
    if (mode === 'snippet') return globalContent;
    if (mode === 'array') {
      return component === 'Transfer'
        ? ['Global Transfer left', ['Global Transfer right|', 0, globalContent]]
        : [`Global ${component}|`, [0, false, null, globalContent], '|end'];
    }

    return `Global ${component}${suffix}`;
  }
  const second: RenderEmptyHandler = component => produce(component);
  const nested: RenderEmptyHandler = component => sample.nested === 'false'
    ? false : `Nested ${component}`;
</script>

{#snippet globalContent()}<span data-render-empty-custom>Global custom</span><button
  type="button" onclick={() => count++}>Empty global action {count}</button><input
  aria-label="Empty global draft" value="Fresh global draft" />{/snippet}
{#snippet localContent()}<span data-render-empty-local>Local custom</span>{/snippet}

<ConfigProvider theme={{ cssVar: { key: 'render-empty-source-scope' } }} locale={enUS}
  renderEmpty={sample.renderer === 'absent' ? undefined : alternate ? second : produce}>
  <ConfigProvider renderEmpty={sample.nested ? nested : undefined}>
    <div data-render-empty-frame data-render-empty-component={sample.component} style="width:300px">
      {#if sample.component === 'Select'}<Select options={[]} notFoundContent={local}
        aria-label="Empty Select" />
      {:else if sample.component === 'TreeSelect'}<TreeSelect treeData={[]} defaultOpen
        notFoundContent={local} aria-label="Empty TreeSelect" />
      {:else if sample.component === 'Cascader'}<Cascader options={[]} defaultOpen
        notFoundContent={local} aria-label="Empty Cascader" />
      {:else if sample.component === 'CascaderPanel'}<CascaderPanel options={[]}
        notFoundContent={local} />
      {:else if sample.component === 'Transfer'}<Transfer dataSource={[]}
        locale={sample.local ? { notFoundContent: local } : undefined} />
      {:else if sample.component === 'Mentions'}<Mentions options={[]}
        notFoundContent={local} aria-label="Empty Mentions" />
      {:else if sample.component === 'Table'}<Table dataSource={[]} {columns} rowKey="id"
        pagination={false} empty={sample.local === 'snippet' ? localContent : undefined} />
      {:else if sample.component === 'Table.filter'}<Table dataSource={rows}
        columns={filterColumns} rowKey="id" mode="server" pagination={false} />
      {:else}<AutoComplete options={[]} defaultOpen notFoundContent={local}
        aria-label="Empty AutoComplete" />{/if}
    </div>
  </ConfigProvider>
</ConfigProvider>
