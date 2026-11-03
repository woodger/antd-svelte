<script lang="ts">
  import reference from './ant-design-picker-container-reference.json';
  import PickerContainerCase from './PickerContainerCase.svelte';
  import type { PickerContainerCase as ContainerCase } from './picker-container-presets';

  let name = $state(reference.cases[0].name);
  let sample = $derived(reference.cases.find(item => item.name === name)! as ContainerCase);
  let mounted = $state(true);
  let tree = $state(true);
  let revision = $state(0);
  let alternate = $state(false);
  let dark = $state(false);
  let disabled = $state(false);
  let calls = $state(0);
</script>

<section id="picker-container-fixture">
  <h2>Picker popup containers</h2>
  <label>Picker reference <select aria-label="Picker reference" bind:value={name}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount picker component</label>
  <label><input type="checkbox" bind:checked={tree} /> Mount picker tree</label>
  <label><input type="checkbox" bind:checked={alternate} /> Alternate picker container</label>
  <label><input type="checkbox" bind:checked={dark} /> Dark picker theme</label>
  <label><input type="checkbox" bind:checked={disabled} /> Disable container picker</label>
  <button type="button" onclick={() => revision++}>Refresh picker function</button>
  <input aria-label="Picker outside" />
  <output aria-label="Picker owner calls">{calls}</output>
  {#if tree}
    {#key name}
      <PickerContainerCase {sample} {mounted} {revision} {alternate} {dark} {disabled}
        onCall={() => calls++} />
    {/key}
  {/if}
</section>
