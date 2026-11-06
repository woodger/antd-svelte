<script lang="ts">
  import { ConfigProvider, type ThemeConfig } from 'antd-svelte';
  import WatermarkThemeControl from './WatermarkThemeControl.svelte';
  import { resolveWatermarkTheme, type WatermarkThemeSample } from './watermark-theme-presets';

  let { sample, mounted = true, enabled = true, color, fontSize, popupBase, inherit = true }: {
    sample: WatermarkThemeSample;
    mounted?: boolean;
    enabled?: boolean;
    color?: string;
    fontSize?: number;
    popupBase?: number;
    inherit?: boolean;
  } = $props();
  let resolved = $derived(resolveWatermarkTheme(sample.config));
  let configured = $derived<ThemeConfig>(enabled ? {
    ...resolved,
    token: { ...resolved.token,
      ...(color === undefined ? {} : { colorFill: color }),
      ...(fontSize === undefined ? {} : { fontSizeLG: fontSize }),
      ...(popupBase === undefined ? {} : { zIndexPopupBase: popupBase }) }
  } : { mode: 'light', primary: 'blue' });
</script>

{#if mounted}
  <ConfigProvider theme={configured}>
    {#each ['normal', 'explicit', 'lines', 'css'] as id}<WatermarkThemeControl {id} />{/each}
    <ConfigProvider theme={{ inherit, token: { fontSizeLG: 14 } }}>
      <WatermarkThemeControl id="nested" />
    </ConfigProvider>
    <ConfigProvider theme={{ inherit: false, token: { motion: false, colorFill: '#fa8c16' } }}>
      <WatermarkThemeControl id="reset" />
    </ConfigProvider>
  </ConfigProvider>
{/if}
<ConfigProvider theme={{ cssVar: {}, token: { motion: false, fontSizeLG: 18, colorFill: '#13c2c2' } }}>
  <WatermarkThemeControl id="sibling" />
</ConfigProvider>
<ConfigProvider theme={{ cssVar: {}, token: { motion: false } }}>
  <WatermarkThemeControl id="outside" />
</ConfigProvider>
