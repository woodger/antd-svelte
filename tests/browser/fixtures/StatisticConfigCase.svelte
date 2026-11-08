<script lang="ts">
  import { ConfigProvider, Statistic, StatisticTimer, theme } from 'antd-svelte';
  import {
    statisticContextConfig, statisticConfigRecord, statisticConfigProps, type StatisticConfigSample
  } from './statistic-config-cases';

  let { sample }: { sample: StatisticConfigSample } = $props();
  let context = $derived(statisticContextConfig(sample));
  let inner = $derived(statisticConfigRecord(sample.inner));
  let componentProps = $derived(statisticConfigProps(sample));
  let resolvedTheme = $derived(sample.theme ? {
    ...sample.theme, algorithm: sample.theme.algorithm?.map(name => theme[name])
  } : undefined);
</script>

{#snippet statistic(id: string)}
  {#if sample.kind === 'timer'}
    <StatisticTimer {...componentProps} type={sample.mode ?? 'countdown'}
      prefixCls={id === 'sibling' ? undefined : sample.prefixCls}
      data-prefix={id === 'sibling' ? 'ant-statistic' : sample.prefixCls || 'ant-statistic'}
      data-statistic-config={id} />
  {:else}
    <Statistic {...componentProps} prefixCls={id === 'sibling' ? undefined : sample.prefixCls}
      data-prefix={id === 'sibling' ? 'ant-statistic' : sample.prefixCls || 'ant-statistic'}
      data-statistic-config={id} />
  {/if}
{/snippet}

<ConfigProvider direction={sample.direction} statistic={context} theme={resolvedTheme}>
  {@render statistic('normal')}
  <ConfigProvider statistic={inner}>{@render statistic('nested')}</ConfigProvider>
</ConfigProvider>
<ConfigProvider direction={sample.direction} statistic={{ class: 'inner-sibling', style: 'padding:13px' }}>
  {@render statistic('sibling')}
</ConfigProvider>
