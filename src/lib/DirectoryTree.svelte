<script lang="ts">
  import { untrack } from 'svelte';
  import Tree from './Tree.svelte';
  import TreeIcon from './TreeIcon.svelte';
  import { useConfig } from './config-context';
  import { buildTreeEntities, expandTreeParents, treeLeaf } from './tree.engine';
  import { getDirectoryRangeKeys, getDirectorySelectedNodes } from './directory-tree.engine';
  import type { DirectoryTreeProps, TreeEventNode, TreeKey } from './tree.types';

  let {
    treeData = [],
    defaultExpandAll = false,
    defaultExpandParent = true,
    defaultExpandedKeys = [],
    expandedKeys,
    defaultSelectedKeys = [],
    selectedKeys,
    multiple = false,
    expandAction = 'click',
    showIcon = true,
    blockNode = true,
    icon,
    prefixCls: customizePrefixCls,
    class: className,
    onExpand,
    onSelect,
    nativeElement = $bindable(),
    ...props
  }: DirectoryTreeProps = $props();
  const config = useConfig();
  let prefix = $derived(config.getPrefixCls('tree', customizePrefixCls));
  let tree = $state<Tree>();
  let internalSelected = $state.raw<TreeKey[]>(untrack(() =>
    [...(selectedKeys ?? defaultSelectedKeys)]
  ));
  let internalExpanded = $state.raw<TreeKey[]>(untrack(() => {
    const index = buildTreeEntities(treeData);
    const keys = expandedKeys ?? defaultExpandedKeys;

    if (defaultExpandAll) return index.ordered.map(entry => entry.key);
    return defaultExpandParent ? expandTreeParents(keys, index) : [...keys];
  }));
  let actualSelected = $derived(selectedKeys ?? internalSelected);
  let actualExpanded = $derived(expandedKeys ?? internalExpanded);
  let lastSelectedKey: TreeKey | null = null;
  let cachedSelectedKeys: TreeKey[] | null = null;

  $effect.pre(() => {
    if (selectedKeys !== undefined) internalSelected = [...selectedKeys];
  });
  $effect.pre(() => {
    if (expandedKeys !== undefined) internalExpanded = [...expandedKeys];
  });

  const expand: NonNullable<DirectoryTreeProps['onExpand']> = (keys, info) => {
    if (expandedKeys === undefined) internalExpanded = keys;
    onExpand?.(keys, info);
  };
  const select: NonNullable<DirectoryTreeProps['onSelect']> = (keys, info) => {
    const { key } = info.node;
    const event = info.nativeEvent;
    const ctrl = event?.ctrlKey || event?.metaKey;
    let next: TreeKey[];

    if (multiple && ctrl) {
      next = keys;
      lastSelectedKey = key;
      cachedSelectedKeys = next;
    } else if (multiple && event?.shiftKey) {
      next = [...new Set([
        ...(cachedSelectedKeys ?? []),
        ...getDirectoryRangeKeys(treeData, actualExpanded, key, lastSelectedKey)
      ])];
    } else {
      next = [key];
      lastSelectedKey = key;
      cachedSelectedKeys = next;
    }
    onSelect?.(next, {
      ...info,
      selected: true,
      selectedNodes: getDirectorySelectedNodes(treeData, next)
    });

    if (selectedKeys === undefined) internalSelected = next;
  };

  export function focus(options?: FocusOptions) {
    tree?.focus(options);
  }

  export function blur() {
    tree?.blur();
  }
</script>

{#snippet directoryIcon(node: TreeEventNode)}
  <TreeIcon name={treeLeaf(node, Boolean(props.loadData), node.loaded) ? 'file'
    : node.expanded ? 'folder-open' : 'folder'} />
{/snippet}

<Tree {...props} {treeData} {multiple} {expandAction} {showIcon} {blockNode}
  icon={icon ?? directoryIcon} prefixCls={prefix} {defaultExpandParent}
  expandedKeys={actualExpanded} selectedKeys={actualSelected}
  onExpand={expand} onSelect={select} bind:nativeElement bind:this={tree}
  class={[`${prefix}-directory`, config.direction === 'rtl' && `${prefix}-directory-rtl`,
    className]} />
