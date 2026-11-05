<script lang="ts">
  import { ConfigProvider, type ThemeConfig } from 'antd-svelte';
  import RateThemeControl from './RateThemeControl.svelte';
  import { resolveRateTheme, type RateReferenceTheme, type RateThemeSample } from './rate-theme-presets';

  let { sample, enabled = true, mounted = true, starSize, inherit = true }: {
    sample: RateThemeSample;
    enabled?: boolean;
    mounted?: boolean;
    starSize?: number;
    inherit?: boolean;
  } = $props();
  let source = $derived(resolveRateTheme(sample.config as RateReferenceTheme));
  let current = $derived<ThemeConfig>(enabled ? {
    ...source,
    components: { ...source.components, Rate: {
      ...source.components?.Rate,
      ...(starSize === undefined ? {} : { starSize })
    } }
  } : { mode: 'light', primary: 'blue' });
  let priority = $derived('priority' in sample && sample.priority);
</script>

{#if mounted}
  <ConfigProvider theme={current} rate={priority ? {
    style: '--ant-rate-star-color:#873800;--ant-rate-star-hover-scale:scale(1.8)'
  } : undefined}>
    {#each ['normal', 'small', 'large', 'rtl', 'disabled', 'character', 'tooltips'] as id}
      <RateThemeControl {id} {priority} />
    {/each}
    <ConfigProvider theme={{ inherit, components: { Rate: { starColor: '#135200', starSize: 22 } } }}>
      <RateThemeControl id="nested" {priority} />
    </ConfigProvider>
    <ConfigProvider theme={{ inherit: false, token: { motion: false },
      components: { Rate: { starSize: 19 } } }}>
      <RateThemeControl id="reset" {priority} />
    </ConfigProvider>
  </ConfigProvider>
  <ConfigProvider theme={{ token: { motion: false }, components: { Rate: { starSize: 21 } } }}>
    <RateThemeControl id="sibling" {priority} />
  </ConfigProvider>
{/if}
<ConfigProvider theme={{ token: { motion: false } }}>
  <RateThemeControl id="outside" {priority} />
</ConfigProvider>
