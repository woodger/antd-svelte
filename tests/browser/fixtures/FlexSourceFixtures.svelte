<script lang="ts">
  import FlexSourceCase from './FlexSourceCase.svelte';
  import { flexSourceCases } from './flex-source-cases';

  let preset = $state('prefix-native');
  let mounted = $state(true);
  let alternate = $state(false);
</script>

<section id="flex-source-fixture">
  <h2>Source Flex API</h2>
  <label>Flex source preset <select bind:value={preset}>
    {#each flexSourceCases as sample}<option value={sample.name}>{sample.name}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount source Flex</label>
  <label><input type="checkbox" bind:checked={alternate} /> Alternate Flex config</label>
  {#key preset}<FlexSourceCase {preset} {mounted} {alternate} />{/key}
</section>
