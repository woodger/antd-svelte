<script lang="ts">
  import DividerThemeCase from './DividerThemeCase.svelte';
  import { dividerThemePresets } from './divider-theme-presets';

  let preset = $state('default');
  let enabled = $state(true);
  let mounted = $state(true);
  let rtl = $state(false);
  let hashed = $state(true);
  let inherited = $state(true);
  let priority = $state(false);
  let padding = $state<number>();
</script>

<section id="divider-theme-fixture">
  <h2>Source Divider tokens</h2>
  <label>Divider token preset <select bind:value={preset}>
    {#each Object.keys(dividerThemePresets) as name}<option value={name}>{name}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={enabled} /> Apply source Divider tokens</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount themed Dividers</label>
  <label><input type="checkbox" bind:checked={rtl} /> Divider theme RTL</label>
  <label><input type="checkbox" bind:checked={hashed} /> Hash themed Dividers</label>
  <label><input type="checkbox" bind:checked={inherited} /> Inherit child Divider tokens</label>
  <label><input type="checkbox" bind:checked={priority} /> Divider theme style priority</label>
  <button type="button" onclick={() => padding = 30}>Set Divider text padding to thirty</button>
  <DividerThemeCase {preset} {enabled} {mounted} {rtl} {hashed} {inherited} {padding} {priority} />
</section>
