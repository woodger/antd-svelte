<script lang="ts">
  import reference from './ant-design-calendar-theme-reference.json';
  import CalendarThemeCase from './CalendarThemeCase.svelte';

  let preset = $state('component-aliases');
  let mounted = $state(true);
  let enabled = $state(true);
  let inherit = $state(true);
  let updated = $state(false);
  let sample = $derived(reference.cases.find(item => item.name === preset)!);
</script>

<section id="calendar-theme-fixture">
  <h2>Calendar source theme</h2>
  <select aria-label="Calendar theme preset" bind:value={preset}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select>
  <label><input type="checkbox" bind:checked={mounted} /> Mount themed Calendar controls</label>
  <label><input type="checkbox" bind:checked={enabled} /> Apply source Calendar theme</label>
  <label><input type="checkbox" bind:checked={inherit} /> Inherit Calendar theme</label>
  <button type="button" onclick={() => { updated = true; }}>Update Calendar tokens</button>
  {#key preset}
    <CalendarThemeCase {sample} {mounted} {enabled} {inherit} {updated} />
  {/key}
</section>
