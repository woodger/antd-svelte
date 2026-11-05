<script lang="ts">
  import reference from './ant-design-statistic-theme-reference.json';
  import StatisticThemeCase from './StatisticThemeCase.svelte';

  let selected = $state('component-tokens');
  let sample = $derived(reference.cases.find(item => item.name === selected)!);
  let enabled = $state(true);
  let mounted = $state(true);
  let inherit = $state(true);
  let draft = $state(false);
  let contentFontSize = $state<number>();
</script>

<section id="statistic-theme-fixture">
  <h2>Source Statistic tokens</h2>
  <select aria-label="Statistic token preset" bind:value={selected}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select>
  <label><input type="checkbox" bind:checked={enabled} /> Apply source Statistic tokens</label>
  <label><input type="checkbox" bind:checked={inherit} /> Inherit child Statistic tokens</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount themed Statistics</label>
  <label><input type="checkbox" bind:checked={draft} /> Mount Statistic title draft</label>
  <button type="button" onclick={() => contentFontSize = 27}>Update Statistic content font</button>
  <StatisticThemeCase {sample} {enabled} {mounted} {inherit} {contentFontSize} {draft} />
</section>
