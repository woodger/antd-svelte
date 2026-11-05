<script lang="ts">
  import SegmentedPrefixCase from './SegmentedPrefixCase.svelte';
  import { segmentedPrefixCases } from './segmented-prefix-presets';

  let selected = $state('tenant');
  let mounted = $state(true);
</script>

<section id="segmented-prefix-fixture">
  <h2>Segmented local prefixes</h2>
  <select aria-label="Segmented prefix preset" bind:value={selected}>
    {#each segmentedPrefixCases as sample}<option value={sample.name}>{sample.name}</option>{/each}
  </select>
  <label><input type="checkbox" bind:checked={mounted} /> Mount prefix Segmented controls</label>
  {#key selected}<SegmentedPrefixCase preset={selected} {mounted} />{/key}
</section>
