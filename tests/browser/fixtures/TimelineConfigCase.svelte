<script lang="ts">
  import { ConfigProvider, Timeline } from 'antd-svelte';
  import {
    timelineContextConfig, timelineConfigRecord, timelineLocalProps, timelineConfigItems,
    type TimelineConfigSample
  } from './timeline-config-cases';

  let { sample }: { sample: TimelineConfigSample } = $props();
  let context = $derived(timelineContextConfig(sample));
  let inner = $derived(timelineConfigRecord(sample.inner));
  let componentProps = $derived(timelineLocalProps(sample));
  let items = $derived(timelineConfigItems(sample));
</script>

{#snippet timeline(id: string)}
  <div data-timeline-config={id} data-timeline-prefix={id}
    data-prefix={id === 'sibling' ? 'ant-timeline' : sample.prefixCls || 'ant-timeline'}>
    <Timeline {...componentProps} {items} prefixCls={id === 'sibling' ? undefined : sample.prefixCls}
      titleSpan={sample.titleSpan} />
  </div>
{/snippet}

<ConfigProvider direction={sample.direction}
  theme={{ ...sample.theme, token: { motion: false, ...sample.theme?.token } }} timeline={context}>
  {@render timeline('normal')}
  <ConfigProvider timeline={inner}>{@render timeline('nested')}</ConfigProvider>
</ConfigProvider>
<ConfigProvider direction={sample.direction} theme={{ token: { motion: false } }}
  timeline={{ class: 'inner-sibling', style: 'padding:13px' }}>
  {@render timeline('sibling')}
</ConfigProvider>
