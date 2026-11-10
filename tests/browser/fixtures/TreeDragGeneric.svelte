<script lang="ts">
  import {
    ConfigProvider, Tree,
    type TreeEventNode, type TreeDraggableConfig, type TreeAllowDrop, type TreeDragInfo,
    type TreeDropInfo
  } from 'antd-svelte';

  interface Record {
    id: string | number | bigint;
    key: string;
    caption: string;
    payload: { value: number; };
    expanded: 'payload';
    dragOver: 'payload';
    nodes?: Record[];
  }
  const child: Record = { id: 2n, key: 'payload-child', caption: 'Alias child',
    payload: { value: 2 }, expanded: 'payload', dragOver: 'payload' };
  const parent: Record = { id: 0, key: 'payload-parent', caption: 'Alias parent',
    payload: { value: 0 }, expanded: 'payload', dragOver: 'payload', nodes: [child] };
  const moving: Record = { id: 'moving', key: 'payload-moving', caption: 'Alias moving',
    payload: { value: 3 }, expanded: 'payload', dragOver: 'payload' };
  const records = [parent, moving];
  const originals = new Map([parent, child, moving].map(node => [String(node.id), node]));
  let valid = $state(true);
  let events = $state.raw<unknown[]>([]);
  function checkRaw(node: Record) {
    if (node !== originals.get(String(node.id)) || node.expanded !== 'payload'
      || node.dragOver !== 'payload' || !node.key.startsWith('payload-')) valid = false;
  }
  function snapshot(node: TreeEventNode<Record>) {
    const original = originals.get(String(node.id))!;
    if (node.payload !== original.payload) valid = false;
    return { key: String(node.key), keyType: typeof node.key, id: String(node.id),
      payload: node.payload.value, expanded: node.expanded, over: node.dragOver,
      top: node.dragOverGapTop, bottom: node.dragOverGapBottom };
  }
  function notify(type: string, info: TreeDragInfo<Record>) {
    if (!(info.event instanceof DragEvent)) valid = false;
    events = [...events, { type, node: snapshot(info.node) }];
  }
  const draggable: TreeDraggableConfig<Record> = {
    nodeDraggable: node => { checkRaw(node); return true; }
  };
  const allowDrop: TreeAllowDrop<Record> = info => {
    checkRaw(info.dragNode);
    checkRaw(info.dropNode);
    return true;
  };
  function drop(info: TreeDropInfo<Record>) {
    events = [...events, { type: 'drop', node: snapshot(info.node),
      dragNode: snapshot(info.dragNode),
      keys: info.dragNodesKeys.map(key => `${typeof key}:${String(key)}`),
      position: info.dropPosition, gap: info.dropToGap }];
  }
</script>

{#snippet title(node: Record)}
  <span data-tree-drag-key={String(node.id)}>{node.caption}</span>
{/snippet}

<section id="tree-drag-generic-fixture" style="width:360px">
  <ConfigProvider theme={{ token: { motion: false } }}>
    <Tree treeData={records} fieldNames={{ key: 'id', title: 'caption', children: 'nodes' }}
      defaultExpandedKeys={[0]} defaultExpandParent={false} {draggable} {allowDrop}
      titleRender={title} blockNode aria-label="Generic draggable tree"
      onDragStart={info => notify('dragstart', info)}
      onDragEnter={info => notify('dragenter', info)}
      onDragOver={info => notify('dragover', info)}
      onDragEnd={info => notify('dragend', info)} onDrop={drop} />
  </ConfigProvider>
  <output data-tree-drag-generic-valid>{String(valid)}</output>
  <pre data-tree-drag-generic-events>{JSON.stringify(events)}</pre>
</section>
