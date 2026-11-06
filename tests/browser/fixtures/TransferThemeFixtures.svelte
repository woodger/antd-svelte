<script lang="ts">
  import reference from './ant-design-transfer-theme-reference.json';
  import TransferThemeCase from './TransferThemeCase.svelte';

  let preset = $state('component-aliases');
  let mounted = $state(true);
  let enabled = $state(true);
  let inherit = $state(true);
  let updated = $state(false);
  let sample = $derived(reference.cases.find(item => item.name === preset)!);
</script>

<section id="transfer-theme-fixture">
  <h2>Transfer source theme</h2>
  <select aria-label="Transfer theme preset" bind:value={preset}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select>
  <label><input type="checkbox" bind:checked={mounted} /> Mount themed Transfer controls</label>
  <label><input type="checkbox" bind:checked={enabled} /> Apply source Transfer theme</label>
  <label><input type="checkbox" bind:checked={inherit} /> Inherit Transfer theme</label>
  <button type="button" onclick={() => { updated = true; }}>Update Transfer tokens</button>
  {#key preset}
    <TransferThemeCase {sample} {mounted} {enabled} {inherit} {updated} />
  {/key}
</section>
