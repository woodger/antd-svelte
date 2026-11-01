<script lang="ts">
  import {
    ConfigProvider,
    List,
    ListItem,
    ListItemMeta,
    type RenderEmptyHandler
  } from 'antd-svelte';
  let {
    variant = 'vertical',
    renderEmpty
  }: {
    variant?: 'vertical' | 'grid' | 'mixed' | 'empty' | 'local-empty';
    renderEmpty?: RenderEmptyHandler;
  } = $props();
  const records = Object.freeze([{ key: 0, label: 'Alpha' }, { key: '', label: 'Beta' }]);
</script>

<ConfigProvider componentSize="small" {renderEmpty} list={{
  class: 'provider-list',
  style: 'padding:1px',
  item: {
    classNames: { actions: 'provider-actions', extra: 'provider-extra' },
    styles: { actions: 'color:red', extra: 'color:pink' }
  }
}}>
  <List dataSource={variant.endsWith('empty') ? [] : records} rowKey="key"
    itemLayout={variant === 'mixed' ? 'horizontal' : 'vertical'}
    grid={variant === 'grid' ? { column: 2, md: 3, gutter: 16 } : undefined}
    locale={variant === 'local-empty' ? { emptyText: 'Own empty' } : undefined}
    header={0} footer={0} style="padding:2px">
    {#snippet renderItem(record, index)}
      <ListItem extra={0} actions={['A', null, 'B']}
        classNames={{ actions: 'local-actions', extra: 'local-extra' }}
        styles={{ extra: 'color:blue' }}
        children={variant === 'mixed' ? ['Lead ', meta] : meta}>
      </ListItem>
      {#snippet meta()}
        <ListItemMeta title={record.label} description={index} avatar={0} children="ignored" />
      {/snippet}
    {/snippet}
  </List>
</ConfigProvider>
