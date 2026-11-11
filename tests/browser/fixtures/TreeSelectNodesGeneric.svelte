<script lang="ts">
  import { TreeSelect, TreeSelectTreeNode, type TreeSelectProps, type TreeSelectTreeNodeProps, type TreeEventNode } from 'antd-svelte';

  interface Entry {
    value: number;
    title: string;
    payload: { name: string; };
  }
  const options: TreeSelectProps<number, Entry> = {
    onSelect: (_value, node) => { node?.payload.name.toUpperCase(); },
    onChange: value => { value.toFixed(); }
  };
  const node: TreeSelectTreeNodeProps<Entry> = {
    value: 0, title: 'Typed declaration', payload: { name: 'zero' }, icon
  };
</script>

{#snippet icon(entry: TreeEventNode<Entry>)}{entry.payload.name}{entry.selected}{/snippet}
<TreeSelect {...options}>
  <TreeSelect.TreeNode {...node} />
  <TreeSelectTreeNode value={1} title="Named declaration" />
</TreeSelect>
