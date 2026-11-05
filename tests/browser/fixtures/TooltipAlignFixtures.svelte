<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import reference from './ant-design-tooltip-align-reference.json';
  import type { TooltipAlignmentCase } from './tooltip-align.types';
  import TooltipAlignCase from './TooltipAlignCase.svelte';
  import TooltipAlignConsumers from './TooltipAlignConsumers.svelte';

  const cases = reference.cases as readonly TooltipAlignmentCase[];
  let selected = $state(cases[0].name);
  let source = $state(true);
  let consumer = $state('tooltip');
  let sample = $derived(cases.find(item => item.name === selected)!);
</script>

<style>
  :global(html:has(#tooltip-align-fixture)) { scrollbar-width:none; }
  #tooltip-align-fixture { min-height:1600px; }
</style>

<section id="tooltip-align-fixture">
  <h2>Tooltip alignment options</h2>
  <label><input type="checkbox" bind:checked={source} /> Source alignment config</label>
  <select aria-label="Tooltip alignment case" bind:value={selected}>
    {#each cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select>
  <select aria-label="Alignment consumer mode" bind:value={consumer}>
    <option value="tooltip">Tooltip</option>
    <option value="single">Single Slider</option>
    <option value="range">Range Slider</option>
    <option value="pinned">Pinned range Slider</option>
    <option value="typography">Typography</option>
  </select>
  <ConfigProvider theme={source ? { cssVar: {}, token: { motion: false } }
    : { mode: 'light', primary: 'blue' }} tooltip={source ? {} : undefined}
    direction={sample.rtl ? 'rtl' : 'ltr'}>
    {#if consumer === 'tooltip'}
      {#key sample.name}<TooltipAlignCase {sample} />{/key}
    {:else}
      {#key consumer}<TooltipAlignConsumers mode={consumer} />{/key}
    {/if}
  </ConfigProvider>
</section>
