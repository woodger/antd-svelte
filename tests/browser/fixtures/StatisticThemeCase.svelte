<script lang="ts">
  import { ConfigProvider, type ThemeConfig } from 'antd-svelte';
  import StatisticThemeStatistic from './StatisticThemeStatistic.svelte';
  import {
    resolveStatisticTheme,
    type StatisticReferenceTheme,
    type StatisticThemeSample
  } from './statistic-theme-presets';

  let { sample, enabled = true, mounted = true, contentFontSize, inherit = true, draft = false }: {
    sample: StatisticThemeSample;
    enabled?: boolean;
    mounted?: boolean;
    contentFontSize?: number;
    inherit?: boolean;
    draft?: boolean;
  } = $props();
  let config = $derived(resolveStatisticTheme(sample.config as StatisticReferenceTheme));
  let current = $derived<ThemeConfig>(enabled ? {
    ...config,
    components: { ...config.components, Statistic: {
      ...config.components?.Statistic,
      ...(contentFontSize === undefined ? {} : { contentFontSize })
    } }
  } : { mode: 'light', primary: 'blue' });
  let priority = $derived('priority' in sample && sample.priority);
</script>

{#if mounted}
  <ConfigProvider theme={current} direction={'rtl' in sample && sample.rtl ? 'rtl' : 'ltr'}>
    {#each ['normal', 'loading', 'timer', 'countdown'] as kind}
      <StatisticThemeStatistic id={kind} {kind} {priority} draft={draft && kind === 'normal'} />
    {/each}
    <ConfigProvider theme={{ inherit, components: { Statistic: { contentFontSize: 17 } } }}>
      <StatisticThemeStatistic id="nested" {priority} />
    </ConfigProvider>
    <ConfigProvider theme={{ inherit: false, token: { motion: false },
      components: { Statistic: { titleFontSize: 11 } } }}>
      <StatisticThemeStatistic id="reset" {priority} />
    </ConfigProvider>
  </ConfigProvider>
  <ConfigProvider theme={resolveStatisticTheme({ components: { Statistic: { contentFontSize: 19 } } })}>
    <StatisticThemeStatistic id="sibling" {priority} />
  </ConfigProvider>
{/if}
<StatisticThemeStatistic id="outside" {priority} />
