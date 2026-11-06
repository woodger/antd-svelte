<script lang="ts">
  import { ConfigProvider, type ThemeConfig } from 'antd-svelte';
  import {
    resolveBorderBeamTheme,
    type BorderBeamThemeSample
  } from './border-beam-theme-presets';
  import BorderBeamThemeControl from './BorderBeamThemeControl.svelte';

  let {
    sample,
    mounted = true,
    enabled = true,
    inherit = true,
    lineWidth,
    primary
  }: {
    sample: BorderBeamThemeSample;
    mounted?: boolean;
    enabled?: boolean;
    inherit?: boolean;
    lineWidth?: number;
    primary?: string;
  } = $props();
  let source = $derived(resolveBorderBeamTheme(sample.config));
  let configured = $derived<ThemeConfig>(enabled ? {
    ...source,
    cssVar: source.cssVar ?? {},
    components: { ...source.components, BorderBeam: {
      ...source.components?.BorderBeam,
      ...(lineWidth !== undefined ? { lineWidth } : {}),
      ...(primary !== undefined ? { colorPrimary: primary } : {})
    } }
  } : { mode: 'light', primary: 'blue' });
  let target = $state<HTMLDivElement>();
  let priority = $derived(sample.priority);
  let prefix = $derived(sample.config.cssVar?.prefix ?? 'ant');
</script>

<div data-beam-theme="external" bind:this={target}
  style="position:relative;box-sizing:border-box;width:300px;height:100px;border-style:solid;border-width:1px 2px 3px 4px;border-radius:12px;--ant-color-primary:#fa541c;--ant-line-width:9px">
  <input aria-label="Beam external draft" value="External draft" />
</div>
{#if mounted}
  <ConfigProvider theme={configured}>
    {#each ['normal', 'multiple', 'explicit', 'rtl', 'variable', 'external'] as id}
      <BorderBeamThemeControl {id} {priority} {prefix} externalTarget={target} />
    {/each}
    <ConfigProvider theme={{ inherit, components: { BorderBeam: { lineWidth: 2 } } }}>
      <BorderBeamThemeControl id="nested" {priority} {prefix} />
    </ConfigProvider>
    <ConfigProvider theme={{
      inherit: false,
      token: { motion: false },
      components: { BorderBeam: { lineWidth: 3 } }
    }}>
      <BorderBeamThemeControl id="reset" {priority} />
    </ConfigProvider>
  </ConfigProvider>
{/if}
<ConfigProvider theme={{
  cssVar: {},
  token: { motion: false },
  components: { BorderBeam: { lineWidth: 5 } }
}}>
  <BorderBeamThemeControl id="sibling" {priority} />
</ConfigProvider>
<ConfigProvider theme={{ cssVar: {}, token: { motion: false } }}>
  <BorderBeamThemeControl id="outside" {priority} />
</ConfigProvider>
