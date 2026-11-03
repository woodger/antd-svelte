<script lang="ts">
  import reference from './ant-design-overlay-container-reference.json';
  import OverlayContainerCase from './OverlayContainerCase.svelte';
  import type { OverlayContainerCase as ContainerCase } from './overlay-container-presets';

  let name = $state(reference.cases[0].name);
  let sample = $derived(reference.cases.find(item => item.name === name)! as ContainerCase);
  let opened = $state(false);
  let mounted = $state(true);
  let revision = $state(0);
  let alternate = $state(false);
  let dark = $state(false);
  let componentTheme = $state(false);
  let tree = $state(true);
  let calls = $state(0);
</script>

<section id="overlay-container-fixture">
  <h2>Overlay popup containers</h2>
  <label>Overlay reference <select aria-label="Overlay reference" bind:value={name}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount overlay component</label>
  <label><input type="checkbox" bind:checked={tree} /> Mount overlay tree</label>
  <label><input type="checkbox" bind:checked={alternate} /> Alternate overlay container</label>
  <label><input type="checkbox" bind:checked={dark} /> Dark overlay theme</label>
  <label><input type="checkbox" bind:checked={componentTheme} /> Override overlay component theme</label>
  <button type="button" onclick={() => opened = true}>Open container overlay</button>
  <button type="button" onclick={() => revision++}>Refresh overlay function</button>
  <input aria-label="Overlay outside" />
  <output aria-label="Overlay owner calls">{calls}</output>
  {#if tree}
    {#key name}
      <OverlayContainerCase {sample} bind:opened {mounted} {revision} {alternate} {dark} {componentTheme}
        onCall={() => calls++} />
    {/key}
  {/if}
</section>
