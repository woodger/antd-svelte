<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import DescriptionsBreakpointsScope, {
    type DescriptionsBreakpointsSample
  } from './DescriptionsBreakpointsScope.svelte';

  let { sample, scope = 'normal', enabled = true }: {
    sample: DescriptionsBreakpointsSample;
    scope?: string;
    enabled?: boolean;
  } = $props();
</script>

<ConfigProvider theme={enabled
  ? { cssVar: {}, token: { motion: false, ...sample.token } } : { mode: 'light', primary: 'blue' }}>
  {#if scope === 'nested'}
    <ConfigProvider><DescriptionsBreakpointsScope {sample} /></ConfigProvider>
  {:else if scope === 'reset'}
    <ConfigProvider theme={{ inherit: false, cssVar: {}, token: { motion: false } }}>
      <DescriptionsBreakpointsScope {sample} />
    </ConfigProvider>
  {:else}<DescriptionsBreakpointsScope {sample} />{/if}
</ConfigProvider>
