<script lang="ts" generics="Data extends object = TreeDataNode">
  import { onDestroy, tick, untrack } from 'svelte';
  import ThemeScopeStyle from './ThemeScopeStyle.svelte';
  import { getTreePrefixCss } from './tree-prefix.engine';
  import type {
    TreeProps,
    TreeBasicDataNode,
    TreeDataNode,
    TreeKey,
    TreeEventNode,
    TreeCheckedKeys,
    TreeScrollConfig
  } from './tree.types';
  import {
    buildTreeEntities,
    flattenTree,
    expandTreeParents,
    conductTreeCheck,
    toggleTreeCheck,
    parseTreeChecked,
    selectTreeKeys,
    treeLeaf,
    treeCheckDisabled,
    getTreeNodeTitle,
    type TreeEntity
  } from './tree.engine';
  import { createTreeLoader } from './tree-load.engine';
  import { treeSemantics } from './tree-semantic.engine';
  import { treeItemHeight } from './tree-virtual.engine';
  import { createTreeDrag } from './tree-drag.model.svelte';
  import { createTreeMotion } from './tree-motion.model.svelte';
  import type { TreeMotionRow } from './tree-motion.model.svelte';
  import { getTreeMotionConfig } from './tree-motion.engine';
  import TreeMotion from './TreeMotion.svelte';
  import { createVirtualList } from './virtual-list.model.svelte';
  import { connectListyGestures } from './listy-gestures.dom';
  import VirtualScrollbar from './ListyScrollbar.svelte';
  import { useDesignTokenContext } from './theme-context.svelte';
  import { useConfig } from './config-context';
  import { useComponentTheme } from './theme-component.svelte';
  import { useForm } from './form-context';
  import TreeIcon from './TreeIcon.svelte';
  import TreeTitle from './TreeTitle.svelte';
  type Entry = TreeEntity<Data & TreeBasicDataNode<Data>>;
  let {
    nativeElement = $bindable(),
    _themeStyle,
    _componentConfig = true,
    _nodeDisabled,
    ...componentProps
  }: TreeProps<Data> = $props();
  let {
    prefixCls: customizePrefixCls,
    treeData = [],
    fieldNames,
    expandedKeys,
    defaultExpandedKeys = [],
    defaultExpandAll = false,
    defaultExpandParent = true,
    autoExpandParent = false,
    expandAction = false,
    selectedKeys,
    defaultSelectedKeys = [],
    selectable = true,
    multiple = false,
    checkable = false,
    checkStrictly = false,
    checkedKeys,
    defaultCheckedKeys = [],
    disabled,
    motion: customMotion,
    draggable,
    allowDrop,
    onDragStart,
    onDragEnter,
    onDragOver,
    onDragLeave,
    onDragEnd,
    onDrop,
    loadedKeys,
    loadData,
    onExpand,
    onSelect,
    onCheck,
    onLoad,
    onClick,
    onDoubleClick,
    onRightClick,
    onMouseEnter,
    onMouseLeave,
    onActiveChange,
    activeKey,
    showIcon = false,
    showLine = false,
    blockNode = false,
    icon,
    switcherIcon,
    switcherLoadingIcon,
    titleRender,
    filterTreeNode,
    focusable = true,
    height,
    itemHeight,
    virtual,
    scrollWidth,
    itemScrollOffset = 0,
    onScroll,
    onscroll,
    class: className = '',
    rootClassName = '',
    classNames,
    styles,
    style,
    tabindex = 0,
    onkeydown,
    onfocus,
    onblur,
    ...attributes
  }: TreeProps<Data> = $derived(componentProps);
  const config = useConfig();
  let componentPrefix = $derived(config.getPrefixCls('tree', customizePrefixCls));
  let rootPrefix = $derived(config.getPrefixCls());
  let prefixCss = $derived(getTreePrefixCss(componentPrefix, rootPrefix));
  const componentTheme = useComponentTheme('Tree');
  const tokens = useDesignTokenContext();
  let themeStyle = $derived(_themeStyle ?? componentTheme.style);
  let motion = $derived(getTreeMotionConfig(customMotion, rootPrefix));
  const form = useForm();
  const generated = $props.id();
  let index = $derived(buildTreeEntities(treeData, fieldNames));
  let blocked = $derived(disabled ?? form?.disabled ?? config.componentDisabled);
  let context = $derived(_componentConfig ? config.tree : undefined);
  let semanticProps = $derived<TreeProps<Data>>({
    ...componentProps,
    // Только defaults Ant Tree wrapper; внутренние rc-tree defaults здесь не подставляются.
    showIcon,
    blockNode,
    checkable,
    selectable,
    disabled: blocked,
    motion
  });
  let semantic = $derived(treeSemantics(context, semanticProps));
  let classes = $derived(semantic.classes);
  let slots = $derived(semantic.styles);
  let expanded = $state.raw<TreeKey[]>(untrack(() => {
    const keys = expandedKeys
      ?? (defaultExpandAll
        ? index.ordered.filter(entry => entry.children.length).map(entry => entry.key)
        : defaultExpandedKeys);
    return autoExpandParent
      || defaultExpandParent
      && (expandedKeys !== undefined
        || !defaultExpandAll)
      ? expandTreeParents(keys, index)
      : [...keys];
  }));
  let selected = $state.raw<TreeKey[]>(
    untrack(
      () => [
        ...(multiple
          ? selectedKeys ?? defaultSelectedKeys
          : (selectedKeys ?? defaultSelectedKeys).slice(0, 1))
      ]
    )
  );
  let checked = $state.raw<TreeCheckedKeys>(untrack(() => {
    const initial = parseTreeChecked(checkedKeys ?? defaultCheckedKeys);
    return checkable && !checkStrictly
      ? conductTreeCheck(initial.checked, index)
      : checkable ? initial : { checked: [], halfChecked: [] };
  }));
  let loaded = $state.raw<TreeKey[]>([]);
  let loading = $state.raw<TreeKey[]>([]);
  let actualLoaded = $derived(loadedKeys ?? loaded);
  let checks = $derived(
    checkable
      ? checkStrictly ? checked : conductTreeCheck(checked.checked, index)
      : { checked: [], halfChecked: [] }
  );
  let visible = $derived(flattenTree(index, expanded));
  let holder = $state<HTMLDivElement>();
  let inner = $state<HTMLDivElement>();
  let indentMeasurer = $state<HTMLSpanElement>();
  const drag = createTreeDrag<Data>({
    props: () => ({
      draggable, allowDrop, onDragStart, onDragEnter, onDragOver, onDragLeave, onDragEnd,
      onDrop, onExpand
    }),
    index: () => index,
    visible: () => visible,
    expanded: () => expanded,
    setExpanded: keys => {
      if (expandedKeys === undefined) expanded = keys;
    },
    node: eventNode,
    disabled: () => blocked,
    indent: () => indentMeasurer?.offsetWidth ?? 0,
    rtl: () => config.direction === 'rtl'
  });
  const transition = createTreeMotion<Data & TreeBasicDataNode<Data>>({
    rows: () => visible,
    expanded: () => expanded,
    motion: () => motion,
    virtual: () => virtual ?? config.virtual,
    height: () => height,
    itemHeight: () => itemHeight ?? treeItemHeight(tokens.state.token),
    dragging: () => drag.draggingKey !== null
  });
  // Source передаёт motion instance вместо строки: virtual sentinel сохраняет itemHeight estimate.
  const viewport = createVirtualList<TreeMotionRow<Data & TreeBasicDataNode<Data>>, TreeKey | symbol>({
    rows: () => transition.rows,
    getKey: entry => entry.key,
    height: () => height,
    estimate: () => itemHeight ?? treeItemHeight(tokens.state.token),
    enabled: () => virtual ?? config.virtual ?? true,
    width: () => scrollWidth
  });
  let range = $derived(viewport.range);
  let rendered = $derived(transition.rows.slice(range.start, range.end + 1));
  let renderedNodes = $derived(rendered.flatMap(entry => 'motionNodes' in entry ? entry.motionNodes : [entry]));
  $effect(() => {
    const group = transition.group;
    if (group && !rendered.includes(group)) untrack(() => transition.finish(group.id));
  });
  $effect(() => {
    const element = holder;
    const content = inner;
    if (!element || !content) return;
    return untrack(() => viewport.connect(element, content));
  });
  $effect(() => {
    const element = holder;
    const useVirtual = range.useVirtual;
    const inVirtual = range.virtual;
    const width = scrollWidth;
    const rtl = config.direction === 'rtl';
    if (!element) return;
    return untrack(() => connectListyGestures(element, {
      useVirtual,
      virtual: inVirtual,
      top: () => viewport.top,
      maximum: () => (viewport.range.scrollHeight ?? NaN) - (height ?? NaN),
      scrollBy: viewport.scrollBy,
      horizontal: Boolean(width),
      rtl,
      left: () => viewport.left,
      maximumX: () => Math.max(0, (width ?? 0) - viewport.holderWidth),
      scrollByX: delta => viewport.scrollByX(rtl ? -delta : delta)
    }));
  });
  $effect(() => {
    void scrollWidth;
    untrack(() => viewport.syncLeft(viewport.left));
  });
  let current = $state<TreeKey | null>(null);
  let active = $derived(activeKey === undefined ? current : activeKey);
  let focused = $state(false);
  let focusElement = $state<HTMLDivElement>();
  let pointerFocus = false;
  let previous = untrack(
    () => ({ expandedKeys, autoExpandParent, selectedKeys, checkedKeys, treeData, fieldNames })
  );
  $effect(() => {
    const next = { expandedKeys, autoExpandParent, selectedKeys, checkedKeys, treeData, fieldNames };
    untrack(() => {
      if (next.expandedKeys !== previous.expandedKeys
        || next.autoExpandParent !== previous.autoExpandParent
        || autoExpandParent && next.fieldNames !== previous.fieldNames)
        expanded = autoExpandParent
          ? expandTreeParents(expandedKeys ?? expanded, index)
          : [...expandedKeys ?? expanded];
      if (next.selectedKeys !== previous.selectedKeys && selectedKeys !== undefined)
        selected = [...(multiple ? selectedKeys : selectedKeys.slice(0, 1))];
      if (checkable
        && (next.checkedKeys !== previous.checkedKeys
          || next.treeData !== previous.treeData
          || next.fieldNames !== previous.fieldNames)) {
        const parsed = parseTreeChecked(checkedKeys ?? checked);
        checked = checkStrictly ? parsed : conductTreeCheck(parsed.checked, index);
      }
      previous = next;
    });
  });
  const loader = createTreeLoader<Data>({
    load: node => loadData?.(node),
    fieldNames: () => fieldNames,
    loaded: () => actualLoaded,
    loading: () => loading,
    setLoading: keys => {
      loading = keys;
    },
    finish: (keys, node, success) => {
      if (success)
        onLoad?.(keys, { event: 'load', node });
      if (loadedKeys === undefined)
        loaded = keys;
    },
    fail: key => {
      if (expandedKeys === undefined)
        expanded = expanded.filter(item => item !== key);
    }
  });
  let disposed = false;
  onDestroy(() => {
    disposed = true;
    loader.dispose();
    drag.dispose();
    transition.dispose();
  });
  $effect(() => {
    if (!loadData) return;
    const pending = renderedNodes.filter(
      entry => expanded.includes(entry.key)
        && !treeLeaf(
          entry.node,
          true,
          actualLoaded.includes(entry.key),
          fieldNames
        )
        && !actualLoaded.includes(
          entry.key
        )
        && !loading.includes(
          entry.key
        )
        && !entry.children.length
    );
    untrack(() => {
      pending.forEach(entry => {
        void loader.load(eventNode(entry));
      });
    });
  });
  function eventNode(entry: Entry): TreeEventNode<Data> {
    return {
      ...entry.node,
      key: entry.key,
      expanded: expanded.includes(entry.key),
      selected: selected.includes(entry.key),
      checked: checks.checked.includes(entry.key),
      halfChecked: checks.halfChecked.includes(entry.key),
      loaded: actualLoaded.includes(entry.key),
      loading: loading.includes(entry.key),
      pos: entry.pos,
      active: active === entry.key,
      ...drag.flags(entry.key)
    };
  }
  function nodeId(key: TreeKey) {
    return `ant-tree-${generated}-${encodeURIComponent(String(key))}`;
  }
  function leaf(entry: Entry) {
    return treeLeaf(entry.node, Boolean(loadData), actualLoaded.includes(entry.key), fieldNames);
  }
  function setActive(key: TreeKey | null) {
    if (active === key) return;
    if (activeKey === undefined)
      current = key;
    onActiveChange?.(key);
    if (key !== null && height) viewport.scrollTo({ key, offset: itemScrollOffset });
    void tick().then(() => {
      if (key !== null && !height)
        focusElement?.ownerDocument.getElementById(nodeId(key))?.scrollIntoView(
          { block: 'nearest', inline: 'nearest' }
        );
    });
  }
  $effect(() => {
    const key = activeKey;
    if (key != null) untrack(() => {
      if (height) viewport.scrollTo({ key, offset: itemScrollOffset });
    });
  });
  function handleScroll(event: UIEvent & { currentTarget: EventTarget & HTMLDivElement; }) {
    if (disposed) return;
    if (event.currentTarget.scrollTop !== viewport.top) viewport.sync(event.currentTarget.scrollTop);
    (onScroll ?? onscroll)?.(event);
  }
  function expand(
    entry: Entry,
    event?: MouseEvent,
    snapshot?: TreeEventNode<Data>,
    fromTitle = false
  ) {
    // Selector rc-tree допускает collapse pending-ветки; switcher по-прежнему ждёт загрузку.
    // Title action сохраняет expanded keys узла без детей до обновления данных.
    if (transition.group || (fromTitle ? entry.node.isLeaf : leaf(entry))
      || event && !fromTitle && loading.includes(entry.key)) return;
    const node = snapshot ?? eventNode(entry);
    const next = node.expanded
      ? expanded.filter(key => key !== entry.key)
      : [...expanded, entry.key];
    if (expandedKeys === undefined)
      expanded = next;
    onExpand?.(next, { expanded: !node.expanded, node, nativeEvent: event });
    if (!node.expanded && loadData)
      void loader.load(node);
  }
  function select(entry: Entry, event?: MouseEvent, snapshot?: TreeEventNode<Data>) {
    if (blocked || entry.node.disabled || _nodeDisabled?.(entry.node)
      || !(entry.node.selectable ?? selectable)) return;
    const node = snapshot ?? eventNode(entry);
    const next = selectTreeKeys(selected, entry.key, multiple, snapshot?.selected);
    if (selectedKeys === undefined)
      selected = next;
    onSelect?.(next, {
      event: 'select',
      selected: !node.selected,
      node,
      selectedNodes: next.flatMap(key => {
        const item = index.entities.get(String(key));
        return item ? [item.node] : [];
      }),
      nativeEvent: event
    });
  }
  function check(
    entry: Entry,
    event?: MouseEvent,
    force?: boolean,
    snapshot?: TreeEventNode<Data>
  ) {
    if (!checkable || blocked || treeCheckDisabled(entry.node) || _nodeDisabled?.(entry.node)) return;
    const node = snapshot ?? eventNode(entry);
    const target = force ?? !node.checked;
    const next = checkStrictly
      ? {
        checked: target
          ? [...new Set([...checks.checked, entry.key])]
          : checks.checked.filter(key => key !== entry.key),
        halfChecked: checks.halfChecked.filter(key => key !== entry.key)
      }
      : toggleTreeCheck(entry.key, checks.checked, index, target);
    const entries = next.checked.flatMap(key => {
      const entity = index.entities.get(String(key));
      return entity ? [entity] : [];
    });
    if (checkedKeys === undefined)
      checked = {
        checked: next.checked,
        halfChecked: checkStrictly ? checked.halfChecked : next.halfChecked
      };
    onCheck?.(
      checkStrictly ? next : next.checked,
      {
        event: 'check',
        node,
        checked: target,
        nativeEvent: event,
        checkedNodes: entries.map(item => item.node),
        ...(!checkStrictly
          ? {
            halfCheckedKeys: next.halfChecked,
            checkedNodesPositions: entries.map(item => ({ node: item.node, pos: item.pos }))
          }
          : {})
      }
    );
  }
  function click(entry: Entry, event: MouseEvent) {
    if (draggable && event.detail) mouseFocus(event, true);
    const node = eventNode(entry);
    if (expandAction === 'click' && !event.ctrlKey && !event.metaKey && !event.shiftKey)
      expand(entry, event, node, true);
    onClick?.(event, node);
    const snapshot = expandAction ? node : undefined;
    if (entry.node.selectable ?? selectable)
      select(entry, event, snapshot); else check(entry, event, undefined, snapshot);
  }
  function doubleClick(entry: Entry, event: MouseEvent, node: TreeEventNode<Data>) {
    if (expandAction === 'doubleClick' && !event.ctrlKey && !event.metaKey && !event.shiftKey)
      expand(entry, event, node, true);
    onDoubleClick?.(event, node);
  }
  function focusIn(event: FocusEvent & { currentTarget: EventTarget & HTMLDivElement; }) {
    focused = true;
    if (!pointerFocus && active === null && !blocked)
      setActive(
        selected.find(key => visible.some(entry => entry.key === key)) ?? visible[0]?.key ?? null
      );
    onfocus?.(event);
  }
  function mouseFocus(event: Event, allowDrag = false) {
    if (!allowDrag) event.preventDefault();
    if (!blocked) {
      pointerFocus = true;
      focusElement?.focus({ preventScroll: true });
      pointerFocus = false;
    }
  }
  function handleDragClick(event: MouseEvent) {
    if (disposed || event.defaultPrevented || !(event.target instanceof Element)) return;
    const handle = event.target.closest('[data-ant-tree-drag-handle]');
    if (!handle) return;
    const control = event.target.closest(
      'button,input,select,textarea,a[href],[tabindex],[contenteditable]'
    );
    if (control && control !== event.currentTarget && handle.contains(control)) return;
    mouseFocus(event, true);
  }
  function keyboard(event: KeyboardEvent & { currentTarget: EventTarget & HTMLDivElement; }) {
    if (blocked || event.isComposing || event.defaultPrevented) return;
    const position = visible.findIndex(entry => entry.key === active);
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      const offset = event.key === 'ArrowDown' ? 1 : -1;
      const base = position < 0 && offset < 0 ? visible.length : position;
      setActive(
        visible.length ? visible[(base + offset + visible.length) % visible.length].key : null
      );
      event.preventDefault();
    }
    else if (event.key === 'Home' || event.key === 'End') {
      setActive((event.key === 'Home' ? visible[0] : visible.at(-1))?.key ?? null);
      event.preventDefault();
    }
    const entry = visible.find(item => item.key === active);
    if (entry) {
      if (event.key === 'ArrowLeft') {
        if (!leaf(entry) && expanded.includes(entry.key))
          expand(entry); else if (entry.parent)
          setActive(entry.parent.key);
        event.preventDefault();
      }
      else if (event.key === 'ArrowRight') {
        if (!leaf(entry) && !expanded.includes(entry.key))
          expand(entry); else if (entry.children.length)
          setActive(entry.children[0].key);
        event.preventDefault();
      }
      else if (event.key === 'Enter' || event.key === ' ') {
        if (event.key === 'Enter' && !leaf(entry)) {
          expand(entry);
          event.preventDefault();
        }
        else if (checkable && !treeCheckDisabled(entry.node)) {
          if (event.key === ' ' || !checks.checked.includes(entry.key)) {
            check(entry, undefined, event.key === 'Enter' ? true : undefined);
            event.preventDefault();
          }
        }
        else if (!checkable
          && selectable
          && !entry.node.disabled
          && entry.node.selectable !== false
          && (event.key === ' '
            || !selected.includes(
              entry.key
            ))) {
          select(entry);
          event.preventDefault();
        }
      }
    }
    onkeydown?.(event);
  }
  export function focus(options?: FocusOptions) {
    focusElement?.focus(options);
  }
  export function blur() {
    focusElement?.blur();
  }
  export function scrollTo(settings?: TreeScrollConfig | null) {
    if (disposed) return;
    if (settings && typeof settings === 'object' && 'key' in settings
      && settings.autoExpand && expandedKeys === undefined && !expanded.includes(settings.key)) {
      expanded = [...expanded, settings.key];
    }
    viewport.scrollTo(settings);
  }
</script>
<style>
  button[data-ant-tree-switcher], button[data-ant-tree-content] { padding:0;border:0;background:transparent;color:inherit;font:inherit; }
  button[data-ant-tree-content] { padding:0 var(--ant-padding-xs);text-align:inherit; }
  [data-ant-tree-list-inner] { display:flex;flex-direction:column; }
  [data-ant-tree-checkbox] { flex-shrink:0;padding:0;cursor:pointer; }
  /* Source TreeSelect использует рамку и фон checkbox из своего vendor scope. */
  [data-ant-tree-checkbox]:not(:where(.ant-tree-select-source-tree *)) { border:0;background:transparent; }
  [data-ant-tree-checkbox]:focus-visible { outline:2px solid var(--ant-color-primary); }
  [data-ant-tree-switcher]:focus-visible { outline:2px solid var(--ant-color-primary); }
</style>
{#snippet row(entry: Entry, nested = false)}
  {@const node = eventNode(entry)}
  {@const title = getTreeNodeTitle<Data>(entry.node, fieldNames, titleRender)}
  {@const isLeaf = leaf(entry)}
  {@const unavailable = blocked || Boolean(entry.node.disabled || _nodeDisabled?.(entry.node))}
  {@const hasCheck = checkable && entry.node.checkable !== false}
  {@const nodeDraggable = drag.draggable(entry)}
  <div id={nodeId(entry.key)} role="treeitem" tabindex={nodeDraggable && !unavailable ? -1 : undefined} aria-labelledby={`${nodeId(entry.key)}-title`} aria-level={entry.level + 1} aria-posinset={entry.index + 1} aria-setsize={entry.siblings} aria-expanded={isLeaf ? undefined : node.expanded} aria-selected={(entry.node.selectable ?? selectable) && !unavailable
      ? node.selected
      : undefined} aria-checked={hasCheck && !unavailable
          ? node.halfChecked ? 'mixed' : node.checked
          : undefined} aria-disabled={unavailable} aria-busy={node.loading || undefined}
    {@attach element => nested ? undefined : viewport.attach(element, entry.key)} class={[
        `${componentPrefix}-treenode`,
        `${componentPrefix}-treenode-switcher-${node.expanded ? 'open' : 'close'}`,
        unavailable && `${componentPrefix}-treenode-disabled`,
        node.selected && `${componentPrefix}-treenode-selected`,
        node.checked && `${componentPrefix}-treenode-checkbox-checked`,
        node.halfChecked && `${componentPrefix}-treenode-checkbox-indeterminate`,
        node.loading && `${componentPrefix}-treenode-loading`,
        active === entry.key && `${componentPrefix}-treenode-active`,
        nodeDraggable && `${componentPrefix}-treenode-draggable`,
        drag.draggingKey === entry.key && 'dragging',
        drag.target?.dropTargetKey === entry.key && 'drop-target',
        drag.target?.dropContainerKey === entry.key && 'drop-container',
        !unavailable && node.dragOver && 'drag-over',
        !unavailable && node.dragOverGapTop && 'drag-over-gap-top',
        !unavailable && node.dragOverGapBottom && 'drag-over-gap-bottom',
        isLeaf && `${componentPrefix}-treenode-leaf`,
        entry.ends.at(-1) && `${componentPrefix}-treenode-leaf-last`,
        filterTreeNode?.(node) && 'filter-node',
        entry.node.class,
        classes.item
      ]} style={[entry.node.style, slots.item].filter(Boolean).join(';') || undefined}
    draggable={draggable ? nodeDraggable && !unavailable : undefined}
    ondragstart={nodeDraggable && !unavailable ? event => {
      mouseFocus(event, true);
      drag.start(event, entry);
    } : undefined}
    ondragenter={nodeDraggable ? event => drag.enter(event, entry) : undefined}
    ondragover={nodeDraggable ? event => drag.over(event, entry) : undefined}
    ondragleave={nodeDraggable ? event => drag.leave(event, entry) : undefined}
    ondragend={nodeDraggable ? event => drag.end(event, entry) : undefined}
    ondrop={nodeDraggable ? event => drag.drop(event, entry) : undefined}
    onclick={nodeDraggable ? handleDragClick : undefined}
    onkeydown={nodeDraggable ? event => {
      if (event.target !== event.currentTarget) return;
      mouseFocus(event, true);
      if (activeKey === undefined) setActive(entry.key);
    } : undefined}>
    <span class={`${componentPrefix}-indent`} aria-hidden="true">{#each entry.ends.slice(0, -1) as end}<span class={[
        `${componentPrefix}-indent-unit`,
        !end && `${componentPrefix}-indent-unit-start`,
        end && `${componentPrefix}-indent-unit-end`
      ]}></span>{/each}</span>
    {#if draggable && !(typeof draggable === 'object' && draggable.icon === false)}
      <span data-ant-tree-drag-handle class={`${componentPrefix}-draggable-icon`}>
        {#if typeof draggable === 'object' && draggable.icon}{@render draggable.icon()}
        {:else}<TreeIcon name="holder" class="anticon-holder" />{/if}
      </span>
    {/if}
    {#if isLeaf}<span data-ant-tree-switcher class={[`${componentPrefix}-switcher ${componentPrefix}-switcher-noop`, classes.itemSwitcher]} style={slots.itemSwitcher} aria-hidden="true">{#if entry.node.switcherIcon}{@render entry.node.switcherIcon({ ...node, isLeaf })}{:else if showLine}{#if typeof showLine === 'object' && typeof showLine.showLeafIcon === 'function'}{@render showLine.showLeafIcon({ ...node, isLeaf })}{:else if typeof showLine === 'object' && showLine.showLeafIcon}<TreeIcon name="file" class={`${componentPrefix}-switcher-line-icon`} />{:else}<span class={`${componentPrefix}-switcher-leaf-line`}></span>{/if}{/if}</span>
    {:else}<button type="button" data-ant-tree-switcher tabindex="-1" class={[
        `${componentPrefix}-switcher`,
        `${componentPrefix}-switcher_${node.expanded ? 'open' : 'close'}`,
        classes.itemSwitcher
      ]} style={slots.itemSwitcher} aria-label={node.expanded
          ? config.locale.tree?.collapse ?? 'Collapse'
          : config.locale.tree?.expand ?? 'Expand'} aria-expanded={node.expanded} onmousedown={mouseFocus} onclick={event => expand(entry, event)}>{#if entry.node.switcherIcon}{@render entry.node.switcherIcon({ ...node, isLeaf })}{:else if node.loading}{#if switcherLoadingIcon}{@render switcherLoadingIcon(node)}{:else}<TreeIcon name="loading" class={`${componentPrefix}-switcher-loading-icon`} />{/if}{:else if switcherIcon}{@render switcherIcon({ ...node, isLeaf })}{:else}<TreeIcon name={showLine ? node.expanded ? 'minus' : 'plus' : 'caret'} class={showLine
            ? `${componentPrefix}-switcher-line-icon`
            : `${componentPrefix}-switcher-icon`} />{/if}</button>{/if}
    {#if hasCheck}<button type="button" data-ant-tree-checkbox role="checkbox" tabindex="-1" aria-checked={node.halfChecked ? 'mixed' : node.checked} aria-labelledby={`${nodeId(entry.key)}-title`} disabled={unavailable || entry.node.disableCheckbox} class={[
        `${componentPrefix}-checkbox`,
        node.checked && `${componentPrefix}-checkbox-checked`,
        node.halfChecked && `${componentPrefix}-checkbox-indeterminate`,
        (unavailable || entry.node.disableCheckbox) && `${componentPrefix}-checkbox-disabled`
      ]} onmousedown={mouseFocus} onclick={event => check(entry, event)}><span class={`${componentPrefix}-checkbox-inner`}></span></button>{/if}
    <button type="button" data-ant-tree-content tabindex="-1" class={[
        `${componentPrefix}-node-content-wrapper`,
        `${componentPrefix}-node-content-wrapper-${isLeaf
          ? 'normal'
          : node.expanded ? 'open' : 'close'}`,
        !unavailable && (node.selected || drag.highlightedKey === entry.key)
          && `${componentPrefix}-node-selected`
      ]} onmousedown={event => mouseFocus(event, nodeDraggable && !unavailable)} onclick={event => click(entry, event)} ondblclick={event => doubleClick(entry, event, node)} onmouseenter={event => {
          // Удержанный DOM-узел может получать события и после unmount.
          if (!disposed) onMouseEnter?.({ event, node });
        }} onmouseleave={event => {
          if (!disposed) onMouseLeave?.({ event, node });
        }} oncontextmenu={event => {
          if (onRightClick) {
            event.preventDefault();
            onRightClick({ event, node });
          }
        }}>
      {#if showIcon || loadData && node.loading}<span class={[
          `${componentPrefix}-iconEle`,
          `${componentPrefix}-icon__${isLeaf ? 'docu' : node.expanded ? 'open' : 'close'}`,
          node.loading && !(showIcon && (entry.node.icon || icon))
            && `${componentPrefix}-icon_loading`,
          classes.itemIcon
        ]} style={slots.itemIcon}>{#if showIcon && entry.node.icon}{@render entry.node.icon(node)}{:else if showIcon && icon}{@render icon(node)}{/if}</span>{/if}
      <span id={`${nodeId(entry.key)}-title`} class={[`${componentPrefix}-title`, classes.itemTitle]} style={slots.itemTitle}>{#if typeof title === 'function'}{@render title(entry.node)}{:else}<TreeTitle value={title} node={entry.node} />{/if}</span>
      {#if draggable && !entry.node.disabled && drag.target?.dragOverNodeKey === entry.key}
        <span class={`${componentPrefix}-drop-indicator`} style={drag.indicatorStyle}
          aria-hidden="true"></span>
      {/if}
    </button>
  </div>
{/snippet}
{#if prefixCss}<ThemeScopeStyle css={prefixCss} scope={`tree-prefix:${componentPrefix}:${rootPrefix}`} />{/if}<div data-ant-tree-root data-ant-tree-prefix={componentPrefix} data-ant-tree-root-prefix={rootPrefix} bind:this={nativeElement} class={[
    `${componentPrefix} ant-tree-css-var`,
    componentTheme.className,
    showLine && `${componentPrefix}-show-line`,
    !showIcon && `${componentPrefix}-icon-hide`,
    blockNode && `${componentPrefix}-block-node`,
    !selectable && `${componentPrefix}-unselectable`,
    blocked && `${componentPrefix}-disabled`,
    focused && `${componentPrefix}-focused`,
    config.direction === 'rtl' && `${componentPrefix}-rtl`,
    context?.class,
    className,
    classes.root,
    rootClassName
  ]} style={themeStyle ? [themeStyle, slots.root].filter(Boolean).join(';') : slots.root} dir={config.direction}>
  <div {...attributes} bind:this={focusElement} class={`${componentPrefix}-list`} style="position:relative" role="tree" tabindex={!blocked && focusable ? tabindex : undefined} aria-multiselectable={multiple || undefined} aria-disabled={blocked || undefined} aria-activedescendant={renderedNodes.some(entry => entry.key === active)
      ? nodeId(active!)
      : undefined} onkeydown={keyboard} onfocus={focusIn} onblur={event => {
          focused = false;
          onblur?.(event);
        }}>
    {#if draggable}<span bind:this={indentMeasurer} class={`${componentPrefix}-indent-unit`}
      aria-hidden="true" style="position:absolute;visibility:hidden;pointer-events:none"></span>{/if}
    <div bind:this={holder} class={`${componentPrefix}-list-holder`} role="presentation" onscroll={handleScroll}
      onmouseenter={viewport.flashScrollbar}
      style={height ? `max-height:${height}px;overflow-y:${range.useVirtual ? 'hidden' : 'auto'};overflow-anchor:none;${range.useVirtual && scrollWidth ? 'overflow-x:hidden;' : ''}${viewport.moving ? 'pointer-events:none' : ''}` : undefined}>
    <div style={range.offset !== undefined
      ? `height:${range.scrollHeight}px;position:relative;overflow:hidden` : undefined}>
    <div bind:this={inner} data-ant-tree-list-inner class={`${componentPrefix}-list-holder-inner`}
      style={`display:flex;flex-direction:column;${range.offset !== undefined
        ? `position:absolute;left:0;right:0;top:0;transform:translateY(${range.offset}px);${config.direction === 'rtl' ? 'margin-right' : 'margin-left'}:${-viewport.left}px` : ''}`}>
      {#each rendered as entry (entry.key)}
        {#if 'motionNodes' in entry}
          {#if motion}<TreeMotion prefixCls={componentPrefix} show={entry.show} {motion}
            enabled={tokens.state.token.motion !== false}
            onEnd={() => transition.finish(entry.id)}>
            {#each entry.motionNodes as child (child.key)}{@render row(child, true)}{/each}
          </TreeMotion>{/if}
        {:else}{@render row(entry)}{/if}
      {/each}
    </div>
    </div>
    </div>
    {#if range.virtual && (range.scrollHeight ?? 0) > (height ?? 0)}
      <VirtualScrollbar prefixCls={`${componentPrefix}-list`} rtl={config.direction === 'rtl'}
        offset={viewport.top} range={range.scrollHeight ?? 0} size={viewport.holderHeight}
        flash={viewport.flash} onScroll={viewport.sync}
        onMoving={value => { viewport.moving = value; }} />
    {/if}
    {#if range.virtual && (scrollWidth ?? 0) > viewport.holderWidth}
      <VirtualScrollbar prefixCls={`${componentPrefix}-list`} rtl={config.direction === 'rtl'} horizontal
        offset={viewport.left} range={scrollWidth ?? 0} size={viewport.holderWidth}
        flash={viewport.flash} onScroll={viewport.syncLeft}
        onMoving={value => { viewport.moving = value; }} />
    {/if}
  </div>
</div>
