<script lang="ts">
  import { ConfigProvider, Listy } from 'antd-svelte';
  let { variant = 'raw' }: { variant?: string; } = $props();
  let items = $derived(Array.from({ length: variant === 'virtual' ? 20 : 3 }, (_, index) => ({
    id: index,
    group: index === 1 ? '' : 0
  })));
</script>

{#snippet itemRender(item: typeof items[number], index: number)}
  <button type="button">Item {item.id}:{index}</button>
{/snippet}
{#snippet title(key: number | string, entries: typeof items)}
  <strong>Group {key}:{entries.length}</strong>
{/snippet}

<ConfigProvider virtual={variant === 'virtual'} listy={{
  class: 'provider-listy',
  classNames: { root: 'provider-root', item: 'provider-item', groupHeader: 'provider-header' },
  style: 'color:red',
  styles: ({ props }) => ({ root: props.virtual === undefined ? 'padding:1px' : 'padding:2px' })
}}>
  <Listy {items} rowKey="id" {itemRender} sticky height={200}
    group={variant === 'group' ? { key: item => item.group, title } : undefined}
    classNames={{ item: 'local-item', groupHeader: 'local-header' }}
    styles={{ root: 'position:static', item: 'color:blue' }} style="color:green" />
</ConfigProvider>
