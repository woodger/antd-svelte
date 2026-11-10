<script module lang="ts">
  export interface TreeNodeRendererSample {
    id: string;
    node?: string;
    global?: string;
    leaf?: string;
    line?: boolean;
    lazy?: boolean;
    directory?: boolean;
    disabled?: boolean;
    rtl?: boolean;
    prefix?: string;
  }
</script>

<script lang="ts">
  import { untrack, type Snippet } from 'svelte';
  import { ConfigProvider, DirectoryTree, Tree, type TreeEventNode } from 'antd-svelte';

  let { sample }: { sample: TreeNodeRendererSample } = $props();
  let nodeMode = $state(untrack(() => sample.node ?? ''));
  let globalMode = $state(untrack(() => sample.global ?? ''));
  let leafMode = $state(untrack(() => sample.leaf ?? ''));
  let mounted = $state(true);
  let element = $state<HTMLDivElement>();
  let events = $state.raw<unknown[]>([]);
  let Component = $derived(sample.directory ? DirectoryTree : Tree);
  let showLine = $derived<boolean | { showLeafIcon: Snippet<[TreeEventNode]>; }>(
    leafMode ? { showLeafIcon: leafIcon } : Boolean(sample.line)
  );
  let data = $derived([{
    key: 'root',
    title: 'Root',
    switcherIcon: nodeMode ? nodeIcon : undefined,
    ...(sample.lazy ? { isLeaf: false } : {
      children: [{ key: 'leaf', title: 'Leaf', switcherIcon: nodeMode ? nodeIcon : undefined }]
    })
  }]);

  function nodeInfo(node: TreeEventNode) {
    return {
      key: node.key,
      expanded: node.expanded,
      selected: node.selected,
      checked: node.checked,
      loading: node.loading,
      isLeaf: node.isLeaf
    };
  }

  function rendererState(kind: string, node: TreeEventNode) {
    return `${kind}:${node.key}:${Boolean(node.expanded)}:${Boolean(node.isLeaf)}:${Boolean(node.loading)}`;
  }

  function record(kind: string, info: { event: MouseEvent; node: TreeEventNode; }) {
    events = [...events, { kind, type: info.event.type, node: nodeInfo(info.node) }];
  }
</script>

<section>
  <label>Node switcher<select bind:value={nodeMode}>
    <option value="">Default</option><option value="text">Text</option>
    <option value="element">Element</option><option value="empty">Empty</option>
  </select></label>
  <label>Global switcher<select bind:value={globalMode}>
    <option value="">Default</option><option value="text">Text</option>
    <option value="empty">Empty</option>
  </select></label>
  <label>Leaf switcher<select bind:value={leafMode}>
    <option value="">Default</option><option value="text">Text</option>
    <option value="element">Element</option><option value="empty">Empty</option>
  </select></label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount renderer tree</label>
  <input aria-label="Renderer editor" value="Draft" />
  <output data-tree-renderer-ref>{element?.tagName ?? 'none'}</output>
  <pre data-tree-renderer-events>{JSON.stringify(events)}</pre>
</section>
{#snippet nodeIcon(node: TreeEventNode)}
  {#if nodeMode === 'element'}<em data-renderer="node" data-render-state={rendererState('node', node)}>N</em>{:else if nodeMode !== 'empty'}N{/if}
{/snippet}
{#snippet leafIcon(node: TreeEventNode)}
  {#if leafMode === 'element'}<em data-renderer="leaf" data-render-state={rendererState('leaf', node)}>L</em>{:else if leafMode !== 'empty'}L{/if}
{/snippet}
{#snippet globalIcon()}{#if globalMode !== 'empty'}G{/if}{/snippet}
<ConfigProvider prefixCls={sample.prefix} direction={sample.rtl ? 'rtl' : 'ltr'}
  theme={{ cssVar: {}, token: { motion: false } }}>
  <section data-tree-renderer-host>
    {#if mounted}
      <Component treeData={data} defaultExpandedKeys={sample.lazy ? [] : ['root']}
        disabled={sample.disabled} {showLine} bind:nativeElement={element}
        switcherIcon={globalMode ? globalIcon : undefined}
        loadData={sample.lazy ? () => new Promise(() => {}) : undefined}
        onMouseEnter={info => record('enter', info)}
        onMouseLeave={info => record('leave', info)}
        onExpand={(keys, info) => {
          events = [...events, {
            kind: 'expand',
            keys,
            expanded: info.expanded,
            node: nodeInfo(info.node)
          }];
        }} />
    {/if}
  </section>
</ConfigProvider>
