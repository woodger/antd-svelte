<script lang="ts">
  import reference from './ant-design-descriptions-theme-reference.json';
  import DescriptionsThemeCase from './DescriptionsThemeCase.svelte';

  let selected = $state('reported');
  let sample = $derived(reference.cases.find(item => item.name === selected)!);
  let enabled = $state(true);
  let mounted = $state(true);
  let inherit = $state(true);
  let titleMarginBottom = $state<number>();
</script>

<section id="descriptions-theme-fixture">
  <h2>Source Descriptions tokens</h2>
  <select aria-label="Descriptions token preset" bind:value={selected}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select>
  <label><input type="checkbox" bind:checked={enabled} /> Apply source Descriptions tokens</label>
  <label><input type="checkbox" bind:checked={inherit} /> Inherit child Descriptions tokens</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount themed Descriptions</label>
  <button type="button" onclick={() => titleMarginBottom = 9}>Update Descriptions title margin</button>
  <DescriptionsThemeCase {sample} {enabled} {mounted} {inherit} {titleMarginBottom} />
</section>
