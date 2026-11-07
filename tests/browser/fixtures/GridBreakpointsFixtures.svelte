<script lang="ts">
  import { ConfigProvider, Row, Col } from 'antd-svelte';
  import GridBreakpointsCase from './GridBreakpointsCase.svelte';
  import { gridBreakpointsSampleKey, gridBreakpointsSamples } from './grid-breakpoints-presets';

  let selected = $state(gridBreakpointsSampleKey(gridBreakpointsSamples[0]));
  let sample = $derived(gridBreakpointsSamples.find(item =>
    gridBreakpointsSampleKey(item) === selected) ?? gridBreakpointsSamples[0]);
  let enabled = $state(true);
  let inherit = $state(true);
  let stateful = $state(false);
  let mounted = $state(true);
  let neighborMounted = $state(true);
</script>

<section id="grid-breakpoints-fixture" aria-label="Grid global breakpoint fixture">
  <label>Grid breakpoint case<select bind:value={selected}>
      {#each gridBreakpointsSamples as item}<option value={gridBreakpointsSampleKey(item)}>
          {gridBreakpointsSampleKey(item)}
        </option>{/each}
    </select></label>
  <label><input type="checkbox" bind:checked={enabled} /> Apply source Grid breakpoints</label>
  <label><input type="checkbox" bind:checked={inherit} /> Inherit Grid breakpoints</label>
  <label><input type="checkbox" bind:checked={stateful} /> Stateful Grid breakpoints</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount Grid breakpoints</label>
  <label><input type="checkbox" bind:checked={neighborMounted} /> Mount Grid breakpoint neighbor</label>
  <GridBreakpointsCase {sample} {enabled} {inherit} {stateful} {mounted} />
  {#if neighborMounted}
    <ConfigProvider theme={{ cssVar: { key: 'grid-breakpoints-shared' }, hashed: false, token: {
      screenXSMax: 639, screenSMMin: 640, screenSM: 640, screenSMMax: 799,
      screenMDMin: 800, screenMD: 800, motion: false
    } }}>
      <div id="grid-breakpoints-neighbor" style="width:640px;max-width:100%">
        <Row><Col md={6}>Neighbor</Col></Row>
      </div>
    </ConfigProvider>
  {/if}
</section>
