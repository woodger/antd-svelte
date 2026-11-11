<script lang="ts">
  import { untrack } from 'svelte';
  import { ConfigProvider, TreeSelect, type TreeSelectRef, type TreeSelectValue, type TreeSelectTokenSeparators } from 'antd-svelte';
  import type { TreeSelectTokenSample } from './tree-select-token-cases';
  let { sample }: { sample: TreeSelectTokenSample } = $props();
  let value = $state<TreeSelectValue>(untrack(() => sample.selected ? [...sample.selected] : undefined));
  let search = $state(untrack(() => sample.initialSearch ?? ''));
  let ownedOpen = $state<boolean | undefined>(untrack(() => sample.closeOnSearch ? true : undefined));
  let events = $state<unknown[][]>([]);
  let root = $state<HTMLDivElement>();
  let input = $state<HTMLInputElement>();
  let control = $state<TreeSelectRef>();
  function record(...event: unknown[]) { events = [...events, event]; }
  const split: TreeSelectTokenSeparators = text => {
    record('split', text);
    return sample.splitter === 'csv' ? text.split(',') : sample.splitter === 'lines'
      ? text.split(/[\r\n]+/) : sample.splitter === 'empty' ? [] : [text];
  };
  let separators = $derived(sample.splitter ? split : sample.separators);
</script>
<div data-tree-select-token-case={sample.id} data-tree-select-token-refs={Boolean(root && input)}>
  <ConfigProvider theme={{ cssVar: { key: 'tree-select-token-source' }, token: { motion: false } }}>
    <TreeSelect aria-label="Token tree" style="width:360px" bind:nativeElement={root} bind:inputElement={input} bind:this={control}
      {value} multiple={sample.multiple} treeCheckable={sample.checked} showCheckedStrategy={sample.strategy}
      defaultOpen={sample.defaultOpen} showAction={sample.reentrant ? ['focus'] : undefined}
      open={ownedOpen}
      maxCount={sample.maxCount} tokenSeparators={separators}
      treeData={[{ value: 'a', title: 'Alpha' }, { value: 'b', title: 'Beta' }]}
      showSearch={{ searchValue: sample.controlled ? search : undefined, filterTreeNode: false,
        onSearch: text => {
          record('search', text);
          if (sample.controlled === 'accept') search = text;
          if (sample.reentrant && text === '') { control?.blur(); control?.focus(); }
          if (sample.closeOnSearch && text === '') ownedOpen = false;
        } }}
      onChange={next => { value = next; record('change', next); }}
      onSelect={next => record('select', next)} onDeselect={next => record('deselect', next)}
      onOpenChange={next => { record('open', next); if (sample.closeOnSearch) ownedOpen = next; }} />
  </ConfigProvider>
  <output data-token-events>{JSON.stringify(events)}</output>
  <output data-token-values>{JSON.stringify(value ?? null)}</output>
  <output data-token-controlled>{JSON.stringify(search)}</output>
</div>
<button type="button">Outside token tree</button>
