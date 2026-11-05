<script lang="ts">
  import { ConfigProvider, type ThemeConfig } from 'antd-svelte';
  import SplitterThemeControl from './SplitterThemeControl.svelte';
  import {
    resolveSplitterTheme,
    type SplitterReferenceTheme,
    type SplitterThemeSample
  } from './splitter-theme-presets';

  let { sample, mounted = true, enabled = true, triggerSize, barSize, inherit = true }: {
    sample: SplitterThemeSample;
    mounted?: boolean;
    enabled?: boolean;
    triggerSize?: number;
    barSize?: number;
    inherit?: boolean;
  } = $props();
  let source = $derived(resolveSplitterTheme(sample.config as SplitterReferenceTheme));
  let current = $derived<ThemeConfig>(enabled ? {
    ...source,
    components: { ...source.components, Splitter: {
      ...source.components?.Splitter,
      ...(triggerSize === undefined ? {} : { splitTriggerSize: triggerSize }),
      ...(barSize === undefined ? {} : { splitBarSize: barSize })
    } }
  } : { mode: 'light', primary: 'blue' });
  let priority = $derived('priority' in sample && sample.priority);
</script>

{#if mounted}
  <ConfigProvider theme={current}>
    {#each ['normal', 'vertical', 'rtl', 'disabled', 'custom', 'lazy'] as id}
      <SplitterThemeControl {id} {priority} />
    {/each}
    <ConfigProvider theme={{ inherit, components: { Splitter: { splitTriggerSize: 10 } } }}>
      <SplitterThemeControl id="nested" {priority} />
    </ConfigProvider>
    <ConfigProvider theme={{ inherit: false, token: { motion: false },
      components: { Splitter: { splitTriggerSize: 8 } } }}>
      <SplitterThemeControl id="reset" {priority} />
    </ConfigProvider>
  </ConfigProvider>
  <ConfigProvider theme={{ token: { motion: false },
    components: { Splitter: { splitTriggerSize: 12 } } }}>
    <SplitterThemeControl id="sibling" {priority} />
  </ConfigProvider>
{/if}
<ConfigProvider theme={{ token: { motion: false } }}>
  <SplitterThemeControl id="outside" {priority} />
</ConfigProvider>
