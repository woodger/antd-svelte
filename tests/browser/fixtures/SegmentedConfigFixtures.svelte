<script lang="ts">
  import reference from './ant-design-segmented-config-reference.json';
  import SegmentedConfigCase from './SegmentedConfigCase.svelte';

  let selected = $state('context-style');
  let sample = $derived(reference.cases.find(item => item.name === selected)!);
  let mounted = $state(true);
  let enabled = $state(true);
  let padding = $state<number>();
</script>

<section id="segmented-config-fixture">
  <h2>Source Segmented config</h2>
  <select aria-label="Segmented config preset" bind:value={selected}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select>
  <label><input type="checkbox" bind:checked={mounted} /> Mount configured Segmented</label>
  <label><input type="checkbox" bind:checked={enabled} /> Apply Segmented context record</label>
  <button type="button" onclick={() => padding = 21}>Update Segmented context padding</button>
  <SegmentedConfigCase {sample} {mounted} {padding} {enabled} />
</section>
