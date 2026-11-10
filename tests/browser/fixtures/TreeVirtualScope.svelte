<script module lang="ts">
  export interface TreeVirtualAction {
    kind: string;
    config?: unknown;
    value?: string;
    offsetKind?: string;
  }
  export interface TreeVirtualSample {
    id: string;
    count?: number;
    height?: number;
    itemHeight?: number;
    width?: number;
    virtual?: boolean;
    globalVirtual?: boolean;
    alias?: boolean;
    zero?: boolean;
    variable?: boolean;
    fixed?: boolean;
    branch?: boolean;
    expanded?: boolean;
    controlled?: boolean;
    directory?: boolean;
    prefix?: string;
    rtl?: boolean;
    compact?: boolean;
    titleHeight?: number;
    themeUpdate?: boolean;
    clone?: boolean;
    shrink?: number;
    reverse?: boolean;
    toggle?: boolean;
    resize?: boolean;
    widthUpdate?: boolean;
    activeUpdate?: boolean;
    lazy?: boolean;
    itemScrollOffset?: number;
    actions?: readonly TreeVirtualAction[];
  }
</script>

<script lang="ts">
  import { untrack } from 'svelte';
  import {
    ConfigProvider, DirectoryTree, Tree, theme,
    type TreeKey, type TreeRef, type TreeScrollAlign, type TreeScrollConfig, type ThemeConfig,
    type TreeEventNode
  } from 'antd-svelte';

  interface Node {
    key?: TreeKey;
    id?: TreeKey;
    title?: string;
    caption?: string;
    children?: Node[];
    nodes?: Node[];
    isLeaf?: boolean;
    style?: string;
  }
  let { sample }: { sample: TreeVirtualSample } = $props();
  const aliases = { key: 'id', title: 'caption', children: 'nodes' };
  const data = untrack<Node[]>(() => {
    const leaves = Array.from({ length: sample.count ?? 64 }, (_, index) => ({
      [sample.alias ? 'id' : 'key']: index === 0 && !sample.zero ? 'first' : index,
      [sample.alias ? 'caption' : 'title']: `Item ${index}`,
      isLeaf: !sample.lazy,
      ...(sample.variable ? { style: `min-height:${index % 3 ? 35 : 42}px;margin-bottom:2px` } : {}),
      ...(sample.fixed ? { style: 'height:49px' } : {})
    }));
    return sample.branch ? [{ [sample.alias ? 'id' : 'key']: 'root',
      [sample.alias ? 'caption' : 'title']: 'Folder',
      [sample.alias ? 'nodes' : 'children']: leaves }] : leaves;
  });
  let revision = $state(0);
  let actionIndex = $state(0);
  let mounted = $state(true);
  let tree = $state<TreeRef>();
  let element = $state<HTMLDivElement>();
  let offsetCalls = $state.raw<unknown[]>([]);
  let scrollEvents = $state.raw<number[]>([]);
  let loadCalls = $state.raw<TreeKey[]>([]);
  let loadEvents = $state.raw<TreeKey[]>([]);
  const pendingLoads = new Map<TreeKey, () => void>();
  let retained: TreeRef | undefined;
  let Component = $derived(sample.directory ? DirectoryTree : Tree);
  let actual = $derived(sample.shrink && revision ? data.slice(0, sample.shrink) : data);
  let rows = $derived(sample.reverse && revision ? [...actual].reverse()
    : sample.clone && revision ? [...actual] : actual);
  let titleHeight = $derived(revision && sample.themeUpdate ? 32 : sample.titleHeight);
  let configured = $derived<ThemeConfig>({
    cssVar: {}, token: { motion: false },
    ...(sample.compact ? { algorithm: theme.compactAlgorithm } : {}),
    ...(titleHeight !== undefined ? { components: { Tree: { titleHeight } } } : {})
  });

  function scrollConfig(value: unknown): TreeScrollConfig | null | undefined {
    if (value == null || typeof value === 'number') return value;
    if (typeof value !== 'object') throw Error('Expected scroll config');
    const top: unknown = Reflect.get(value, 'top');
    const left: unknown = Reflect.get(value, 'left');
    if ('top' in value || 'left' in value) return {
      ...(typeof top === 'number' ? { top } : {}), ...(typeof left === 'number' ? { left } : {})
    };
    const rawAlign: unknown = Reflect.get(value, 'align');
    const align: TreeScrollAlign | undefined = rawAlign === 'top' || rawAlign === 'bottom'
      || rawAlign === 'auto' ? rawAlign : undefined;
    const rawOffset: unknown = Reflect.get(value, 'offset');
    const offset = typeof rawOffset === 'number' ? rawOffset : 0;
    const index: unknown = Reflect.get(value, 'index');
    if (typeof index === 'number') return { index, align, offset };
    const key: unknown = Reflect.get(value, 'key');
    if (typeof key === 'string' || typeof key === 'number' || typeof key === 'bigint') {
      return { key, align, offset, autoExpand: Reflect.get(value, 'autoExpand') === true };
    }
    throw Error('Expected key, index or scroll position');
  }

  function runScroll() {
    const action = sample.actions?.[actionIndex];
    if (!action) throw Error('Unknown scroll action');
    let request = scrollConfig(action.config);
    if (action.offsetKind && request && typeof request === 'object'
      && ('key' in request || 'index' in request)) request = {
      ...request,
      offset: info => {
        const size = info.getSize('first', 1);
        offsetCalls = [...offsetCalls, { align: info.align ?? null, top: size.top, bottom: size.bottom }];
        return action.offsetKind === 'invalid' ? Infinity : (size.bottom ?? NaN) - size.top;
      }
    };
    retained = tree;
    tree?.scrollTo(request);
  }

  function load(node: TreeEventNode<Node>) {
    loadCalls = [...loadCalls, node.key];
    return new Promise<void>(resolve => { pendingLoads.set(node.key, resolve); });
  }

  function scrollLatest() {
    retained = tree;
    tree?.scrollTo({ key: 60, align: 'top', offset: () => {
      offsetCalls = [...offsetCalls, 'superseded'];
      return 9;
    } });
    tree?.scrollTo(0);
  }
</script>

<section>
  <label>Tree virtual action<select bind:value={actionIndex}>
    {#each sample.actions ?? [] as action, index}<option value={index}>{index}: {action.kind}</option>{/each}
  </select></label>
  <button type="button" onclick={runScroll}>Scroll virtual tree</button>
  <button type="button" onclick={() => { revision = 1; }}>Update virtual tree</button>
  <button type="button" onclick={scrollLatest}>Scroll latest virtual tree</button>
  <button type="button" onclick={() => {
    retained?.scrollTo({ key: 40, align: 'top' });
    retained?.focus();
    retained?.blur();
  }}>Use saved virtual ref</button>
  <button type="button" onclick={() => {
    for (const resolve of pendingLoads.values()) resolve();
    pendingLoads.clear();
  }}>Resolve virtual loads</button>
  <label><input type="checkbox" bind:checked={mounted} /> Mount virtual tree</label>
  <input aria-label="Virtual tree editor" value="Draft" />
  <output data-tree-virtual-ref>{element?.tagName ?? 'none'}</output>
  <pre data-tree-virtual-offset-calls>{JSON.stringify(offsetCalls)}</pre>
  <pre data-tree-virtual-scroll-events>{JSON.stringify(scrollEvents)}</pre>
  <pre data-tree-virtual-load-calls>{JSON.stringify(loadCalls)}</pre>
  <pre data-tree-virtual-load-events>{JSON.stringify(loadEvents)}</pre>
</section>
<ConfigProvider prefixCls={sample.prefix} direction={sample.rtl ? 'rtl' : 'ltr'}
  virtual={sample.globalVirtual} theme={configured}>
  <section data-tree-virtual-host style="width:280px">
    {#if mounted}
      <Component treeData={rows} fieldNames={sample.alias ? aliases : undefined}
        height={sample.resize && revision ? 56 : sample.height} itemHeight={sample.itemHeight}
        virtual={sample.toggle && revision ? !sample.virtual : sample.virtual}
        scrollWidth={sample.widthUpdate && revision ? 420 : sample.width}
        itemScrollOffset={sample.itemScrollOffset}
        activeKey={sample.activeUpdate ? revision ? 40 : 'first' : undefined}
        defaultExpandedKeys={sample.lazy ? data.map(node => node.key!) : sample.expanded ? ['root'] : []}
        loadData={sample.lazy ? load : undefined}
        onLoad={(_keys, info) => { loadEvents = [...loadEvents, info.node.key]; }}
        expandedKeys={sample.controlled ? [] : undefined} aria-label="Virtual tree"
        onScroll={event => { scrollEvents = [...scrollEvents, event.currentTarget.scrollTop]; }}
        bind:nativeElement={element} bind:this={tree} />
    {/if}
  </section>
</ConfigProvider>
