<script lang="ts">
  import reference from './ant-design-tree-virtual-reference.json' with { type: 'json' };
  import TreeVirtualScope from './TreeVirtualScope.svelte';
  import type { TreeVirtualSample } from './TreeVirtualScope.svelte';
  let selected = $state(0);
  const samples: TreeVirtualSample[] = [
    ...reference.cases.map(entry => entry.sample),
    ...reference.observations.map(entry => entry.sample),
    { id: 'lazy-window', height: 112, lazy: true, actions: [
      { kind: 'scroll', config: { key: 40, align: 'top' } }
    ] }
  ];
</script>

<section id="tree-virtual-fixture">
  <label>Tree virtual sample<select bind:value={selected}>
    {#each samples as sample, index}<option value={index}>{sample.id}</option>{/each}
  </select></label>
  {#key selected}<TreeVirtualScope sample={samples[selected]} />{/key}
</section>
