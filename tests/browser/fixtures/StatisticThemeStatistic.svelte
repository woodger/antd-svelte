<script lang="ts">
  import {
    Statistic,
    StatisticTimer,
    type StatisticProps
  } from 'antd-svelte';

  let { id, kind = 'normal', priority = false, draft = false }: {
    id: string;
    kind?: string;
    priority?: boolean;
    draft?: boolean;
  } = $props();
  let shared = $derived<StatisticProps>({
    'data-statistic-theme': id,
    title: draft ? title : 'Statistic title',
    prefix: '$',
    suffix: 'USD',
    precision: 2,
    loading: kind === 'loading',
    style: priority ? '--ant-statistic-title-font-size:19px' : undefined,
    styles: priority ? {
      root: '--ant-statistic-title-font-size:17px',
      title: 'font-size:21px',
      content: 'font-size:29px;color:#722ed1',
      prefix: 'font-size:13px',
      suffix: 'margin-inline-start:7px'
    } : undefined
  });
</script>

{#snippet title()}
  <span>Statistic title<input aria-label="Statistic theme draft" value="Draft" /></span>
{/snippet}
{#if kind === 'timer'}
  <StatisticTimer {...shared} type="countup" value={Date.UTC(2025, 0, 1)} />
{:else if kind === 'countdown'}
  <StatisticTimer {...shared} type="countdown" value={Date.UTC(2027, 0, 1)} />
{:else}
  <Statistic {...shared} value={1234.56} />
{/if}
