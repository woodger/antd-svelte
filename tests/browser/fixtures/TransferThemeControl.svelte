<script lang="ts">
  import { ConfigProvider, Transfer, type TransferKey, type TransferSlots } from 'antd-svelte';

  let {
    id,
    prefix = 'ant',
    priority = false
  }: { id: string; prefix?: string; priority?: boolean; } = $props();
  let styled = $derived(priority || id === 'priority');
  const dataSource = [
    { key: 'a', title: 'Alpha' },
    { key: 'b', title: 'Beta' },
    { key: 'locked', title: 'Locked', disabled: true },
    { key: 'c', title: 'Gamma' },
    { key: 'd', title: 'Delta' }
  ];
  let panels = $derived(['normal', 'rtl', 'priority'].includes(id)
    ? ['basic', 'one-way', 'pagination', 'empty', 'custom'] : ['basic']);
  let targetKeys = $state<TransferKey[]>(['b']);
  let selectedKeys = $state<TransferKey[]>(['a', 'b']);
  let events = $state<string[]>([]);
  let rootStyle = $derived([
    styled && 'font-size:28px;color:rgb(0,128,0)',
    id === 'variable' && `--${prefix}-transfer-list-width:211px;--${prefix}-transfer-item-height:47px`
  ].filter(Boolean).join(';') || undefined);
  let styles = $derived<TransferSlots<string> | undefined>(styled ? {
    root: 'font-size:30px;color:#531dab',
    header: 'padding-top:11px',
    item: 'padding-top:3px',
    source: { section: 'width:231px' }
  } : undefined);
</script>

{#snippet footer(_props: unknown, info: { direction: 'left' | 'right'; })}
  <span>{info.direction} footer</span>
{/snippet}

{#snippet custom(props: { filteredItems: typeof dataSource; })}
  <div data-transfer-custom>{#each props.filteredItems as record (record.key)}<span>{record.title}</span>{/each}</div>
{/snippet}

<section data-transfer-theme={id} dir={id === 'rtl' ? 'rtl' : 'ltr'}
  style="width:800px;padding:16px">
  <ConfigProvider direction={id === 'rtl' ? 'rtl' : 'ltr'} transfer={styled ? {
    style: 'font-size:32px;color:red', styles: { header: 'padding-top:9px' }
  } : undefined}>
    {#each panels as mode}
      <div data-transfer-panel={mode} style="margin-bottom:16px">
        <Transfer dataSource={mode === 'empty' ? [] : dataSource}
          targetKeys={mode === 'empty' ? [] : targetKeys}
          selectedKeys={mode === 'empty' ? [] : selectedKeys} titles={['Source', 'Target']}
          render={record => record.title} showSearch={mode !== 'custom'}
          oneWay={mode === 'one-way'} pagination={mode === 'pagination' ? { pageSize: 2 } : false}
          {footer} children={mode === 'custom' ? custom : undefined} {styles} style={rootStyle}
          aria-label={`Themed Transfer ${id} ${mode}`}
          onSearch={(direction, query) => events.push(`search:${direction}:${query}`)}
          onChange={(next, direction, moved) => {
            targetKeys = next;
            events.push(`move:${direction}:${moved.join(',')}`);
          }}
          onSelectChange={(source, target) => {
            selectedKeys = [...source, ...target];
            events.push(`select:${source.join(',')}:${target.join(',')}`);
          }} />
      </div>
    {/each}
    <output aria-label={`Transfer theme events ${id}`}>{JSON.stringify(events)}</output>
  </ConfigProvider>
</section>
