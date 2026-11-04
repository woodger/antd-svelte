<script lang="ts">
  import { Slider } from 'antd-svelte';
  import OverlayCornerCase from './OverlayCornerCase.svelte';
  import reference from './ant-design-overlay-options-reference.json';
  import type { OverlayCornerCase as Sample } from './overlay-corner-presets';

  let name = $state(reference.cases[0].name);
  let step = $state(0);
  let mounted = $state(true);
  let native = $state(false);
  let sample = $derived(reference.cases.find(sample => sample.name === name)! as Sample);
</script>

<section id="overlay-options-fixture">
  <h2>Overlay arrow and overflow</h2>
  <label>Options reference <select bind:value={name} onchange={() => step = 0}>
    {#each reference.cases as sample}<option value={sample.name}>{sample.name}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={native} /> Native options defaults</label>
  <button type="button" onclick={() => step++}>Next options frame</button>
  <button type="button" onclick={() => mounted = !mounted}>Toggle options component</button>
  <output aria-label="Options frame">{step}</output>
  {#if mounted}{#key name}<OverlayCornerCase {sample} {step} {native} />{/key}{/if}

  <div aria-label="Range arrow options" style="position:fixed;left:200px;top:240px;width:200px">
    <Slider range defaultValue={[25, 75]} tooltip={{
      placement: 'topLeft',
      arrow: { pointAtCenter: true },
      autoAdjustOverflow: { adjustX: 0, adjustY: 0 },
      formatter: value => `Range ${value}`
    }} />
  </div>
</section>
