<script lang="ts">
  import reference from './ant-design-rate-theme-reference.json';
  import RateThemeCase from './RateThemeCase.svelte';

  let selected = $state('component-tokens');
  let sample = $derived(reference.cases.find(item => item.name === selected)!);
  let enabled = $state(true);
  let mounted = $state(true);
  let inherit = $state(true);
  let starSize = $state<number>();
</script>

<section id="rate-theme-fixture">
  <h2>Source Rate tokens</h2>
  <select aria-label="Rate token preset" bind:value={selected}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select>
  <label><input type="checkbox" bind:checked={enabled} /> Apply source Rate tokens</label>
  <label><input type="checkbox" bind:checked={inherit} /> Inherit child Rate tokens</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount themed Rate controls</label>
  <button type="button" onclick={() => starSize = 28}>Update Rate star size</button>
  <RateThemeCase {sample} {enabled} {mounted} {inherit} {starSize} />
</section>
