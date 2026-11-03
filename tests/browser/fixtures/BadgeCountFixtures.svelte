<script lang="ts">
  import reference from './ant-design-badge-count-reference.json';
  import BadgeCountCase from './BadgeCountCase.svelte';
  import type { BadgeCountCase as Sample } from './badge-count-presets';

  let name = $state(reference.cases[0].name);
  let sample = $derived(reference.cases.find(sample => sample.name === name)! as Sample);
  let changed = $state(false);
  let dark = $state(false);
  let mounted = $state(true);
  let mode = $state<'case' | 'none' | 'string'>('case');
</script>

<section id="badge-count-fixture">
  <h2>Badge count values</h2>
  <label>Badge count reference <select aria-label="Badge count reference" bind:value={name}>
    {#each reference.cases as sample}<option value={sample.name}>{sample.name}</option>{/each}
  </select></label>
  <label>Badge count mode <select aria-label="Badge count mode" bind:value={mode}>
    <option value="case">Reference</option><option value="string">String</option>
    <option value="none">None</option>
  </select></label>
  <label><input type="checkbox" bind:checked={changed} /> Change Badge count props</label>
  <label><input type="checkbox" bind:checked={dark} /> Dark Badge count theme</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount Badge count</label>
  {#key name}<BadgeCountCase {sample} {changed} {dark} {mounted} {mode} />{/key}
</section>
