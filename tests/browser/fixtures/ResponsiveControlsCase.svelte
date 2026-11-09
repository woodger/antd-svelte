<script lang="ts">
  import { ConfigProvider, enUS } from 'antd-svelte';
  import ResponsiveControlsScope, { type ResponsiveControlsSample } from './ResponsiveControlsScope.svelte';

  let { sample, scope = 'normal', enabled = true, kind }: {
    sample: ResponsiveControlsSample;
    scope?: string;
    enabled?: boolean;
    kind?: 'masonry' | 'pagination';
  } = $props();
</script>

<ConfigProvider locale={enUS} theme={enabled ? {
  cssVar: {}, token: { motion: false, ...sample.token },
  components: sample.aliases ? { Pagination: { itemSize: 36, itemSizeSM: 18 } } : undefined
} : { mode: 'light', primary: 'blue' }}>
  {#if scope === 'nested'}
    <ConfigProvider><ResponsiveControlsScope {sample} {kind} /></ConfigProvider>
  {:else if scope === 'reset'}
    <ConfigProvider theme={{ inherit: false, cssVar: {}, token: { motion: false } }}>
      <ResponsiveControlsScope {sample} {kind} />
    </ConfigProvider>
  {:else}<ResponsiveControlsScope {sample} {kind} />{/if}
</ConfigProvider>
