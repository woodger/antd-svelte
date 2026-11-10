<script lang="ts">
  import { TreeSelect, ConfigProvider, type TreeSelectFieldNames, type TreeSelectRawValue } from 'antd-svelte';
  interface Node {
    code: number;
    caption: string;
    value: 'raw';
    expanded: 'payload';
    props: { owner: string; };
    payload: { kind: 'branch'; total: number; } | { kind: 'leaf'; rank: number; };
    nodes?: Node[];
    isLeaf?: boolean;
  }
  const alpha: Node = { code: 1, caption: 'Alpha', value: 'raw', expanded: 'payload', props: { owner: 'alpha' },
    payload: { kind: 'leaf', rank: 1 }, isLeaf: true };
  const beta: Node = { ...alpha, code: 2, caption: 'Beta', props: { owner: 'beta' }, payload: { kind: 'leaf', rank: 2 } };
  const parent: Node = { ...alpha, code: 0, caption: 'Parent', payload: { kind: 'branch', total: 2 },
    props: { owner: 'parent' }, isLeaf: false, nodes: [alpha, beta] };
  let nodes = $state.raw<readonly Node[]>([parent]);
  let lazy = $state.raw<readonly Node[]>([{ ...parent, nodes: undefined }]);
  let value = $state<TreeSelectRawValue | undefined>(1);
  let fields = $state.raw<TreeSelectFieldNames>({ value: 'code', label: 'caption', children: 'nodes' });
  let records = $state.raw<unknown[]>([]);
  let loads = $state.raw<unknown[]>([]);
  let completed = $state(0);
  let mounted = $state(true);
  let resolve: (() => void) | undefined;
  let element = $state<HTMLDivElement>();
  let input = $state<HTMLInputElement>();
</script>

<section id="tree-select-data-generic-fixture">
  <ConfigProvider theme={{ token: { motion: false } }}>
    <TreeSelect aria-label="Generic data" name="generic" treeData={nodes} fieldNames={fields} {value}
      bind:nativeElement={element} bind:inputElement={input} treeDefaultExpandAll
      treeTitleRender={title} showSearch={{ treeNodeFilterProp: 'caption' }}
      onChange={next => { value = next; }}
      onSelect={(value, node) => {
        if (node) {
          const owner: string = node.props.owner;
          const raw: 'raw' = node.value;
          const originalState: 'payload' = node.expanded;
          records = [...records, { value, owner, raw, originalState,
            shared: node.payload === alpha.payload || node.payload === beta.payload,
            payload: node.payload }];
          node.caption = 'Consumer mutation';
        }
      }} />
    {#if mounted}<TreeSelect aria-label="Generic lazy data" treeData={lazy} fieldNames={fields}
      showSearch={{ treeNodeFilterProp: 'caption' }}
      loadData={node => {
        const canonical: boolean = node.expanded;
        const owner: string = node.props.owner;
        loads = [...loads, { key: node.key, canonical, owner, raw: node.value,
          payload: node.payload, shared: node.payload === parent.payload,
          titlePresent: Object.hasOwn(node, 'title') }];
        return new Promise<void>(finish => { resolve = finish; });
      }} onTreeLoad={() => { completed++; }} />{/if}
  </ConfigProvider>
  <input aria-label="Outside data draft" />
  <button onclick={() => { fields = { ...fields }; }}>Refresh data schema</button>
  <button onclick={() => {
    nodes = [{ ...parent, nodes: [{ ...alpha, caption: 'Alpha updated' }, beta] }];
  }}>Update generic labels</button>
  <button onclick={() => {
    lazy = [parent];
    resolve?.();
  }}>Resolve generic load</button>
  <button onclick={() => { mounted = false; }}>Unmount generic load</button>
  <output data-tree-select-generic-events>{JSON.stringify(records)}</output>
  <output data-tree-select-generic-loads>{JSON.stringify(loads)}</output>
  <output data-tree-select-generic-completed>{completed}</output>
  <output data-tree-select-generic-refs>{String(Boolean(element))}:{String(Boolean(input))}</output>
</section>
{#snippet title(node: Node)}
  {#if node.payload.kind === 'leaf'}{node.payload.rank}:{node.caption}{:else}{node.payload.total}:{node.caption}{/if}
{/snippet}
