<script module lang="ts">
  export interface TreeSelectExpandActionSample {
    id: string;
    action: string;
    expandAction?: string | boolean;
    multiple?: boolean;
    checkable?: boolean;
    strict?: boolean;
    selectable?: boolean;
    disabledNode?: boolean;
    leaf?: boolean;
    modifier?: string;
    controlled?: string;
    expanded?: boolean;
    rtl?: boolean;
    aliases?: boolean;
    repeat?: boolean;
    update?: boolean;
    lazy?: boolean;
    empty?: boolean;
    search?: string;
  }
</script>

<script lang="ts">
  import { untrack } from 'svelte';
  import { ConfigProvider, TreeSelect, type TreeExpandAction, type TreeKey } from 'antd-svelte';

  let { sample, initialOpen = false }: {
    sample: TreeSelectExpandActionSample;
    initialOpen?: boolean;
  } = $props();
  let opened = $state(untrack(() => initialOpen));
  let expanded = $state.raw<TreeKey[]>(untrack(() => sample.expanded ? [0] : []));
  let action = $state(untrack(() => sample.expandAction));
  let actualAction = $derived<TreeExpandAction>(
    action === 'click' || action === 'doubleClick' ? action : false
  );
  let loaded = $state(false);
  let mounted = $state(true);
  let events = $state.raw<unknown[]>([]);
  let resolve: (() => void) | undefined;
  let element = $state<HTMLDivElement>();
  let input = $state<HTMLInputElement>();
  let field = $derived(sample.aliases ? 'code' : 'value');
  let label = $derived(sample.aliases ? 'caption' : 'title');
  let children = $derived(sample.aliases ? 'nodes' : 'children');
  let data = $derived<Record<string, unknown>[]>([
    {
      [field]: 0, [label]: 'Root', selectable: sample.selectable,
      disabled: sample.disabledNode, isLeaf: sample.leaf ? true : sample.lazy ? false : undefined,
      ...(!sample.leaf && (!sample.lazy || loaded) && (!sample.empty || loaded)
        ? { [children]: [{ [field]: 1, [label]: 'Child', isLeaf: true }] } : {})
    },
    { [field]: 2, [label]: 'Leaf', isLeaf: true }
  ]);
</script>

<section data-tree-select-expand-scope>
  <ConfigProvider direction={sample.rtl ? 'rtl' : 'ltr'} theme={{ token: { motion: false } }}>
    <div data-tree-select-data-control>
      {#if mounted}<TreeSelect aria-label="Title expansion" treeData={data}
        fieldNames={sample.aliases ? { value: field, label, children } : undefined}
        treeExpandAction={actualAction} multiple={sample.multiple ?? true}
        treeCheckable={sample.checkable} treeCheckStrictly={sample.strict}
        treeDefaultExpandedKeys={sample.expanded ? [0] : []}
        treeExpandedKeys={sample.controlled ? expanded : undefined}
        open={opened} showSearch={{ treeNodeFilterProp: label }}
        bind:nativeElement={element} bind:inputElement={input}
        onOpenChange={open => {
          events = [...events, { kind: 'open', open }];
          opened = open;
        }}
        onTreeExpand={keys => {
          events = [...events, { kind: 'expand', keys }];
          if (sample.controlled === 'accept') expanded = keys;
        }}
        onChange={(value, labels, extra) => {
          events = [...events, {
            kind: 'change', value: value ?? null, labels, triggerValue: extra.triggerValue
          }];
        }}
        onSelect={value => { events = [...events, { kind: 'select', value }]; }}
        onDeselect={value => { events = [...events, { kind: 'deselect', value }]; }}
        loadData={sample.lazy ? node => {
          events = [...events, { kind: 'load', key: node.key, expanded: node.expanded }];
          return new Promise<void>(finish => { resolve = finish; });
        } : undefined}
        onTreeLoad={keys => { events = [...events, { kind: 'loaded', keys }]; }} />{/if}
    </div>
  </ConfigProvider>
  <button onclick={() => { action = 'click'; }}>Enable title expansion</button>
  <button onclick={() => { loaded = true; resolve?.(); }}>Resolve title load</button>
  <button onclick={() => { mounted = false; }}>Unmount title control</button>
  <input aria-label="Title expansion outside draft" />
  <output data-tree-select-expand-events>{JSON.stringify(events)}</output>
  <output data-tree-select-expand-refs>{String(Boolean(element))}:{String(Boolean(input))}</output>
</section>
