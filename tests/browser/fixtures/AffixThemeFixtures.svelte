<script lang="ts">
  import reference from './ant-design-affix-theme-reference.json';
  import AffixThemeCase from './AffixThemeCase.svelte';

  let preset = $state('component-overrides');
  let mounted = $state(true);
  let enabled = $state(true);
  let inherit = $state(true);
  let popup = $state<number>();
  let fontSize = $state<number>();
  let sample = $derived(reference.cases.find(item => item.name === preset)!);
</script>

<section id="affix-theme-fixture">
  <h2>Affix source theme</h2>
  <select aria-label="Affix theme preset" bind:value={preset}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select>
  <label><input type="checkbox" bind:checked={mounted} /> Mount themed Affix controls</label>
  <label><input type="checkbox" bind:checked={enabled} /> Apply source Affix theme</label>
  <label><input type="checkbox" bind:checked={inherit} /> Inherit Affix theme</label>
  <button type="button" onclick={() => { popup = 333; fontSize = 24; }}>Update Affix tokens</button>
  {#key preset}<AffixThemeCase {sample} {mounted} {enabled} {inherit} {popup} {fontSize} />{/key}
</section>
