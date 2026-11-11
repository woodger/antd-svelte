<script lang="ts">
  import { untrack } from 'svelte';
  import {
    TreeSelect, ConfigProvider, enUS, type TreeSelectLabel, type TreeSelectNode,
    type TreeSelectTreeNodeProps, type TreeSelectProps, type TreeSelectRef, type TreeEventNode
  } from 'antd-svelte';
  import { treeSelectNodeSpecs, type TreeSelectNodesSample } from './tree-select-nodes-cases';

  let { sample }: { sample: TreeSelectNodesSample } = $props();
  let revision = $state(0);
  let reversed = $state(false);
  let removed = $state(false);
  let added = $state(false);
  let loaded = $state(false);
  let mode = $state(untrack(() => sample.override ?? (sample.data ? 'data' : 'declarations')));
  let actionIndex = $state(0);
  let events = $state.raw<unknown[]>([]);
  let lastLabels = $state.raw<TreeSelectLabel[]>([]);
  let loadCalls = $state(0);
  let instance = $state<TreeSelectRef>();
  let element = $state<HTMLDivElement>();
  let mounted = $state(true);
  let finishLoad: (() => void) | undefined;
  let pendingLoad: Promise<void> | undefined;
  let specs = $derived(treeSelectNodeSpecs(sample, revision, reversed, removed, added, loaded));
  let rows = $derived(sample.data ? specs : [{ value: 'override', title: 'Data Override', payload: 'override' }]);
  let data = $derived(mode === 'declarations' ? undefined : mode === 'empty' ? [] : rows.map(nodeData));
  let options = $derived<TreeSelectProps>({
    defaultOpen: !sample.closed,
    defaultValue: sample.lazy ? undefined : sample.checkable ? [0] : sample.long ? 60 : 0,
    ...(sample.long ? { listHeight: 84, listItemHeight: 28 } : {}),
    treeDataSimpleMode: sample.simple,
    fieldNames: sample.aliases ? { value: 'code', label: 'caption' } : undefined,
    treeDefaultExpandAll: !sample.lazy,
    treeDefaultExpandedKeys: sample.initiallyExpanded ? ['p'] : undefined,
    treeCheckable: sample.checkable,
    treeCheckStrictly: sample.strict,
    disabled: sample.disabled,
    treeIcon: sample.icons === 'truthy' ? unusedIcon : sample.icons,
    switcherIcon: globalSwitcher,
    allowClear: true,
    showSearch: { onSearch: value => record('search', value) },
    onChange: (value, labels, extra) => {
      lastLabels = labels ?? [];
      record('change', value, extra.triggerValue ?? null);
    },
    onSelect: (value, node) => record('select', value, node?.payload),
    onOpenChange: value => record('open', value),
    onTreeExpand: keys => record('expand', keys),
    onTreeLoad: keys => record('load', keys),
    loadData: sample.lazy ? () => {
      loadCalls++;
      return pendingLoad ??= new Promise(resolve => { finishLoad = resolve; });
    } : undefined
  });

  function record(kind: string, ...args: unknown[]) { events = [...events, [kind, ...args]]; }
  function nodeProps(spec: (typeof specs)[number]): TreeSelectTreeNodeProps {
    const title = spec.rich ? richTitle : spec.title;
    return {
      key: String(spec.value), value: spec.value, payload: spec.payload, label: spec.label,
      ...(sample.aliases ? { code: spec.value, caption: title, title: 'Shadow title' } : { title }),
      icon: spec.icon === 'state' ? nodeIcon : spec.icon ? `Icon ${spec.payload}` : undefined,
      switcherIcon: spec.switcher === 'state' ? nodeSwitcher : spec.switcher ? 'Leaf switcher' : undefined,
      disabled: spec.disabled, disableCheckbox: spec.disableCheckbox, selectable: spec.selectable,
      checkable: spec.checkable, isLeaf: spec.isLeaf,
      ...(sample.styled ? { className: 'node-source-class', style: `margin-bottom:${revision ? 12 : 6}px` } : {}),
      ...(sample.aria ? { 'aria-label': `Accessible ${spec.payload}` } : {}),
      'data-node-marker': spec.payload
    };
  }
  function nodeData(spec: (typeof specs)[number]): TreeSelectNode {
    return { ...nodeProps(spec), children: spec.children?.map(nodeData) };
  }
  function act() {
    const action = sample.actions?.[actionIndex];
    if (action === 'reverse') reversed = !reversed;
    if (action === 'update') revision++;
    if (action === 'remove') removed = true;
    if (action === 'add') added = true;
    if (action === 'data') mode = 'data';
    if (action === 'empty-data') mode = 'empty';
    if (action === 'declarations') mode = 'declarations';
    if (action === 'resolve') { loaded = true; finishLoad?.(); }
  }
</script>

{#snippet richTitle()}<strong data-rich-title>{revision ? 'Updated Zero' : 'Node Zero'}</strong>{/snippet}
{#snippet nodeIcon(node: TreeEventNode<TreeSelectNode>)}<i data-node-icon>{node.key}|{Number(node.selected)}|{Number(node.expanded)}|{Number(node.active)}|{Number(node.loading)}|{node.payload}</i>{/snippet}
{#snippet nodeSwitcher(node: TreeEventNode<TreeSelectNode>)}<b data-node-switcher>{node.key}|{Number(node.isLeaf)}|{Number(node.expanded)}|{Number(node.loading)}|{node.payload}</b>{/snippet}
{#snippet globalSwitcher(node: TreeEventNode)}<b data-global-switcher>{node.key}|{Number(node.isLeaf)}</b>{/snippet}
{#snippet unusedIcon()}<i data-unused-tree-icon>Unexpected icon callback</i>{/snippet}
{#snippet declarations(nodes: typeof specs)}
  {#each nodes as spec (spec.value)}
    <TreeSelect.TreeNode {...nodeProps(spec)}>{@render declarations(spec.children ?? [])}</TreeSelect.TreeNode>
  {/each}
{/snippet}

<label>TreeSelect node action<select bind:value={actionIndex}>
  {#each sample.actions ?? [] as action, index}<option value={index}>{action}</option>{/each}
</select></label>
<button type="button" onclick={act}>Apply TreeSelect node action</button>
<button type="button" onclick={() => { mounted = false; }}>Unmount declared selection</button>
<output data-node-events>{JSON.stringify(events)}</output>
<div data-node-change-labels>{#each lastLabels as label}{#if typeof label === 'function'}{@render label()}{:else if typeof label !== 'boolean'}{label}{/if}{/each}</div>
<output data-node-load-calls={loadCalls} data-node-ref={Boolean(instance && element)}></output>
<ConfigProvider locale={enUS} theme={{ token: { motion: false } }}>
  <div data-tree-select-node-control style="margin:64px">
    {#if mounted}<TreeSelect {...options} treeData={data} style="width:320px" aria-label="Declared selection"
      bind:this={instance} bind:nativeElement={element} name="declared">
      {@render declarations(specs)}
    </TreeSelect>{/if}
  </div>
</ConfigProvider>
