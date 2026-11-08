<script lang="ts">
  import { ConfigProvider, Statistic, StatisticTimer } from 'antd-svelte';
  import {
    statisticContextConfig, statisticConfigRecord, statisticConfigProps, type StatisticConfigSample
  } from './statistic-config-cases';

  let { sample }: { sample: StatisticConfigSample } = $props();
  let context = $derived(statisticContextConfig(sample));
  let inner = $derived(statisticConfigRecord(sample.inner));
  let componentProps = $derived(statisticConfigProps(sample));
</script>

{#snippet statistic(id: string)}
  {#if sample.kind === 'timer'}
    <StatisticTimer {...componentProps} type="countdown" data-statistic-config={id} />
  {:else}
    <Statistic {...componentProps} data-statistic-config={id} />
  {/if}
{/snippet}

<ConfigProvider direction={sample.direction} statistic={context}>
  {@render statistic('normal')}
  <ConfigProvider statistic={inner}>{@render statistic('nested')}</ConfigProvider>
</ConfigProvider>
<ConfigProvider direction={sample.direction} statistic={{ class: 'inner-sibling', style: 'padding:13px' }}>
  {@render statistic('sibling')}
</ConfigProvider>
