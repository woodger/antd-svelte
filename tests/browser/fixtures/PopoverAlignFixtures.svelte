<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import reference from './ant-design-popover-align-reference.json';
  import type { PopoverAlignmentCase } from './popover-align.types';
  import PopoverAlignCase from './PopoverAlignCase.svelte';

  const cases = reference.cases as readonly PopoverAlignmentCase[];
  let selected = $state(cases[0].name);
  let source = $state(true);
  let mounted = $state(true);
  let totalCalls = $state(0);
  let sample = $derived(cases.find(item => item.name === selected)!);

  function recordAlignment() {
    totalCalls++;
  }
</script>

<style>
  :global(html:has(#popover-align-fixture)) { scrollbar-width:none; }
  #popover-align-fixture { min-height:1600px; }
</style>

<section id="popover-align-fixture">
  <h2>Popover alignment options</h2>
  <label><input type="checkbox" bind:checked={source} /> Source alignment config</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount alignment popup</label>
  <output aria-label="Total alignment calls">{totalCalls}</output>
  <select aria-label="Popover alignment case" bind:value={selected}>
    {#each cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select>
  <ConfigProvider theme={source ? { cssVar: {}, token: { motion: false } }
    : { mode: 'light', primary: 'blue' }} popover={source ? {} : undefined}
    popconfirm={source ? {} : undefined} direction={sample.rtl ? 'rtl' : 'ltr'}>
    {#if mounted}{#key sample.name}<PopoverAlignCase {sample} onAlign={recordAlignment} />{/key}{/if}
  </ConfigProvider>
</section>
