<script lang="ts">
  import { untrack } from 'svelte';
  import {
    ConfigProvider, DirectoryTree, Tree,
    type TreeProps, type TreeEventNode, type TreeDragInfo, type TreeKey, type TreeRef
  } from 'antd-svelte';
  import { treeDragData, type TreeDragSample, type TreeDragData } from './tree-drag-cases';

  let { sample }: { sample: TreeDragSample; } = $props();
  let data = $state.raw(untrack(() => treeDragData(sample.virtual)));
  let mounted = $state(true);
  let enabled = $state(true);
  let allowValue = $state(true);
  let originalData = $state(true);
  let nativeEvents = $state(true);
  let events = $state.raw<unknown[]>([]);
  let expanded = $state.raw<TreeKey[]>(untrack(() => [...sample.expanded ?? ['a', 'a2']]));
  let prefix = $state(untrack(() => sample.localPrefix));
  let direction = $state<'ltr' | 'rtl'>(untrack(() => sample.direction ?? 'ltr'));
  let indent = $state(untrack(() => sample.indent));
  let reorder = $state(false);
  let preventStart = $state(false);
  let handleClicks = $state(0);
  let tree = $state<TreeRef>();
  let element = $state<HTMLDivElement>();
  let records = $derived.by(() => {
    const result = new Set<TreeDragData>();
    function visit(nodes: readonly TreeDragData[]) {
      for (const node of nodes) {
        result.add(node);
        visit(node.children ?? []);
      }
    }
    visit(data);
    return result;
  });

  function snapshot(node: TreeEventNode<TreeDragData>) {
    return {
      key: node.key, pos: node.pos, payload: node.payload,
      expanded: node.expanded, selected: node.selected, checked: node.checked,
      halfChecked: node.halfChecked, loaded: node.loaded, loading: node.loading,
      active: node.active, over: [node.dragOver, node.dragOverGapTop, node.dragOverGapBottom]
    };
  }
  function append(entry: unknown) { events = [...events, entry]; }
  function notify(info: TreeDragInfo<TreeDragData>) {
    nativeEvents &&= info.event instanceof DragEvent;
  }
  function mutate(info: TreeDragInfo<TreeDragData>) {
    if (!sample.mutateEvents) return;
    info.node.key = 'consumer';
    info.node.pos = 'consumer';
    info.node.expanded = !info.node.expanded;
    info.node.dragOver = !info.node.dragOver;
  }
  function nodeDraggable(node: TreeDragData) {
    if (!records.has(node)) originalData = false;
    return node.key !== 'b';
  }
  let properties = $derived<TreeProps<TreeDragData>>({
    treeData: data,
    prefixCls: prefix,
    blockNode: true,
    disabled: sample.disabled,
    checkable: sample.checkable,
    defaultCheckedKeys: sample.checkable ? ['c'] : undefined,
    defaultSelectedKeys: sample.checkable ? ['c'] : undefined,
    defaultExpandParent: false,
    defaultExpandedKeys: sample.expanded ?? ['a', 'a2'],
    expandedKeys: sample.controlled ? expanded : undefined,
    height: sample.virtual ? 84 : undefined,
    virtual: sample.virtual,
    titleRender: title,
    draggable: !enabled ? false : sample.predicate && !sample.icon ? nodeDraggable
      : sample.icon ? {
        ...(sample.predicate ? { nodeDraggable } : {}),
        icon: sample.icon === 'hidden' ? false : sample.icon === 'custom' ? handle
          : sample.icon === 'control' ? controlHandle : emptyHandle
      } : true,
    allowDrop: info => {
      if (!records.has(info.dragNode) || !records.has(info.dropNode)) originalData = false;
      return sample.allow === 'gap' ? info.dropPosition !== 0
        : sample.allow === 'inside' ? info.dropPosition === 0
          : sample.allow === 'before' ? info.dropPosition === -1
            : sample.allow === 'never' ? false : sample.allow === 'live' ? allowValue : true;
    },
    onDragStart: info => {
      notify(info);
      append({ type: 'dragstart', node: snapshot(info.node) });
      mutate(info);
      if (preventStart) info.event.preventDefault();
    },
    onDragEnter: info => {
      notify(info);
      append({ type: 'dragenter', node: snapshot(info.node), expandedKeys: info.expandedKeys });
      mutate(info);
    },
    onDragOver: info => {
      notify(info);
      append({ type: 'dragover', node: snapshot(info.node) });
    },
    onDragLeave: info => {
      notify(info);
      append({ type: 'dragleave', node: snapshot(info.node) });
    },
    onDragEnd: info => {
      notify(info);
      append({ type: 'dragend', node: snapshot(info.node) });
    },
    onExpand: (keys, info) => {
      append({ type: 'expand', keys, node: snapshot(info.node), expanded: info.expanded,
        nativeType: info.nativeEvent?.type });
      if (sample.controlled === 'accept') expanded = keys;
    },
    onDrop: info => {
      notify(info);
      append({ type: 'drop', node: snapshot(info.node), dragNode: snapshot(info.dragNode),
        dragNodesKeys: info.dragNodesKeys, dropPosition: info.dropPosition, dropToGap: info.dropToGap });
      if (reorder && info.dropToGap) {
        const source = data.find(node => node.key === info.dragNode.key);
        if (!source) return;
        const remaining = data.filter(node => node !== source);
        const target = remaining.findIndex(node => node.key === info.node.key);
        if (target < 0) return;
        const position = Number(info.node.pos.split('-').at(-1));
        remaining.splice(target + (info.dropPosition > position ? 1 : 0), 0, source);
        data = remaining;
      }
    }
  });
</script>

{#snippet title(node: TreeDragData)}
  <span data-tree-drag-key={String(node.key)}>{node.title}</span>
{/snippet}
{#snippet handle()}<span>H</span>{/snippet}
{#snippet emptyHandle()}{/snippet}
{#snippet controlHandle()}
  <button type="button" aria-label="Handle action" onkeydown={event => event.stopPropagation()}
    onclick={() => { handleClicks += 1; }}>H</button>
{/snippet}

<div data-tree-drag-controls>
  <button type="button" onclick={() => { mounted = !mounted; }}>Toggle drag mount</button>
  <button type="button" onclick={() => { allowValue = false; }}>Deny drag drop</button>
  <button type="button" onclick={() => { allowValue = true; }}>Allow drag drop</button>
  <button type="button" onclick={() => tree?.scrollTo({ key: 'v30', align: 'top' })}>
    Scroll drag tree
  </button>
  <button type="button" onclick={() => { enabled = !enabled; }}>Toggle draggable</button>
  <button type="button" onclick={() => { prefix = 'fresh-tree'; }}>Change drag prefix</button>
  <button type="button" onclick={() => { direction = direction === 'rtl' ? 'ltr' : 'rtl'; }}>
    Toggle drag direction
  </button>
  <button type="button" onclick={() => { indent = 36; }}>Change drag indent</button>
  <button type="button" onclick={() => { reorder = true; }}>Reorder dropped roots</button>
  <button type="button" onclick={() => { preventStart = true; }}>Cancel drag start</button>
  <button type="button" onclick={() => {
    const node = data.find(node => node.key === 'c');
    if (node) node.payload = 93;
    data = [...data];
  }}>Update drag payload</button>
  <button type="button" onclick={() => {
    const parent = data.find(node => node.key === 'a');
    if (parent) parent.children = [...parent.children ?? [],
      { key: 'late', title: 'Late child', payload: 99 }];
    data = [...data];
  }}>Append drag descendant</button>
  <button type="button" onclick={() => {
    data = data.filter(node => node.key !== 'c' && node.key !== 'v0');
  }}>Remove drag source</button>
</div>
<output data-tree-drag-original>{String(originalData)}</output>
<output data-tree-drag-native>{String(nativeEvents)}</output>
<output data-tree-drag-ref>{element?.tagName ?? 'none'}</output>
<output data-tree-drag-handle-actions>{handleClicks}</output>
<pre data-tree-drag-events>{JSON.stringify(events)}</pre>
<section data-tree-drag-host style="width:360px">
  <ConfigProvider {direction} prefixCls={sample.prefix}
    theme={{ token: { motion: false }, ...(indent !== undefined
      ? { components: { Tree: { indentSize: indent } } } : {}) }}>
    {#if mounted}
      {#if sample.directory}
        <DirectoryTree {...properties} aria-label="Draggable tree" bind:this={tree}
          bind:nativeElement={element} />
      {:else}
        <Tree {...properties} aria-label="Draggable tree" bind:this={tree}
          bind:nativeElement={element} />
      {/if}
    {/if}
  </ConfigProvider>
</section>
