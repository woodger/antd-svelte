<script module lang="ts">
  export interface TreeSemanticSample {
    id: string;
    context?: boolean;
    local?: boolean;
    functions?: boolean;
    showIcon?: boolean;
    blockNode?: boolean;
    checkable?: boolean;
    disabled?: boolean;
    directory?: boolean;
    prefix?: string;
    rtl?: boolean;
    scope?: string;
    localStyle?: boolean;
    live?: boolean;
    reactive?: boolean;
    lazy?: boolean;
    customIcon?: boolean;
    nativeDefaultIcon?: boolean;
  }
</script>

<script lang="ts">
  import { untrack } from 'svelte';
  import {
    ConfigProvider,
    DirectoryTree,
    Tree,
    TreeSelect,
    type TreeClassNames,
    type TreeConfig,
    type TreeDataNode,
    type TreeProps,
    type TreeSemanticName,
    type TreeStyles
  } from 'antd-svelte';

  let { sample }: { sample: TreeSemanticSample } = $props();
  const slots: TreeSemanticName[] = ['root', 'item', 'itemIcon', 'itemTitle', 'itemSwitcher'];
  const baseData: TreeDataNode[] = [{ key: 'root', title: 'Root', class: 'node-class',
    style: 'font-size:19px', children: [{ key: 0, title: 'Zero', isLeaf: true }] }];
  let data = $state.raw<TreeDataNode[]>(untrack(() => sample.lazy
    ? [{ key: 'root', title: 'Root', class: 'node-class', style: 'font-size:19px', isLeaf: false }]
    : baseData));
  let revision = $state(0);
  let forcedContext = $state(false);
  let mounted = $state(true);
  let element = $state<HTMLDivElement>();
  let tree = $state<{ focus(options?: FocusOptions): void; blur(): void; }>();
  let events = $state.raw<string[]>([]);
  let open = $state(false);
  let pending: (() => void) | undefined;
  let Component = $derived(sample.directory ? DirectoryTree : Tree);
  let context = $derived<TreeConfig | undefined>(sample.context ? {
    class: 'component-context',
    style: forcedContext ? 'padding-left:11px' : 'padding-left:9px',
    classNames: semanticClasses(forcedContext || sample.reactive && revision
      ? 'updated-context' : 'context'),
    styles: semanticStyles(forcedContext || sample.reactive && revision
      ? 'updated-context' : 'context')
  } : undefined);
  let inner = $derived<TreeConfig | undefined>(sample.scope === 'reset' ? {}
    : sample.scope === 'replace' ? {
      class: 'component-inner', classNames: { root: 'inner-root' },
      styles: { itemTitle: 'color:rgb(16,32,48)' }
    } : undefined);
  let localClasses = $derived<TreeProps['classNames']>(sample.live ? {
    itemIcon: `${revision ? 'updated' : 'initial'}-icon`,
    itemTitle: `${revision ? 'updated' : 'initial'}-title`
  } : sample.local ? semanticClasses('local') : undefined);
  let localStyles = $derived<TreeProps['styles']>(sample.live ? {
    itemIcon: `color:${revision ? 'rgb(90,80,70)' : 'rgb(70,80,90)'}`,
    itemTitle: `letter-spacing:${revision ? 4 : 3}px`
  } : sample.local ? semanticStyles('local') : undefined);

  function classes(label: string): TreeClassNames {
    return Object.fromEntries(slots.map(slot => [slot, `${label}-${slot}`]));
  }

  function styles(label: string): TreeStyles {
    return {
      root: `color:${label === 'context' ? 'rgb(10,20,30)' : 'rgb(40,50,60)'}`,
      item: `font-size:${label === 'context' ? 15 : 17}px`,
      itemIcon: `color:${label === 'context' ? 'rgb(11,22,33)' : 'rgb(44,55,66)'}`,
      itemTitle: `letter-spacing:${label === 'context' ? 1 : 2}px`,
      itemSwitcher: `background-color:${label === 'context' ? 'rgb(12,23,34)' : 'rgb(45,56,67)'}`
    };
  }

  function semanticClasses(label: string): TreeConfig['classNames'] {
    if (!sample.functions) return classes(label);
    return ({ props }) => {
      const value = classes(label);
      const flags = [
        Number(props.showIcon), Number(props.blockNode), Number(props.checkable),
        Number(props.selectable), Number(props.disabled), String(props.multiple),
        String(props.focusable), String(props.defaultExpandParent), Object.is(props.treeData, data)
      ].join('-');
      return { ...value, root: `${value.root} ${label}-props-${flags}` };
    };
  }

  function semanticStyles(label: string): TreeConfig['styles'] {
    return sample.functions ? () => styles(label) : styles(label);
  }

  function load() {
    events = [...events, 'load'];
    return new Promise<void>(resolve => { pending = resolve; });
  }

  function finishLoad() {
    const finish = pending;
    data = [{ ...data[0], children: [{ key: 'loaded', title: 'Loaded', isLeaf: true }] }];
    finish?.();
  }
</script>

{#snippet emptyIcon()}{/snippet}
{#snippet target()}
  <section data-tree-semantic-host>
    {#if mounted}
      <Component treeData={data} defaultExpandedKeys={['root']}
        showIcon={sample.showIcon} blockNode={sample.blockNode}
        checkable={sample.checkable} disabled={sample.disabled}
        class={sample.local ? 'component-local' : undefined}
        rootClassName={sample.local ? 'root-extra' : undefined}
        classNames={localClasses} styles={localStyles}
        style={sample.localStyle ? 'padding-left:13px;color:rgb(71,81,91)' : undefined}
        loadData={sample.lazy ? load : undefined}
        onLoad={() => { events = [...events, 'loaded']; }}
        icon={sample.customIcon && !sample.nativeDefaultIcon ? emptyIcon : undefined}
        aria-label="Semantic target" bind:nativeElement={element} bind:this={tree} />
    {/if}
  </section>
{/snippet}

<section>
  <button type="button" onclick={() => { revision += 1; }}>Update tree semantics</button>
  <button type="button" onclick={() => { forcedContext = true; }}>Change pending component config</button>
  <button type="button" onclick={() => tree?.focus()}>Focus semantic tree</button>
  <button type="button" onclick={finishLoad}>Resolve semantic load</button>
  <button type="button" onclick={() => { open = true; }}>Open semantic select</button>
  <label><input type="checkbox" bind:checked={mounted} /> Mount semantic tree</label>
  <input aria-label="Semantic tree editor" value="Draft" />
  <output data-tree-semantic-ref>{element?.tagName ?? 'none'}</output>
  <pre data-tree-semantic-events>{JSON.stringify(events)}</pre>
</section>
<ConfigProvider prefixCls={sample.prefix} direction={sample.rtl ? 'rtl' : 'ltr'}
  theme={{ cssVar: {}, token: { motion: false } }}>
  <ConfigProvider tree={context}>
    {#if sample.scope}<ConfigProvider tree={inner}>{@render target()}</ConfigProvider>
    {:else}{@render target()}{/if}
    <section data-tree-semantic-select>
      <TreeSelect treeData={[{ value: 'pick', title: 'Select leaf', isLeaf: true }]}
        aria-label="Semantic select" {open} />
    </section>
  </ConfigProvider>
  <section data-tree-semantic-peer>
    <Tree treeData={baseData} defaultExpandedKeys={['root']} showIcon aria-label="Semantic peer" />
  </section>
</ConfigProvider>
