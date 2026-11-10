<script module lang="ts">
  import type { TreeFieldNames, TreeKey, TreeTitleContent } from 'antd-svelte';

  export interface TreeFieldsNode {
    key?: TreeKey;
    id?: TreeKey;
    title?: TreeTitleContent<TreeFieldsNode> | { label: string; };
    caption?: TreeTitleContent<TreeFieldsNode> | { label: string; };
    children?: TreeFieldsNode[];
    nodes?: TreeFieldsNode[];
    payload: { tag: string; rank?: number; };
    isLeaf?: boolean;
    disabled?: boolean;
    selectable?: boolean;
  }

  export interface TreeFieldsSample {
    id: string;
    data: TreeFieldsNode[];
    fields?: TreeFieldNames;
    expanded?: TreeKey[];
    defaultChecked?: TreeKey[];
    all?: boolean;
    multiple?: boolean;
    checkable?: boolean;
    strict?: boolean;
    controlled?: string;
    directory?: boolean;
    lazy?: boolean | string;
    nodeTitle?: string;
    globalTitle?: boolean;
    prefix?: string;
    rtl?: boolean;
  }
</script>

<script lang="ts">
  import { untrack } from 'svelte';
  import {
    ConfigProvider,
    DirectoryTree,
    Tree,
    type TreeEventNode,
    type TreeProps
  } from 'antd-svelte';

  let { sample }: { sample: TreeFieldsSample } = $props();
  let fields = $state.raw(untrack(() => sample.fields));
  let data = $state.raw<TreeFieldsNode[]>(untrack(() => {
    const copy = structuredClone(sample.data);

    function prepare(nodes: TreeFieldsNode[]) {
      for (const node of nodes) {
        if (sample.nodeTitle) Reflect.set(node, sample.fields?.title || 'title', nodeTitle);
        prepare(children(node, sample.fields));
      }
    }
    prepare(copy);
    return copy;
  }));
  let selected = $state.raw<TreeKey[]>([]);
  let expanded = $state.raw<TreeKey[]>(untrack(() => sample.expanded ?? []));
  let mounted = $state(true);
  let element = $state<HTMLDivElement>();
  let tree = $state<{ focus(options?: FocusOptions): void; blur(): void; }>();
  let events = $state.raw<unknown[]>([]);
  let pending: (() => void) | undefined;
  let Component = $derived(sample.directory ? DirectoryTree : Tree);
  let originals = $derived.by(() => {
    const nodes = new Set<TreeFieldsNode>();
    const tags = new Map<string, TreeFieldsNode>();

    function collect(list: TreeFieldsNode[]) {
      for (const node of list) {
        nodes.add(node);
        tags.set(node.payload.tag, node);
        collect(children(node, fields));
      }
    }
    collect(data);
    return { nodes, tags };
  });

  function children(node: TreeFieldsNode, names?: TreeFieldNames): TreeFieldsNode[] {
    return (names?.children === 'nodes' ? node.nodes : node.children) ?? [];
  }

  function titleKind(value: TreeFieldsNode['title']) {
    return typeof value === 'function' ? 'function' : value ?? null;
  }

  function nodeInfo(node: TreeEventNode<TreeFieldsNode>) {
    return {
      key: node.key,
      id: node.id ?? null,
      title: titleKind(node.title),
      caption: titleKind(node.caption),
      tag: node.payload.tag,
      sharedPayload: originals.tags.get(node.payload.tag)?.payload === node.payload,
      expanded: node.expanded,
      selected: node.selected,
      checked: node.checked,
      halfChecked: node.halfChecked,
      loaded: node.loaded,
      loading: node.loading,
      isLeaf: node.isLeaf
    };
  }

  function dataInfo(node: TreeFieldsNode) {
    return {
      key: node.key ?? null,
      id: node.id ?? null,
      tag: node.payload.tag,
      original: originals.nodes.has(node)
    };
  }

  const callbacks: Pick<TreeProps<TreeFieldsNode>,
    'onClick' | 'onExpand' | 'onSelect' | 'onCheck' | 'onLoad'> = {
    onClick: (_event, node) => {
      events = [...events, { kind: 'click', node: nodeInfo(node) }];
    },
    onExpand: (keys, info) => {
      events = [...events, {
        kind: 'expand', keys, expanded: info.expanded, node: nodeInfo(info.node)
      }];
      if (sample.controlled === 'accept') expanded = keys;
    },
    onSelect: (keys, info) => {
      events = [...events, {
        kind: 'select', keys, selected: info.selected, node: nodeInfo(info.node),
        selectedNodes: info.selectedNodes.map(dataInfo)
      }];
      if (sample.controlled === 'accept') selected = keys;
    },
    onCheck: (keys, info) => {
      events = [...events, {
        kind: 'check', keys, checked: info.checked, node: nodeInfo(info.node),
        checkedNodes: info.checkedNodes.map(dataInfo), halfCheckedKeys: info.halfCheckedKeys,
        positions: info.checkedNodesPositions?.map(item => ({
          node: dataInfo(item.node), pos: item.pos
        }))
      }];
    },
    onLoad: (keys, info) => {
      events = [...events, { kind: 'loaded', keys, node: nodeInfo(info.node) }];
    }
  };

  function load(node: TreeEventNode<TreeFieldsNode>) {
    events = [...events, { kind: 'load', node: nodeInfo(node) }];
    return new Promise<void>(resolve => { pending = resolve; });
  }

  function changeFields(clone: boolean) {
    fields = { key: 'id', title: 'caption', children: 'nodes' };
    if (clone) data = [...data];
  }

  function finishLoad() {
    const finish = pending;
    data = data.map(node => ({
      ...node,
      [fields?.children || 'children']: [{
        [fields?.key || 'key']: 'loaded',
        [fields?.title || 'title']: 'Loaded',
        isLeaf: true,
        payload: { tag: 'loaded', rank: 8 }
      }]
    }));
    finish?.();
  }
</script>

{#snippet nodeTitle(node: TreeFieldsNode)}
  {#if sample.nodeTitle !== 'empty'}node:{node.payload.tag}{/if}
{/snippet}
{#snippet globalTitle(node: TreeFieldsNode)}global:{node.payload.tag}{/snippet}

<section>
  <button type="button" onclick={() => changeFields(true)}>Change schema and data</button>
  <button type="button" onclick={() => changeFields(false)}>Change schema only</button>
  <button type="button" onclick={finishLoad}>Resolve field load</button>
  <button type="button" onclick={() => tree?.focus()}>Focus field tree</button>
  <button type="button" onclick={() => tree?.blur()}>Blur field tree</button>
  <label><input type="checkbox" bind:checked={mounted} /> Mount field tree</label>
  <input aria-label="Field editor" value="Draft" />
  <output data-tree-fields-ref>{element?.tagName ?? 'none'}</output>
  <pre data-tree-fields-events>{JSON.stringify(events)}</pre>
</section>
<ConfigProvider prefixCls={sample.prefix} direction={sample.rtl ? 'rtl' : 'ltr'}
  theme={{ cssVar: {}, token: { motion: false } }}>
  <section data-tree-fields-host>
    {#if mounted}
      <Component {...callbacks} treeData={data} fieldNames={fields}
        defaultExpandedKeys={sample.expanded} defaultExpandAll={sample.all}
        defaultCheckedKeys={sample.defaultChecked} multiple={sample.multiple}
        checkable={sample.checkable} checkStrictly={sample.strict}
        selectedKeys={sample.controlled ? selected : undefined}
        expandedKeys={sample.controlled ? expanded : undefined}
        titleRender={sample.globalTitle ? globalTitle : undefined}
        loadData={sample.lazy ? load : undefined} bind:nativeElement={element} bind:this={tree} />
    {/if}
  </section>
</ConfigProvider>
