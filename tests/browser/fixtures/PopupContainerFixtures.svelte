<script lang="ts">
  import reference from './ant-design-popup-container-reference.json';
  import PopupContainerCase from './PopupContainerCase.svelte';
  import type { PopupContainerCase as ContainerCase } from './popup-container-presets';

  let name = $state(reference.cases[0].name);
  let sample = $derived(reference.cases.find(item => item.name === name)! as ContainerCase);
  let mounted = $state(true);
  let revision = $state(0);
  let alternate = $state(false);
  let dark = $state(false);
</script>

<section id="popup-container-fixture">
  <h2>ConfigProvider popup containers</h2>
  <label>Container reference <select aria-label="Container reference" bind:value={name}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount container component</label>
  <label><input type="checkbox" bind:checked={alternate} /> Alternate parent container</label>
  <label><input type="checkbox" bind:checked={dark} /> Dark container theme</label>
  <button type="button" onclick={() => revision++}>Refresh container function</button>
  <input aria-label="Container outside" />
  {#key name}
    <PopupContainerCase {sample} {mounted} {revision} {alternate} {dark} />
  {/key}
</section>
