<script lang="ts">
  import reference from './ant-design-listy-theme-reference.json';
  import ListyThemeCase from './ListyThemeCase.svelte';

  let preset = $state('component-aliases');
  let mounted = $state(true);
  let enabled = $state(true);
  let inherit = $state(true);
  let itemPaddingBlock = $state<number>();
  let itemPaddingInline = $state<number>();
  let fontSize = $state<number>();
  let sample = $derived(reference.cases.find(item => item.name === preset)!);
</script>

<section id="listy-theme-fixture">
  <h2>Listy source theme</h2>
  <select aria-label="Listy theme preset" bind:value={preset}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select>
  <label><input type="checkbox" bind:checked={mounted} /> Mount themed Listy controls</label>
  <label><input type="checkbox" bind:checked={enabled} /> Apply source Listy theme</label>
  <label><input type="checkbox" bind:checked={inherit} /> Inherit Listy theme</label>
  <button type="button" onclick={() => {
    itemPaddingBlock = 22;
    itemPaddingInline = 30;
    fontSize = 24;
  }}>Update Listy tokens</button>
  {#key preset}
    <ListyThemeCase {sample} {mounted} {enabled} {inherit}
      {itemPaddingBlock} {itemPaddingInline} {fontSize} />
  {/key}
</section>
