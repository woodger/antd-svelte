<script lang="ts">
  import reference from './ant-design-typography-theme-reference.json';
  import TypographyThemeCase from './TypographyThemeCase.svelte';

  let preset = $state('component-aliases');
  let mounted = $state(true);
  let enabled = $state(true);
  let inherit = $state(true);
  let fontSize = $state<number>();
  let top = $state<number>();
  let bottom = $state<number>();
  let sample = $derived(reference.cases.find(item => item.name === preset)!);
</script>

<section id="typography-theme-fixture">
  <h2>Typography source theme</h2>
  <select aria-label="Typography theme preset" bind:value={preset}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select>
  <label><input type="checkbox" bind:checked={mounted} /> Mount themed Typography controls</label>
  <label><input type="checkbox" bind:checked={enabled} /> Apply source Typography theme</label>
  <label><input type="checkbox" bind:checked={inherit} /> Inherit Typography theme</label>
  <button type="button" onclick={() => {
    fontSize = 24;
    top = 26;
    bottom = 14;
  }}>Update Typography tokens</button>
  {#key preset}<TypographyThemeCase {sample} {mounted} {enabled} {inherit} {fontSize} {top} {bottom} />{/key}
</section>
