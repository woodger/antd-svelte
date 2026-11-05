<script lang="ts">
  import { ConfigProvider, type ThemeConfig } from 'antd-svelte';
  import SegmentedThemeControl from './SegmentedThemeControl.svelte';
  import {
    resolveSegmentedTheme,
    type SegmentedReferenceTheme,
    type SegmentedThemeSample
  } from './segmented-theme-presets';

  let { sample, enabled = true, mounted = true, trackPadding, inherit = true, motion = false }: {
    sample: SegmentedThemeSample;
    enabled?: boolean;
    mounted?: boolean;
    trackPadding?: number;
    inherit?: boolean;
    motion?: boolean;
  } = $props();
  let config = $derived(resolveSegmentedTheme(sample.config as SegmentedReferenceTheme));
  let current = $derived<ThemeConfig>(enabled ? {
    ...config,
    token: { ...config.token, motion },
    components: { ...config.components, Segmented: {
      ...config.components?.Segmented,
      ...(trackPadding === undefined ? {} : { trackPadding })
    } }
  } : { mode: 'light', primary: 'blue' });
  let priority = $derived('priority' in sample && sample.priority);
</script>

{#if mounted}
  <ConfigProvider theme={current} direction={'rtl' in sample && sample.rtl ? 'rtl' : 'ltr'}>
    {#each ['normal', 'small', 'large', 'block', 'round', 'vertical', 'disabled'] as kind}
      <SegmentedThemeControl id={kind} {kind} {priority} />
    {/each}
    <ConfigProvider theme={{ inherit, components: { Segmented: {
      trackPadding: 1, trackBg: '#fffbe6'
    } } }}>
      <SegmentedThemeControl id="nested" {priority} />
    </ConfigProvider>
    <ConfigProvider theme={{ inherit: false, token: { motion: false },
      components: { Segmented: { trackPadding: 3 } } }}>
      <SegmentedThemeControl id="reset" {priority} />
    </ConfigProvider>
  </ConfigProvider>
  <ConfigProvider theme={resolveSegmentedTheme({ components: { Segmented: { trackPadding: 5 } } })}>
    <SegmentedThemeControl id="sibling" {priority} />
  </ConfigProvider>
{/if}
<SegmentedThemeControl id="outside" {priority} />
