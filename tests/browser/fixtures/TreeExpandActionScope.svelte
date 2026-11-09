<script module lang="ts">
  export interface TreeExpandActionSample {
    id: string;
    expandAction?: string | boolean;
    action: string;
    modifier?: string;
    rtl?: boolean;
    prefix?: string;
    disabled?: boolean;
    nodeDisabled?: boolean;
    leaf?: boolean;
    lazy?: boolean;
    controlled?: string;
    expanded?: boolean;
    zero?: boolean;
    repeat?: boolean;
    interval?: number;
    checkable?: boolean;
    selectable?: boolean;
    selectOnClick?: boolean;
  }
</script>

<script lang="ts">
  import { flushSync, untrack } from 'svelte';
  import { ConfigProvider, Tree, type TreeKey, type TreeEventNode,
    type TreeExpandAction } from 'antd-svelte';

  let { sample }: { sample: TreeExpandActionSample } = $props();
  let rootKey = $derived<TreeKey>(sample.zero ? 0 : 'root');
  let expanded = $state.raw<TreeKey[]>(untrack(() => sample.expanded ? [rootKey] : []));
  let selected = $state.raw<TreeKey[]>([]);
  let action = $state(untrack(() => typeof sample.expandAction === 'string'
    ? sample.expandAction : 'false'));
  let currentAction = $derived<TreeExpandAction>(
    action === 'click' || action === 'doubleClick' ? action : false
  );
  let events = $state.raw<{
    kind: string;
    node: { key: TreeKey; expanded: boolean; selected: boolean; };
    keys?: TreeKey[];
    expanded?: boolean;
    selected?: boolean;
    checked?: boolean;
    event?: string | null;
  }[]>([]);
  let data = $derived([
    { key: rootKey, title: 'Root', disabled: sample.nodeDisabled,
      ...(sample.leaf ? { isLeaf: true } : sample.lazy ? {}
        : { children: [{ key: 'child', title: 'Child', isLeaf: true }] }) },
    { key: 'leaf', title: 'Leaf', isLeaf: true }
  ]);
  function record(node: TreeEventNode) {
    return { key: node.key, expanded: node.expanded, selected: node.selected };
  }
</script>

<section>
  <label>Tree title action<select bind:value={action}>
    <option value="false">false</option><option value="click">click</option>
    <option value="doubleClick">doubleClick</option>
  </select></label>
  <button type="button" onclick={() => {
    action = action === 'click' ? 'doubleClick' : 'click';
  }}>Toggle Tree title action</button>
  <input aria-label="Tree title editor" value="Draft" />
  <pre data-tree-expand-events>{JSON.stringify(events)}</pre>
</section>
<ConfigProvider direction={sample.rtl ? 'rtl' : 'ltr'} prefixCls={sample.prefix}
  theme={{ cssVar: {}, token: { motion: false } }}>
  <section data-tree-expand-host>
    <Tree treeData={data} disabled={sample.disabled} expandAction={currentAction}
      checkable={sample.checkable} selectable={sample.selectable}
      selectedKeys={sample.selectOnClick ? selected : undefined}
      defaultExpandedKeys={sample.expanded ? [rootKey] : []}
      expandedKeys={sample.controlled ? expanded : undefined}
      loadData={sample.lazy ? node => {
        events = [...events, { kind: 'load', node: record(node) }];
        return new Promise(() => {});
      } : undefined}
      onExpand={(keys, info) => {
        events = [...events, { kind: 'expand', keys, expanded: info.expanded,
          node: record(info.node), event: info.nativeEvent?.type ?? null }];
        if (sample.controlled === 'accept') expanded = keys;
      }}
      onClick={(event, node) => {
        events = [...events, { kind: 'click', node: record(node), event: event.type }];
        if (sample.selectOnClick) flushSync(() => { selected = [rootKey]; });
      }}
      onCheck={(keys, info) => {
        events = [...events, { kind: 'check', keys: Array.isArray(keys) ? keys : [...keys.checked],
          checked: info.checked, node: record(info.node), event: info.nativeEvent?.type ?? null }];
      }}
      onDoubleClick={(event, node) => {
        events = [...events, { kind: 'doubleClick', node: record(node), event: event.type }];
      }}
      onSelect={(keys, info) => {
        events = [...events, { kind: 'select', keys, selected: info.selected,
          node: record(info.node), event: info.nativeEvent?.type ?? null }];
      }} />
  </section>
</ConfigProvider>
