<script lang="ts">
  import reference from './ant-design-badge-digit-motion-reference.json';
  import BadgeDigitCase from './BadgeDigitCase.svelte';
  import type { BadgeDigitCase as Sample } from './badge-digit-motion-presets';

  let name = $state(reference.cases[0].name);
  let sample = $derived(reference.cases.find(sample => sample.name === name)! as Sample);
  let motion = $state(false);
</script>

<section id="badge-digit-motion-fixture">
  <h2>Badge digit motion</h2>
  <label>Digit motion reference <select aria-label="Digit motion reference" bind:value={name}>
    {#each reference.cases as sample}<option value={sample.name}>{sample.name}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={motion} /> Enable digit motion</label>
  {#key name}<BadgeDigitCase {sample} {motion} />{/key}
</section>
