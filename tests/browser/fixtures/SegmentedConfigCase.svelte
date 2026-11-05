<script lang="ts">
  import { ConfigProvider, type SegmentedConfig } from 'antd-svelte';
  import SegmentedConfigControl from './SegmentedConfigControl.svelte';
  import { segmentedConfigRecord, type SegmentedConfigSample } from './segmented-config-presets';

  let { sample, mounted = true, padding, enabled = true }: {
    sample: SegmentedConfigSample;
    mounted?: boolean;
    padding?: number;
    enabled?: boolean;
  } = $props();
  let context = $derived(segmentedConfigRecord('context' in sample ? sample.context : undefined, 'context'));
  let current = $derived<SegmentedConfig | undefined>(enabled ? {
    ...context,
    ...(padding === undefined ? {} : { style: `padding:${padding}px` })
  } : {});
</script>

{#if mounted}
  <ConfigProvider theme={{ token: { motion: false }, components: { Segmented: { trackPadding: 3 } } }}
    direction={'rtl' in sample && sample.rtl ? 'rtl' : 'ltr'}
    componentSize={'componentSize' in sample ? sample.componentSize as 'large' : undefined}
    segmented={current}>
    <SegmentedConfigControl {sample} id="normal" />
    <ConfigProvider><SegmentedConfigControl {sample} id="inherit" /></ConfigProvider>
    <ConfigProvider segmented={undefined}><SegmentedConfigControl {sample} id="undefined" /></ConfigProvider>
    <ConfigProvider segmented={{}}><SegmentedConfigControl {sample} id="empty" /></ConfigProvider>
    <ConfigProvider segmented={segmentedConfigRecord('object-style', 'nested')}>
      <SegmentedConfigControl {sample} id="replace" />
    </ConfigProvider>
  </ConfigProvider>
  <ConfigProvider theme={{ token: { motion: false } }}
    segmented={segmentedConfigRecord('object', 'sibling')}>
    <SegmentedConfigControl {sample} id="sibling" />
  </ConfigProvider>
{/if}
<SegmentedConfigControl {sample} id="outside" />
