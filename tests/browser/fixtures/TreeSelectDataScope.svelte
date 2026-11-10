<script lang="ts">
  import { untrack } from 'svelte';
  import { ConfigProvider, TreeSelect, type TreeSelectFieldNames, type TreeSelectSimpleMode,
    type TreeSelectValue } from 'antd-svelte';
  import { treeSelectData, treeSelectAliasFields, type TreeSelectDataSample } from './tree-select-data-cases';

  let { sample }: { sample: TreeSelectDataSample } = $props();
  let data = $state.raw(untrack(() => treeSelectData(sample)));
  let inputBefore = $state(untrack(() => JSON.stringify(data)));
  let fields = $state.raw<TreeSelectFieldNames | undefined>(untrack(() => sample.fields));
  let simple = $state.raw<TreeSelectSimpleMode | undefined>(untrack(() => sample.simple));
  let value = $state.raw<TreeSelectValue>(untrack(() => sample.value as TreeSelectValue));
  let opened = $state(false);
  let events = $state.raw<unknown[]>([]);
  let rendererData = $state(true);
  let filterClone = $state(true);
  let element = $state<HTMLDivElement>();
  let input = $state<HTMLInputElement>();
  let mounted = $state(true);

  function update(nodes: Record<string, unknown>[]) {
    inputBefore = JSON.stringify(nodes);
    data = nodes;
  }
  function filter(_search: string, node: Record<string, unknown>) {
    const caption = node[fields?.label || 'title'];
    const original = data.find(item => item[fields?.value || 'value'] === node[fields?.value || 'value']);
    if (original && original === node) filterClone = false;
    node[fields?.label || 'title'] = 'Consumer mutation';
    return String(caption).includes('Alpha');
  }
  function rendered(node: Record<string, unknown>) {
    const payload = node.payload as { ordinal: number; } | undefined;
    if (!payload) { rendererData = false; return 'Missing data'; }
    return `${payload.ordinal}:${node[fields?.label || 'title']}`;
  }
</script>

<div style="width:360px;margin:64px">
  <ConfigProvider theme={{ token: { motion: false } }} direction={sample.rtl ? 'rtl' : 'ltr'}>
    <div data-tree-select-data-control>
      {#if mounted}<TreeSelect bind:nativeElement={element} bind:inputElement={input}
        aria-label="Data selection" name="selection" style="width:100%"
        treeData={data} fieldNames={fields} treeDataSimpleMode={simple}
        treeCheckable={sample.checkable} treeCheckStrictly={sample.strict} multiple={sample.multiple}
        labelInValue={sample.labeled} showCheckedStrategy={sample.strategy}
        treeNodeLabelProp={sample.labelProp} treeDefaultExpandAll open={opened}
        onOpenChange={next => { opened = next; }}
        value={sample.controlled ? value : undefined}
        defaultValue={sample.controlled ? undefined : sample.value as TreeSelectValue}
        showSearch={{ treeNodeFilterProp: sample.filterProp,
          filterTreeNode: sample.filter === 'off' ? false : sample.filter === 'custom' ? filter : undefined,
          onSearch: next => { events = [...events, { type: 'search', value: next }]; } }}
        treeTitleRender={sample.renderer ? title : undefined}
        onChange={(next, labels, extra) => {
          events = [...events, { type: 'change', value: next ?? null, labels, triggerValue: extra.triggerValue }];
          if (sample.controlled === 'accept') value = next;
        }}
        onSelect={(value, node) => { events = [...events, { type: 'select', value, node }]; }}
        onDeselect={(value, node) => { events = [...events, { type: 'deselect', value, node }]; }} />{/if}
    </div>
  </ConfigProvider>
</div>
{#snippet title(node: Record<string, unknown>)}{rendered(node)}{/snippet}
<div data-tree-select-data-controls>
  <button onclick={() => update(treeSelectData(sample, fields, 1, simple))}>Update data</button>
  <button onclick={() => {
    fields = treeSelectAliasFields;
    update(treeSelectData(sample, treeSelectAliasFields));
  }}>Update schema</button>
  <button onclick={() => {
    simple = false;
    update(treeSelectData(sample, fields, 0, false));
  }}>Nested data</button>
  <button onclick={() => { mounted = false; }}>Unmount data selection</button>
  <output data-tree-select-data-events>{JSON.stringify(events)}</output>
  <output data-tree-select-data-meta>{JSON.stringify({
    inputMutated: JSON.stringify(data) !== inputBefore, filterClone, rendererData
  })}</output>
  <output data-tree-select-data-refs>{String(Boolean(element))}:{String(Boolean(input))}</output>
</div>
