<script lang="ts">
  import {
    DirectoryTree,
    Tree,
    type TreeEventNode,
    type TreeFieldDataNode,
    type TreeKey,
    type TreeProps
  } from 'antd-svelte';

  interface RecordNode {
    id: number;
    key: 'raw-key';
    caption: { label: string; };
    selected: 'raw-selected';
    payload: { rank: number; };
    nodes?: RecordNode[];
  }

  const leaf: RecordNode = {
    id: 0, key: 'raw-key', caption: { label: 'Typed zero' }, selected: 'raw-selected',
    payload: { rank: 7 }
  };
  const data: readonly RecordNode[] = [{
    id: 1, key: 'raw-key', caption: { label: 'Typed root' }, selected: 'raw-selected',
    payload: { rank: 3 }, nodes: [leaf]
  }];
  const fields = { key: 'id', title: 'caption', children: 'nodes' };
  type UnionNode = { kind: 'task'; id: string; caption: string; taskId: number; }
    | { kind: 'article'; id: string; caption: string; slug: string; };
  const unionData: readonly UnionNode[] = [
    { kind: 'task', id: 'task', caption: 'Typed task', taskId: 42 },
    { kind: 'article', id: 'article', caption: 'Typed article', slug: 'guide' }
  ];
  const helperData: TreeFieldDataNode<{ id: number; caption: string; }, 'nodes'>[] = [{
    id: 2, caption: 'Helper root', nodes: [{ id: 0, caption: 'Helper zero' }],
    icon: helperIcon
  }];
  let result = $state('');
  let filter = $state(false);
  let renderer = $state(false);
  let unionResult = $state('');

  function record(info: Parameters<NonNullable<TreeProps<RecordNode>['onSelect']>>[1]) {
    const key: TreeKey = info.node.key;
    const selected: boolean = info.node.selected;
    const rawKey: 'raw-key' = info.selectedNodes[0].key;
    const rawSelected: 'raw-selected' = info.selectedNodes[0].selected;
    const rank: number = info.node.payload.rank;
    result = `${key}:${selected}:${rawKey}:${rawSelected}:${rank}:${info.selectedNodes[0] === leaf}`;
  }
</script>

{#snippet title(node: RecordNode)}{node.caption.label}{/snippet}
{#snippet icon(node: TreeEventNode<RecordNode>)}<i data-typed-icon>{node.payload.rank}</i>{/snippet}
{#snippet switcher(node: TreeEventNode<RecordNode>)}
  <i data-typed-switcher>{node.payload.rank}:{String(node.isLeaf)}</i>
{/snippet}
{#snippet helperIcon(node: TreeEventNode<typeof helperData[number]>)}{node.id}{/snippet}

<section id="tree-generic-fields-fixture">
  <label><input type="checkbox" bind:checked={filter} /> Filter typed zero</label>
  <label><input type="checkbox" bind:checked={renderer} /> Custom typed switcher</label>
  <section aria-label="Typed tree">
    <Tree treeData={data} fieldNames={fields} defaultExpandAll showIcon {icon}
      titleRender={title} switcherIcon={renderer ? switcher : undefined}
      classNames={({ props }) => ({ root: `typed-tree-root-${props.treeData?.[0].payload.rank}` })}
      styles={({ props }) => ({ root: `--typed-rank:${props.treeData?.[0].payload.rank}` })}
      filterTreeNode={node => filter && node.payload.rank === 7}
      onSelect={(_keys, info) => record(info)} />
  </section>
  <section aria-label="Typed directory">
    <DirectoryTree treeData={data} fieldNames={fields} defaultExpandAll titleRender={title}
      onSelect={(_keys, info) => record(info)} />
  </section>
  <section aria-label="Helper data">
    <Tree treeData={helperData} fieldNames={fields} defaultExpandAll showIcon />
  </section>
  <section aria-label="Typed union">
    <Tree treeData={unionData} fieldNames={fields} onSelect={(_keys, info) => {
      const node = info.node;
      unionResult = node.kind === 'task' ? String(node.taskId) : node.slug;
    }} />
  </section>
  <output data-typed-tree-result>{result}</output>
  <output data-typed-union-result>{unionResult}</output>
</section>
