<script lang="ts">
  import TreeSelectTokenCase from './TreeSelectTokenCase.svelte';
  import TreeSelectTokenLifecycle from './TreeSelectTokenLifecycle.svelte';
  import { treeSelectTokenSamples } from './tree-select-token-cases';
  let selected = $state(treeSelectTokenSamples[0].id);
  let sample = $derived(treeSelectTokenSamples.find(sample => sample.id === selected));
</script>
<section id="tree-select-token-fixture">
  <label>TreeSelect token sample<select bind:value={selected}>
    {#each treeSelectTokenSamples as sample}<option value={sample.id}>{sample.id}</option>{/each}
    <option value="native-lifecycle">Native lifecycle</option>
  </select></label>
  {#key selected}{#if sample}<TreeSelectTokenCase {sample} />{:else}<TreeSelectTokenLifecycle />{/if}{/key}
</section>
