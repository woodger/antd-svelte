<script lang="ts">
  import { ConfigProvider, type ThemeConfig } from 'antd-svelte';
  import GridBreakpointsControl from './GridBreakpointsControl.svelte';
  import type { GridBreakpointsSample } from './grid-breakpoints-presets';

  let {
    sample,
    enabled = true,
    inherit = true,
    stateful = false,
    mounted = true
  }: {
    sample: GridBreakpointsSample;
    enabled?: boolean;
    inherit?: boolean;
    stateful?: boolean;
    mounted?: boolean;
  } = $props();
  let configured = $derived<ThemeConfig>(enabled ? {
    cssVar: {}, ...sample.config, token: { motion: false, ...sample.config.token }
  } : { mode: 'light', primary: 'blue' });
</script>

{#if mounted}
  <ConfigProvider theme={configured} direction={sample.direction === 'rtl' ? 'rtl' : 'ltr'}>
    {#if sample.scope === 'nested'}
      <ConfigProvider theme={{ inherit, components: { Grid: { fontSize: 16 } } }}>
        <GridBreakpointsControl {stateful} />
      </ConfigProvider>
    {:else if sample.scope === 'reset'}
      <ConfigProvider theme={{ inherit: false, token: { motion: false } }}>
        <GridBreakpointsControl {stateful} />
      </ConfigProvider>
    {:else}<GridBreakpointsControl {stateful} />{/if}
  </ConfigProvider>
{/if}
