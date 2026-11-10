<script module lang="ts">
  import type { TreeKey } from 'antd-svelte';
  export interface DirectorySample {
    id: string;
    actions: { title: string; modifier?: string; double?: boolean; }[];
    expanded?: TreeKey[];
    selected?: TreeKey[];
    defaultKeys?: TreeKey[];
    all?: boolean;
    parent?: boolean;
    multiple?: boolean;
    disabled?: boolean;
    expandAction?: string | boolean;
    showIcon?: boolean;
    controlled?: string;
    prefix?: string;
    rtl?: boolean;
    lazy?: boolean;
    tokens?: {
      directoryNodeSelectedBg?: string;
      directoryNodeSelectedColor?: string;
    };
  }
</script>

<script lang="ts">
  import { untrack } from 'svelte';
  import {
    ConfigProvider,
    DirectoryTree,
    type TreeEventNode,
    type TreeExpandAction
  } from 'antd-svelte';

  let { sample }: { sample: DirectorySample } = $props();
  let controlled = $state(untrack(() => Boolean(sample.controlled)));
  let expanded = $state.raw<TreeKey[]>(untrack(() => [...sample.expanded ?? []]));
  let selected = $state.raw<TreeKey[]>(untrack(() => [...sample.selected ?? []]));
  let multiple = $state(untrack(() => Boolean(sample.multiple)));
  let showIcon = $state(untrack(() => sample.showIcon ?? true));
  let blockNode = $state(true);
  let customIcon = $state(false);
  let mounted = $state(true);
  let model = $state<DirectoryTree>();
  let element = $state<HTMLDivElement>();
  let events = $state.raw<{
    kind: string;
    node: { key: TreeKey; expanded: boolean; selected: boolean; };
    keys?: TreeKey[];
    expanded?: boolean;
    selected?: boolean;
    selectedNodes?: TreeKey[];
  }[]>([]);
  let action = $derived<TreeExpandAction | undefined>(
    sample.expandAction === 'click' || sample.expandAction === 'doubleClick'
      ? sample.expandAction : sample.expandAction === false ? false : undefined
  );
  let data = $derived([
    {
      key: 0,
      title: 'Folder 0',
      ...(sample.lazy ? { isLeaf: false } : {
        children: [
          { key: 'a', title: 'A', isLeaf: true },
          { key: 'b', title: 'B', isLeaf: true },
          { key: 'locked', title: 'Locked', disabled: true, isLeaf: true },
          { key: 'readonly', title: 'Read only', selectable: false, isLeaf: true },
          { key: 'd', title: 'D', isLeaf: true }
        ]
      })
    },
    { key: 'other', title: 'Other', children: [{ key: 'x', title: 'X', isLeaf: true }] },
    { key: 'z', title: 'Z', isLeaf: true }
  ]);
  function record(node: TreeEventNode) {
    return { key: node.key, expanded: node.expanded, selected: node.selected };
  }
</script>

<section>
  <label><input type="checkbox" bind:checked={controlled} /> Controlled directory keys</label>
  <label><input type="checkbox" bind:checked={multiple} /> Multiple directory selection</label>
  <label><input type="checkbox" bind:checked={showIcon} /> Show directory icons</label>
  <label><input type="checkbox" bind:checked={blockNode} /> Block directory rows</label>
  <label><input type="checkbox" bind:checked={customIcon} /> Custom directory icon</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount DirectoryTree</label>
  <button type="button" onclick={() => model?.focus()}>Focus directory</button>
  <button type="button" onclick={() => model?.blur()}>Blur directory</button>
  <input aria-label="Directory editor" value="Draft" />
  <output data-directory-ref>{element?.tagName ?? 'none'}</output>
  <pre data-directory-events>{JSON.stringify(events)}</pre>
</section>
{#snippet directoryIcon(node: TreeEventNode)}
  <span data-custom-directory-icon>{node.expanded ? 'open' : 'closed'}:{String(node.key)}</span>
{/snippet}
<ConfigProvider prefixCls={sample.prefix} direction={sample.rtl ? 'rtl' : 'ltr'}
  theme={{ cssVar: {}, token: { motion: false }, components: { Tree: sample.tokens } }}>
  <section data-directory-host>
    {#if mounted}
      <DirectoryTree bind:this={model} bind:nativeElement={element} treeData={data}
        class={['directory-user-array', { 'directory-user-object': true }]}
        {multiple} disabled={sample.disabled} expandAction={action} {showIcon} {blockNode}
        icon={customIcon ? directoryIcon : undefined}
        defaultExpandedKeys={sample.defaultKeys ?? sample.expanded ?? []}
        defaultSelectedKeys={sample.selected ?? []} defaultExpandAll={sample.all}
        defaultExpandParent={sample.parent}
        expandedKeys={controlled ? expanded : undefined}
        selectedKeys={controlled ? selected : undefined}
        loadData={sample.lazy ? node => {
          events = [...events, { kind: 'load', node: record(node) }];
          return new Promise(() => {});
        } : undefined}
        onExpand={(keys, info) => {
          events = [...events, {
            kind: 'expand',
            keys,
            expanded: info.expanded,
            node: record(info.node)
          }];
          if (sample.controlled === 'accept') expanded = keys;
        }}
        onSelect={(keys, info) => {
          events = [...events, {
            kind: 'select',
            keys,
            selected: info.selected,
            node: record(info.node),
            selectedNodes: info.selectedNodes.map(node => node.key)
          }];
          if (sample.controlled === 'accept') selected = keys;
        }} />
    {/if}
  </section>
</ConfigProvider>
