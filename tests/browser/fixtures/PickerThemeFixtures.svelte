<script lang="ts">
  import reference from './ant-design-picker-theme-reference.json';
  import PickerThemeCase from './PickerThemeCase.svelte';

  let preset = $state('component-aliases');
  let mounted = $state(true);
  let enabled = $state(true);
  let inherit = $state(true);
  let updated = $state(false);
  let opened = $state('');
  let header = $state('normal');
  let sample = $derived(reference.cases.find(item => item.name === preset)!);
</script>

<section id="picker-theme-fixture">
  <h2>Picker source theme</h2>
  <select aria-label="Picker theme preset" bind:value={preset}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select>
  <select aria-label="Picker datetime header" bind:value={header}>
    {#each ['normal', 'default', 'empty', 'minutes', '12-hours'] as mode}
      <option value={mode}>{mode}</option>
    {/each}
  </select>
  <select aria-label="Picker theme popup" bind:value={opened}>
    <option value="">Closed</option>
    {#each ['date', 'datetime', 'range', 'datetime-range', 'time', 'time-range'] as mode}
      <option value={mode}>{mode}</option>
    {/each}
  </select>
  <label><input type="checkbox" bind:checked={mounted} /> Mount themed pickers</label>
  <label><input type="checkbox" bind:checked={enabled} /> Apply source Picker theme</label>
  <label><input type="checkbox" bind:checked={inherit} /> Inherit Picker theme</label>
  <button type="button" onclick={() => { updated = true; }}>Update Picker tokens</button>
  {#key `${preset}:${header}`}
    <PickerThemeCase {sample} {mounted} {enabled} {inherit} {updated} {opened} {header} />
  {/key}
</section>
