<script lang="ts">
  import { ConfigProvider, Tree, type TreeKey, type TreeEventNode } from 'antd-svelte';
  interface Node {
    id: TreeKey;
    caption: string;
    payload: number;
    nodes?: Node[];
    style?: string;
  }
  const nodes: Node[] = [
    { id: 0, caption: 'Folder', payload: 41, nodes: [
      { id: 2n, caption: 'First', payload: 42, style: 'min-height:35px' },
      { id: 3n, caption: 'Second', payload: 43, style: 'height:49px' }
    ] }, { id: 'outside', caption: 'Outside', payload: 44 }
  ];
  let prefix = $state('ant');
  let events = $state.raw<{ key: TreeKey; payload: number; raw: boolean; }[]>([]);
  function expand(_keys: TreeKey[], info: { node: TreeEventNode<Node>; }) {
    events = [...events, { key: info.node.key, payload: info.node.payload, raw: info.node.id === 0 }];
  }
</script>

<section id="tree-motion-generic-fixture" style="width:360px;margin:64px">
  <ConfigProvider prefixCls={prefix}>
    <Tree treeData={nodes} fieldNames={{ key: 'id', title: 'caption', children: 'nodes' }}
      defaultExpandParent={false} onExpand={expand} titleRender={title} />
  </ConfigProvider>
  <button onclick={() => { prefix = 'design'; }}>Update generic prefix</button>
  <output data-motion-generic-events>{JSON.stringify(events, (_key, value) => typeof value === 'bigint' ? String(value) : value)}</output>
</section>
{#snippet title(node: Node)}
  <span data-tree-motion-key={String(node.id)}>{node.caption}</span>
  {#if node.id === 'outside'}<input aria-label="Outside draft" />{/if}
{/snippet}
