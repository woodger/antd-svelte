<script lang="ts">
  import { untrack } from 'svelte';
  import { ConfigProvider, TreeSelect, type TreeSelectValue } from 'antd-svelte';
  import type { TreeSelectMaxCountSample } from './tree-select-max-count-cases';

  let { sample, initialOpen = false }: {
    sample: TreeSelectMaxCountSample;
    initialOpen?: boolean;
  } = $props();
  let nodes = $state.raw(untrack(() => sample.data));
  let inputBefore = $state(untrack(() => JSON.stringify(sample.data)));
  let value = $state.raw<TreeSelectValue>(untrack(() => sample.value));
  let limit = $state(untrack(() => sample.maxCount));
  let opened = $state(untrack(() => initialOpen));
  let mounted = $state(true);
  let events = $state.raw<unknown[]>([]);
  let payloadShared = $state(true);
  let element = $state<HTMLDivElement>();
  let input = $state<HTMLInputElement>();
  let field = $derived(sample.aliases ? 'code' : 'value');
  let caption = $derived(sample.aliases ? 'caption' : 'title');
  let children = $derived(sample.aliases ? 'nodes' : 'children');

  function find(value: unknown, list = nodes): Record<string, unknown> | undefined {
    for (const node of list) {
      if (node[field] === value) return node;
      const nested = node[children];
      if (Array.isArray(nested)) {
        const child = find(value, nested);
        if (child) return child;
      }
    }
  }

  function recordNode(node?: Record<string, unknown>) {
    if (node) payloadShared &&= node.payload === find(node[field])?.payload;
    return { value: node?.[field], title: node?.[caption], disabled: node?.disabled ?? null,
      payload: node?.payload ?? null };
  }
</script>

<section data-tree-select-max-count-scope>
  <form data-tree-select-max-count-form onsubmit={event => event.preventDefault()}>
  <ConfigProvider direction={sample.rtl ? 'rtl' : 'ltr'} theme={{ token: { motion: false } }}>
    <div data-tree-select-data-control>
      {#if mounted}<TreeSelect aria-label="Limited tree selection" name="limited" treeData={nodes}
        fieldNames={sample.aliases ? { value: field, label: caption, children } : undefined}
        treeDataSimpleMode={sample.simple} maxCount={limit} allowClear treeDefaultExpandAll
        treeExpandAction={sample.expandAction} multiple={sample.multiple ?? true}
        treeCheckable={sample.checkable} treeCheckStrictly={sample.strict}
        labelInValue={sample.labeled || sample.strict} showCheckedStrategy={sample.strategy}
        open={opened} onOpenChange={open => { opened = open; }}
        value={sample.controlled ? value : undefined}
        defaultValue={sample.controlled ? undefined : sample.value}
        showSearch={{ treeNodeFilterProp: caption }}
        bind:nativeElement={element} bind:inputElement={input}
        onChange={(next, labels, extra) => {
          events = [...events, { kind: 'change', value: next ?? null, labels,
            triggerValue: extra.triggerValue }];
          if (sample.controlled === 'accept') value = next;
        }}
        onSelect={(value, node) => {
          events = [...events, { kind: 'select', value, node: recordNode(node) }];
        }}
        onDeselect={(value, node) => {
          events = [...events, { kind: 'deselect', value, node: recordNode(node) }];
        }}
        onClear={() => { events = [...events, { kind: 'clear' }]; }}
        onTreeExpand={keys => { events = [...events, { kind: 'expand', keys }]; }} />{/if}
    </div>
  </ConfigProvider>
  </form>
  <button onclick={() => { limit = sample.nextMaxCount; }}>Update selection limit</button>
  <button onclick={() => {
    if (sample.nextData) {
      nodes = sample.nextData;
      inputBefore = JSON.stringify(nodes);
    }
  }}>Update limited data</button>
  <button onclick={() => { mounted = false; }}>Unmount limited control</button>
  <input aria-label="Limited selection outside draft" />
  <output data-tree-select-max-count-events>{JSON.stringify(events)}</output>
  <output data-tree-select-max-count-refs>{String(Boolean(element))}:{String(Boolean(input))}</output>
  <output data-tree-select-max-count-integrity>{JSON.stringify({
    payloadShared, inputMutated: JSON.stringify(nodes) !== inputBefore
  })}</output>
</section>
