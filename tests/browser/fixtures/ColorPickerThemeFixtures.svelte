<script lang="ts">
  import reference from './ant-design-color-picker-theme-reference.json';
  import ColorPickerThemeCase from './ColorPickerThemeCase.svelte';

  let preset = $state('component-aliases');
  let mounted = $state(true);
  let enabled = $state(true);
  let inherit = $state(true);
  let updated = $state(false);
  let opened = $state('');
  let sample = $derived(reference.cases.find(item => item.name === preset)!);
</script>

<section id="color-picker-theme-fixture">
  <h2>ColorPicker source theme</h2>
  <select aria-label="ColorPicker theme preset" bind:value={preset}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select>
  <select aria-label="ColorPicker theme popup" bind:value={opened}>
    <option value="">Closed</option>
    {#each ['basic', 'rgb', 'hsb', 'gradient'] as mode}<option value={mode}>{mode}</option>{/each}
  </select>
  <label><input type="checkbox" bind:checked={mounted} /> Mount themed ColorPickers</label>
  <label><input type="checkbox" bind:checked={enabled} /> Apply source ColorPicker theme</label>
  <label><input type="checkbox" bind:checked={inherit} /> Inherit ColorPicker theme</label>
  <button type="button" onclick={() => { updated = true; }}>Update ColorPicker tokens</button>
  {#key preset}
    <ColorPickerThemeCase {sample} {mounted} {enabled} {inherit} {updated} {opened} />
  {/key}
</section>
