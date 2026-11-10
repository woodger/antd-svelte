<script lang="ts">
  import { untrack } from 'svelte';
  import { ConfigProvider, DirectoryTree, Tree, theme,
    type TreeKey, type TreeMotionConfig, type TreeMotionEvent, type TreeRef } from 'antd-svelte';
  import { treeMotionData, type TreeMotionSample } from './tree-motion-cases';

  let { sample }: { sample: TreeMotionSample } = $props();
  let data = $state.raw(untrack(() => {
    const nodes = treeMotionData(sample.children);
    return sample.lazy ? [{ key: 'a', title: 'Alpha', isLeaf: false }, ...nodes.slice(1)] : nodes;
  }));
  let events = $state.raw<unknown[]>([]);
  let expanded = $state.raw<TreeKey[]>(untrack(() => sample.initial ?? []));
  let mounted = $state(true);
  let off = $state(false);
  let motionEnabled = $state(untrack(() => sample.globalMotion !== false));
  let prefix = $state(untrack(() => sample.prefix));
  let localPrefix = $state(untrack(() => sample.localPrefix));
  let rtl = $state(untrack(() => sample.rtl));
  let tree = $state<TreeRef>();
  let element = $state<HTMLDivElement>();
  let resolve: (() => void) | undefined;
  let resolveLoad: (() => void) | undefined;
  let Component = $derived(sample.directory ? DirectoryTree : Tree);
  let configuration = $derived({ cssVar: {}, token: {
    motion: motionEnabled, ...(sample.duration ? { motionUnit: sample.duration / 2 } : {})
  }, ...(sample.compact ? { algorithm: theme.compactAlgorithm } : {}),
  ...(sample.titleHeight ? { components: { Tree: { titleHeight: sample.titleHeight } } } : {}) });
  function record(type: string, node: HTMLDivElement, event: TreeMotionEvent | null) {
    events = [...events, {
      type, className: node.className,
      keys: [...node.querySelectorAll<HTMLElement>('[data-tree-motion-key]')].map(n => n.dataset.treeMotionKey),
      height: node.style.height, opacity: node.style.opacity, transition: node.style.transition,
      event: event ? 'deadline' in event ? 'deadline'
        : `${event.type}:${'propertyName' in event ? event.propertyName : undefined}` : null
    }];
  }
  let motion = $derived.by<TreeMotionConfig | false | undefined>(() => {
    if (off || sample.motion === 'off') return false;
    if (sample.motion === 'empty') return {};
    if (!sample.motion) return undefined;
    const config: TreeMotionConfig = {
      motionName: sample.motion === 'object'
        ? { appear: 'custom-open', appearActive: 'custom-open-active',
          leave: 'custom-close', leaveActive: 'custom-close-active' } : 'custom-motion',
      motionDeadline: 500,
      ...(sample.motion === 'no-appear' ? { motionAppear: false } : {}),
      ...(sample.motion === 'no-leave' ? { motionLeave: false } : {})
    };
    for (const phase of ['Appear', 'Enter', 'Leave'] as const) {
      if (sample.motion === 'prepare') config[`on${phase}Prepare`] = node => {
        record(`${phase.toLowerCase()}-prepare`, node, null);
        return new Promise<void>(finish => { resolve = finish; });
      };
      config[`on${phase}Start`] = (node, event) => {
        record(`${phase.toLowerCase()}-start`, node, event);
        return phase === 'Leave' ? `height:${node.offsetHeight}px` : 'height:0px;opacity:0.25';
      };
      config[`on${phase}Active`] = (node, event) => {
        record(`${phase.toLowerCase()}-active`, node, event);
        return phase === 'Leave' ? 'height:0px;opacity:0' : `height:${node.scrollHeight}px;opacity:1`;
      };
      config[`on${phase}End`] = (node, event) => {
        record(`${phase.toLowerCase()}-end`, node, event);
        return 'deadline' in event || 'propertyName' in event && event.propertyName === 'height';
      };
    }
    return config;
  });
</script>

<div style="width:360px;margin:64px">
  <ConfigProvider theme={configuration} prefixCls={prefix} direction={rtl ? 'rtl' : 'ltr'}>
    {#if mounted}<Component bind:this={tree} bind:nativeElement={element} treeData={data}
      prefixCls={localPrefix} {motion} defaultExpandParent={false}
      defaultExpandedKeys={sample.initial ?? []}
      expandedKeys={sample.controlled ? expanded : undefined}
      height={sample.height} virtual={sample.virtual}
      draggable={sample.draggable}
      onDragStart={info => { events = [...events, { type: 'dragstart', key: info.node.key }]; }}
      onDragEnd={info => { events = [...events, { type: 'dragend', key: info.node.key }]; }}
      loadData={sample.lazy ? () => new Promise<void>(finish => {
        resolveLoad = () => {
          data = treeMotionData();
          finish();
        };
      }) : undefined}
      onExpand={(keys, info) => {
        events = [...events, { type: 'expand', keys, key: info.node.key, expanded: info.expanded }];
        if (sample.controlled === 'accept') expanded = keys;
      }} titleRender={title} />{/if}
  </ConfigProvider>
</div>
{#snippet title(node: ReturnType<typeof treeMotionData>[number])}
  <span data-tree-motion-key={node.key}>{node.title}</span>
{/snippet}
<div data-motion-controls>
  <button onclick={() => { resolve?.(); }}>Resolve prepare</button>
  <button onclick={() => { resolveLoad?.(); }}>Resolve load</button>
  <button onclick={() => { expanded = ['a', 'a2']; }}>Expand both</button>
  <button onclick={() => { expanded = ['a2']; }}>Expand hidden</button>
  <button onclick={() => { expanded = []; }}>Collapse all</button>
  <button onclick={() => { mounted = false; }}>Unmount tree</button>
  <button onclick={() => { off = !off; }}>Toggle motion</button>
  <button onclick={() => { motionEnabled = !motionEnabled; }}>Toggle theme motion</button>
  <button onclick={() => { data = treeMotionData(sample.children); }}>Replace data</button>
  <button onclick={() => { prefix = 'updated'; localPrefix = 'fresh-tree'; }}>Update prefix</button>
  <button onclick={() => { rtl = !rtl; }}>Toggle direction</button>
  <button onclick={() => tree?.focus()}>Focus tree</button>
  <output data-tree-motion-events>{JSON.stringify(events)}</output>
  <output data-tree-motion-refs>{String(Boolean(tree))}:{String(Boolean(element))}</output>
</div>
