<script lang="ts">
  import OverlayLifecycleCase from './OverlayLifecycleCase.svelte';
  import reference from './ant-design-overlay-lifecycle-reference.json';
  import emptyTrigger from './ant-design-overlay-empty-trigger-reference.json';
  import type { OverlayLifecycleCase as Sample } from './overlay-lifecycle-presets';

  const cases = [...reference.cases, ...emptyTrigger.cases];
  let name = $state(cases[0].name);
  let changed = $state(false);
  let mounted = $state(true);
  let sliderMode = $state<'off' | 'single' | 'range' | 'pinned'>('off');
  let sample = $derived(cases.find(sample => sample.name === name)! as Sample);
</script>

<section id="overlay-lifecycle-fixture">
  <h2>Overlay content lifetime</h2>
  <label>Lifecycle reference <select bind:value={name} onchange={() => changed = false}>
    {#each cases as sample}<option value={sample.name}>{sample.name}</option>{/each}
  </select></label>
  <button type="button" onclick={() => changed = !changed}>Change lifecycle settings</button>
  <button type="button" onclick={() => mounted = !mounted}>Toggle lifecycle component</button>
  <label>Lifecycle Slider mode <select bind:value={sliderMode}>
    <option value="off">Off</option><option value="single">Single</option>
    <option value="range">Active range</option><option value="pinned">Pinned range</option>
  </select></label>
  {#key `${name}-${sliderMode}`}<OverlayLifecycleCase {sample} {changed} {mounted} {sliderMode} />{/key}
  <button type="button">After lifecycle popup</button>
</section>
