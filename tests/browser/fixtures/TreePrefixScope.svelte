<script lang="ts">
  import { untrack } from 'svelte';
  import { Tree, type TreeDataNode, type TreeKey } from 'antd-svelte';

  export interface TreePrefixSample {
    id: string;
    prefix?: string;
    childPrefix?: string;
    variablePrefix?: string;
    local?: string;
    rtl?: boolean;
    aliases?: boolean;
    line?: boolean;
    leafIcons?: boolean;
    block?: boolean;
    disabled?: boolean;
    noCheck?: boolean;
    multiple?: boolean;
    strict?: boolean;
    noSelect?: boolean;
    filter?: boolean;
    userStyle?: boolean;
    lazy?: boolean;
  }
  let { sample, local = true }: { sample: TreePrefixSample; local?: boolean } = $props();
  let data = $state.raw<TreeDataNode[]>(untrack<TreeDataNode[]>(() => [
    { key: 'p', title: 'Parent', children: [
      { key: 'a', title: 'Alpha' }, { key: 'b', title: 'Beta' },
      { key: 'c', title: 'Gamma', disabled: true }
    ] },
    { key: 'o', title: 'Other', isLeaf: true },
    ...(sample.lazy ? [{ key: 'lazy', title: 'Lazy', isLeaf: false }] : [])
  ]));
  let root = $state<HTMLDivElement>();
  let events = $state<string[]>([]);
  let release: (() => void) | undefined;

  function load(node: { key: TreeKey }) {
    events.push(`request:${node.key}`);
    return new Promise<void>(resolve => { release = resolve; });
  }
  function complete() {
    data = data.map(node => node.key === 'lazy'
      ? { ...node, children: [{ key: 'child', title: 'Loaded child', isLeaf: true }] } : node);
    release?.();
  }
</script>

<div style="width:480px">
  <Tree prefixCls={local ? sample.local : undefined} class="fixture-tree-prefix"
    bind:nativeElement={root} aria-label="Prefix tree" treeData={data}
    defaultExpandedKeys={['p']} defaultSelectedKeys={['b']} defaultCheckedKeys={['a']}
    checkable={!sample.noCheck} multiple={sample.multiple} checkStrictly={sample.strict}
    disabled={sample.disabled} blockNode={sample.block} selectable={sample.noSelect ? false : undefined}
    showLine={sample.line ? { showLeafIcon: !!sample.leafIcons } : undefined}
    filterTreeNode={sample.filter ? node => node.title === 'Alpha' : undefined}
    style={sample.userStyle ? 'padding:9px;background:#fffbe6' : undefined}
    loadData={sample.lazy ? load : undefined}
    onExpand={(_keys, info) => events.push(`expand:${info.node.key}`)}
    onLoad={(_keys, info) => events.push(`loaded:${info.node.key}`)}
    onSelect={() => events.push('select')} onCheck={() => events.push('check')} />
  <button type="button" onclick={complete}>Complete prefix Tree load</button>
  <output aria-label="Tree prefix events">{events.join('|')}</output>
  <output aria-label="Tree prefix ref">{root?.classList.contains('fixture-tree-prefix') ? 'connected' : 'empty'}</output>
</div>
