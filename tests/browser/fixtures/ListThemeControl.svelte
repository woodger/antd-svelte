<script lang="ts">
  import { ConfigProvider, List } from 'antd-svelte';
  import ListThemeRecord from './ListThemeRecord.svelte';

  let {
    id,
    prefix = 'ant',
    priority = false
  }: { id: string; prefix?: string; priority?: boolean; } = $props();
  let styled = $derived(priority || id === 'priority');
  let style = $derived([
    styled && 'font-size:30px;color:rgb(255,0,0);border-radius:17px',
    id === 'variable' && `--${prefix}-list-item-padding:5px 9px;--${prefix}-color-text:rgb(255,0,255)`
  ].filter(Boolean).join(';') || undefined);
  let events = $state<string[]>([]);
  const data = ['Alpha', 'Beta', 'Gamma', 'Delta'].map(key => ({ key }));
</script>

<ConfigProvider direction={id === 'rtl' ? 'rtl' : 'ltr'} list={styled ? {
  style: 'font-size:26px;color:rgb(0,128,0)',
  item: { styles: { actions: 'color:rgb(255,0,0);margin-top:7px' } }
} : undefined}>
  <section data-list-theme={id} dir={id === 'rtl' ? 'rtl' : 'ltr'} style="width:600px;padding:16px">
    {#each ['normal', 'small', 'large', 'vertical', 'grid', 'empty'] as part}
      {@const vertical = part === 'vertical' || part === 'grid'}
      <div data-list-part={part}>
        <List {style} header="List header" footer="List footer" bordered={!vertical}
          size={part === 'small' ? 'small' : part === 'large' ? 'large' : undefined}
          itemLayout={vertical ? 'vertical' : undefined}
          grid={part === 'grid' ? { column: 2, gutter: 16 } : undefined}
          pagination={part === 'normal' ? {
            defaultPageSize: 2,
            showSizeChanger: false,
            onChange: (page, size) => events.push(`page:${page}:${size}`)
          } : false}
          locale={{ emptyText: 'No records' }} rowKey="key"
          dataSource={part === 'empty' ? [] : part === 'normal' ? data : data.slice(0, 2)}>
          {#snippet renderItem(item)}
            <ListThemeRecord {item} {id} {vertical} priority={styled} />
          {/snippet}
        </List>
      </div>
    {/each}
    <output aria-label={`List theme events ${id}`}>{JSON.stringify(events)}</output>
  </section>
</ConfigProvider>
