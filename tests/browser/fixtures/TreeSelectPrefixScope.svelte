<script lang="ts">
  import { untrack } from 'svelte';
  import {
    TreeSelect, type TreeKey, type TreeSelectNode, type TreeSelectProps, type TreeSelectValue
  } from 'antd-svelte';

  export interface TreeSelectPrefixSample {
    id: string;
    prefix?: string;
    childPrefix?: string;
    variablePrefix?: string;
    local?: string;
    rtl?: boolean;
    aliases?: boolean;
    size?: TreeSelectProps['size'];
    variant?: TreeSelectProps['variant'];
    status?: TreeSelectProps['status'];
    disabled?: boolean;
    loading?: boolean;
    empty?: boolean;
    opened?: boolean;
    mode?: string;
    checkable?: boolean;
    portal?: boolean;
    lazy?: boolean;
  }
  let { sample, local = true }: { sample: TreeSelectPrefixSample; local?: boolean } = $props();
  const treeData = [{ value: 'p', title: 'Parent', children: [
    { value: 'a', title: 'Alpha' }, { value: 'b', title: 'Beta' },
    { value: 'd', title: 'Disabled', disabled: true }
  ] }, { value: 'c', title: 'Gamma' }];
  let value = $state<TreeSelectValue>(untrack(() =>
    sample.empty ? undefined : sample.mode ? ['b'] : 'b'));
  let events = $state<string[]>([]);
  let root = $state<HTMLDivElement>();
  let editor = $state<HTMLInputElement>();
  let target = $state<HTMLDivElement>();
  let lazyData = $state<TreeSelectNode[]>([{ value: 'pending', title: 'Pending', isLeaf: false }]);
  let expanded = $state<TreeKey[]>([]);
  let requests = $state(0);
  let resolvePending: (() => void) | undefined;

  function loadChildren() {
    requests++;

    return new Promise<void>(resolve => {
      resolvePending = () => {
        lazyData = [{ value: 'pending', title: 'Pending', children: [
          { value: 'child', title: 'Loaded child' }
        ] }];
        resolve();
      };
    });
  }
</script>

<form id="prefix-tree-choice-form">
  <TreeSelect prefixCls={local ? sample.local : undefined}
    treeData={sample.empty ? [] : sample.lazy ? lazyData : treeData} {value} name="choice"
    class="fixture-tree-select-prefix" style="width:280px"
    multiple={sample.mode === 'multiple'} treeCheckable={sample.checkable}
    treeDefaultExpandAll={!sample.lazy} treeExpandedKeys={sample.lazy ? expanded : undefined}
    loadData={sample.lazy ? loadChildren : undefined}
    onTreeLoad={keys => events.push(`loaded:${keys.join(',')}`)}
    size={sample.size} variant={sample.variant} status={sample.status}
    disabled={sample.disabled} loading={sample.loading} allowClear notFoundContent="No results"
    aria-label="Prefix choices" bind:nativeElement={root} bind:inputElement={editor}
    getPopupContainer={sample.portal ? () => target! : undefined}
    showSearch={{ filterTreeNode: false, onSearch: text => events.push(`search:${text}`) }}
    onChange={next => { value = next; events.push(`change:${JSON.stringify(next)}`); }}
    onSelect={next => events.push(`select:${next}`)} />
</form>
<div bind:this={target} data-tree-select-prefix-portal></div>
<output aria-label="TreeSelect prefix events">{events.join('|')}</output>
<output aria-label="TreeSelect prefix refs">{Boolean(root && editor && root.contains(editor))}</output>
{#if sample.lazy}
  <button type="button" onclick={() => expanded = ['pending']}>Start prefix load</button>
  <button type="button" onclick={() => resolvePending?.()}>Resolve prefix load</button>
  <output aria-label="TreeSelect prefix requests">{requests}</output>
{/if}
