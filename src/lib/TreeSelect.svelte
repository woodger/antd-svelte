<script lang="ts" generics="ValueType extends TreeSelectValue = TreeSelectValue, Data extends object = TreeSelectNode, RootElement extends HTMLElement = HTMLDivElement, EditorElement extends TreeSelectEditorElement = HTMLInputElement">
  import type { TreeSelectNode, TreeSelectProps, TreeSelectRef, TreeSelectValue } from './tree-select.types';
  import type { TreeScrollConfig } from './tree.types';
  import type { TreeSelectEditorElement } from './tree-select-components.types';
  import { provideTreeSelectNodes } from './tree-select-nodes.svelte';
  import TreeSelectControl from './TreeSelectControl.svelte';

  let {
    nativeElement = $bindable(),
    inputElement = $bindable(),
    ...props
  }: TreeSelectProps<ValueType, Data, RootElement, EditorElement> = $props();
  const nodes = provideTreeSelectNodes();
  let control = $state<TreeSelectRef>();

  export function focus(options?: FocusOptions) { control?.focus(options); }
  export function blur() { control?.blur(); }
  export function scrollTo(settings?: TreeScrollConfig | null) { control?.scrollTo(settings); }
</script>

{#snippet field()}
  {@const declared = nodes.data as unknown as readonly Data[]}
  <TreeSelectControl {...props} _nodes={declared} bind:nativeElement bind:inputElement bind:this={control} />
{/snippet}

{#if props.treeData == null && props.children}
  <div hidden data-ant-tree-select-declarations {@attach nodes.observe}>{@render props.children()}</div>
{/if}
{@render field()}
