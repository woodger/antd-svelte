<script lang="ts">
  import { ConfigProvider, type ThemeConfig } from 'antd-svelte';
  import DescriptionsThemeDescription from './DescriptionsThemeDescription.svelte';
  import {
    resolveDescriptionsTheme,
    type DescriptionsReferenceTheme,
    type DescriptionsThemeSample
  } from './descriptions-theme-presets';

  let { sample, enabled = true, mounted = true, titleMarginBottom, inherit = true }: {
    sample: DescriptionsThemeSample;
    enabled?: boolean;
    mounted?: boolean;
    titleMarginBottom?: number;
    inherit?: boolean;
  } = $props();
  let config = $derived(resolveDescriptionsTheme(sample.config as DescriptionsReferenceTheme));
  let current = $derived<ThemeConfig>(enabled ? {
    ...config,
    components: { ...config.components, Descriptions: {
      ...config.components?.Descriptions,
      ...(titleMarginBottom === undefined ? {} : { titleMarginBottom })
    } }
  } : { mode: 'light', primary: 'blue' });
  let priority = $derived('priority' in sample && sample.priority);
</script>

{#if mounted}
  <ConfigProvider theme={current} direction={'rtl' in sample && sample.rtl ? 'rtl' : 'ltr'}>
    {#each ['plain', 'bordered', 'vertical', 'vertical-bordered', 'small', 'small-bordered', 'medium', 'medium-bordered', 'responsive'] as kind}
      <DescriptionsThemeDescription id={kind} {kind} {priority} />
    {/each}
    <ConfigProvider theme={{ inherit, components: { Descriptions: {
      titleMarginBottom: 7, labelBg: '#fff7e6'
    } } }}>
      <DescriptionsThemeDescription id="nested" {priority} />
    </ConfigProvider>
    <ConfigProvider theme={{ inherit: false, token: { motion: false },
      components: { Descriptions: { titleMarginBottom: 5 } } }}>
      <DescriptionsThemeDescription id="reset" {priority} />
    </ConfigProvider>
  </ConfigProvider>
  <ConfigProvider theme={resolveDescriptionsTheme({
    components: { Descriptions: { titleMarginBottom: 10 } }
  })}>
    <DescriptionsThemeDescription id="sibling" {priority} />
  </ConfigProvider>
{/if}
<DescriptionsThemeDescription id="outside" {priority} />
