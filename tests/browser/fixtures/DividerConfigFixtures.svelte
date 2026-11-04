<script lang="ts">
  import DividerConfigCase from './DividerConfigCase.svelte';
  import { dividerConfigCases } from './divider-config-cases';

  let preset = $state('prefix-native');
  let mounted = $state(true);
  let alternate = $state(false);
</script>

<section id="divider-config-fixture">
  <h2>Divider prefix and config</h2>
  <label>Divider config preset <select bind:value={preset}>
    {#each dividerConfigCases as sample}<option value={sample.name}>{sample.name}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount configured Divider</label>
  <label><input type="checkbox" bind:checked={alternate} /> Alternate Divider config</label>
  {#key preset}<DividerConfigCase {preset} {mounted} {alternate} />{/key}
</section>
