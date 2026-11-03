<script lang="ts">
  import reference from './ant-design-menu-container-reference.json';
  import MenuContainerCase from './MenuContainerCase.svelte';
  import type { MenuContainerCase as ContainerCase } from './menu-container-presets';

  let name = $state(reference.cases[0].name);
  let sample = $derived(reference.cases.find(item => item.name === name)! as ContainerCase);
  let mounted = $state(true);
  let tree = $state(true);
  let revision = $state(0);
  let alternate = $state(false);
  let dark = $state(false);
  let hover = $state(false);
  let extraForce = $state(false);
  let disabled = $state(false);
  let link = $state(false);
  let calls = $state(0);
</script>

<section id="menu-container-fixture">
  <h2>Menu popup containers</h2>
  <label>Menu reference <select aria-label="Menu reference" bind:value={name}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount container menu</label>
  <label><input type="checkbox" bind:checked={tree} /> Mount menu tree</label>
  <label><input type="checkbox" bind:checked={alternate} /> Alternate menu container</label>
  <label><input type="checkbox" bind:checked={dark} /> Dark container menu</label>
  <label><input type="checkbox" bind:checked={hover} /> Hover container menu</label>
  <label><input type="checkbox" bind:checked={extraForce} /> Force container menu</label>
  <label><input type="checkbox" bind:checked={disabled} /> Disable container menu</label>
  <label><input type="checkbox" bind:checked={link} /> Link container leaf</label>
  <button type="button" onclick={() => revision++}>Refresh menu function</button>
  <input aria-label="Menu outside" />
  <output aria-label="Menu owner calls">{calls}</output>
  {#if tree}
    {#key name}
      <MenuContainerCase {sample} {mounted} {revision} {alternate} {dark} {hover} {extraForce}
        {disabled} {link} onCall={() => calls++} />
    {/key}
  {/if}
</section>
