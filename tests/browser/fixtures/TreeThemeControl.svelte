<script lang="ts">
  import { ConfigProvider, Tree, type TreeDataNode } from 'antd-svelte';

  let {
    id,
    prefix = 'ant',
    priority = false
  }: { id: string; prefix?: string; priority?: boolean; } = $props();
  let styled = $derived(priority || id === 'priority');
  let data = $derived<TreeDataNode[]>([
    { key: 'p', title: 'Parent', children: [
      { key: 'a', title: 'Alpha' },
      { key: 'b', title: 'Beta', disabled: true },
      { key: 'c', title: 'Gamma', style: styled ? 'color:rgb(255,0,255)' : undefined }
    ] },
    { key: 'o', title: 'Other' }
  ]);
  let style = $derived([
    styled && 'font-size:30px;color:rgb(0,128,0)',
    id === 'variable' && `--${prefix}-tree-title-height:29px;--${prefix}-tree-node-selected-bg:rgb(255,0,255)`
  ].filter(Boolean).join(';') || undefined);
  let events = $state<string[]>([]);
  let lazy = $state.raw<TreeDataNode[]>([{ key: 'load', title: 'Load branch', isLeaf: false }]);
  let finish: (() => void) | undefined;

  function load() {
    return new Promise<void>(resolve => { finish = resolve; });
  }
  function resolveLoad() {
    lazy = [{ key: 'load', title: 'Load branch', children: [{ key: 'done', title: 'Loaded child' }] }];
    finish?.();
  }
</script>

<section data-tree-theme={id} dir={id === 'rtl' ? 'rtl' : 'ltr'} style="width:500px;padding:16px">
  <ConfigProvider direction={id === 'rtl' ? 'rtl' : 'ltr'}>
    <Tree {style} treeData={data} checkable defaultExpandedKeys={['p']}
      defaultSelectedKeys={['a']} defaultCheckedKeys={['a']} aria-label={`Themed Tree ${id}`}
      onExpand={(_keys, info) => events.push(`expand:${info.node.key}:${info.expanded}`)}
      onSelect={(_keys, info) => events.push(`select:${info.node.key}:${info.selected}`)}
      onCheck={(_keys, info) => events.push(`check:${info.node.key}:${info.checked}`)} />
    <div data-tree-lazy={id}>
      <Tree treeData={lazy} loadData={load} aria-label={`Themed lazy Tree ${id}`}
        onLoad={() => events.push('load')} />
    </div>
    <button type="button" onclick={resolveLoad}>Resolve themed Tree {id}</button>
    <button type="button" onclick={() => { events = []; }}>Clear Tree theme events {id}</button>
    <output aria-label={`Tree theme events ${id}`}>{JSON.stringify(events)}</output>
  </ConfigProvider>
</section>
