<script lang="ts">
  import reference from './ant-design-popover-lifecycle-reference.json';
  import type { PopoverLifecycleCase as LifecycleSample } from './popover-lifecycle.types';
  import PopoverLifecycleCase from './PopoverLifecycleCase.svelte';

  const cases = reference.cases as readonly LifecycleSample[];
  let selected = $state(cases[0].name);
  let source = $state(true);
  let sample = $derived(cases.find(item => item.name === selected)!);
</script>

<section id="popover-lifecycle-fixture">
  <h2>Popover lifecycle options</h2>
  <label><input type="checkbox" bind:checked={source} /> Source lifecycle theme</label>
  <select aria-label="Popover lifecycle case" bind:value={selected}>
    {#each cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select>
  {#key sample.name}<PopoverLifecycleCase {sample} {source} />{/key}
  <div id="popover-lifecycle-container"></div>
</section>
