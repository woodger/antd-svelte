<script lang="ts" generics="Data extends object = TreeSelectNode">
  import { onDestroy } from 'svelte';
  import type { TreeSelectNode, TreeSelectTreeNodeProps } from './tree-select.types';
  import { provideTreeSelectNodes, useTreeSelectNodes } from './tree-select-nodes.svelte';

  let { children, ...props }: TreeSelectTreeNodeProps<Data> = $props();
  const parent = useTreeSelectNodes();
  const nested = provideTreeSelectNodes();
  let element = $state<HTMLTemplateElement>();
  const release = parent?.register({
    get element() { return element; },
    read: () => {
      const children = nested.data;
      return { ...props, ...(children.length ? { children } : {}) };
    }
  });
  onDestroy(() => release?.());
</script>

{#if parent}<template bind:this={element}></template>{@render children?.()}{/if}
