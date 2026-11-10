<script lang="ts">
  import { untrack } from 'svelte';
  import { createTree, type TreeFieldNames } from 'antd-svelte';
  import reference from './ant-design-tree-data-model-reference.json';

  let {
    data: initialData,
    fieldNames: initialFields,
    lookup = 'leaf'
  }: {
    data: readonly object[];
    fieldNames?: TreeFieldNames;
    lookup?: string;
  } = $props();
  let data = $state.raw(untrack(() => initialData));
  let fields = $state.raw(untrack(() => initialFields));
  let query = $state(untrack(() => lookup));
  const model = createTree(() => data, { get fieldNames() { return fields; } });
  const getPath = model.getPath;
  let path = $derived(getPath(query));
  let keys = $derived(path.map(entity => ({
    key: { type: typeof entity.key, value: String(entity.key) },
    pos: entity.pos,
    level: entity.level
  })));
</script>

<label>Tree model key<input data-model-key bind:value={query} /></label>
<input aria-label="Model editor" value="Draft" />
<button type="button" onclick={() => {
  data = reference.updateInputs.data;
  fields = undefined;
  query = 'leaf';
}}>Replace model data</button>
<button type="button" onclick={() => {
  data = reference.updateInputs.fieldsOnlyData;
  fields = undefined;
  query = 'oldLeaf';
}}>Use dual schema</button>
<button type="button" onclick={() => {
  fields = { key: 'id', title: 'caption' };
  query = 'leaf';
}}>Use id keys</button>
<output data-model-path>{JSON.stringify(keys)}</output>
<output data-model-stable>{String(getPath === model.getPath)}</output>
<output data-model-dual-data>{String(data === reference.updateInputs.fieldsOnlyData)}</output>
