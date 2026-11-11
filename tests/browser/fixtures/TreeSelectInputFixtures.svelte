<script lang="ts">
  import TreeSelectInputCase from './TreeSelectInputCase.svelte';
  import TreeSelectInputLifecycle from './TreeSelectInputLifecycle.svelte';
  import { treeSelectInputSamples } from './tree-select-input-cases';
  let selected = $state(treeSelectInputSamples[0].id);
  let sample = $derived(treeSelectInputSamples.find(sample => sample.id === selected));
</script>
<section id="tree-select-input-fixture">
  <label>TreeSelect input sample<select bind:value={selected}>
    {#each treeSelectInputSamples as sample}<option value={sample.id}>{sample.id}</option>{/each}
    <option value="native-lifecycle">Native lifecycle</option>
  </select></label>
  {#key selected}{#if sample}<TreeSelectInputCase {sample} />{:else}<TreeSelectInputLifecycle />{/if}{/key}
</section>
