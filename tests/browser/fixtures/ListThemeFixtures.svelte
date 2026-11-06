<script lang="ts">
  import reference from './ant-design-list-theme-reference.json';
  import ListThemeCase from './ListThemeCase.svelte';

  let preset = $state('component-aliases');
  let mounted = $state(true);
  let enabled = $state(true);
  let inherit = $state(true);
  let itemPadding = $state<string>();
  let descriptionFontSize = $state<number>();
  let headerBg = $state<string>();
  let sample = $derived(reference.cases.find(item => item.name === preset)!);
</script>

<section id="list-theme-fixture">
  <h2>List source theme</h2>
  <select aria-label="List theme preset" bind:value={preset}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select>
  <label><input type="checkbox" bind:checked={mounted} /> Mount themed List controls</label>
  <label><input type="checkbox" bind:checked={enabled} /> Apply source List theme</label>
  <label><input type="checkbox" bind:checked={inherit} /> Inherit List theme</label>
  <button type="button" onclick={() => {
    itemPadding = '20px 12px';
    descriptionFontSize = 24;
    headerBg = '#efdbff';
  }}>Update List tokens</button>
  {#key preset}
    <ListThemeCase {sample} {mounted} {enabled} {inherit}
      {itemPadding} {descriptionFontSize} {headerBg} />
  {/key}
</section>
