<script lang="ts">
  import { ConfigProvider, type ThemeConfig } from 'antd-svelte';
  import QRCodeThemeControl from './QRCodeThemeControl.svelte';
  import {
    resolveQRCodeTheme,
    type QRCodeReferenceTheme,
    type QRCodeThemeSample
  } from './qrcode-theme-presets';

  let { sample, mounted = true, enabled = true, textColor, coverBackground, padding, inherit = true }: {
    sample: QRCodeThemeSample;
    mounted?: boolean;
    enabled?: boolean;
    textColor?: string;
    coverBackground?: string;
    padding?: number;
    inherit?: boolean;
  } = $props();
  let source = $derived(resolveQRCodeTheme(sample.config as QRCodeReferenceTheme));
  let current = $derived<ThemeConfig>(enabled ? {
    ...source,
    token: { ...source.token, ...(textColor === undefined ? {} : { colorText: textColor }) },
    components: { ...source.components, QRCode: {
      ...source.components?.QRCode,
      ...(coverBackground === undefined ? {} : { colorBgContainer: coverBackground }),
      ...(padding === undefined ? {} : { paddingSM: padding })
    } }
  } : { mode: 'light', primary: 'blue' });
  let priority = $derived('priority' in sample && sample.priority);
</script>

<ConfigProvider locale={{ qrcode: { expired: 'Expired', refresh: 'Refresh', scanned: 'Scanned' } }}>
  {#if mounted}
    <ConfigProvider theme={current}>
      {#each ['svg', 'canvas', 'borderless', 'expired', 'scanned', 'loading', 'explicit', 'custom', 'rtl'] as id}
        <QRCodeThemeControl {id} {priority} />
      {/each}
      <ConfigProvider theme={{ inherit, components: { QRCode: { paddingSM: 6 } } }}>
        <QRCodeThemeControl id="nested" {priority} />
      </ConfigProvider>
      <ConfigProvider theme={{ inherit: false, token: { motion: false },
        components: { QRCode: { paddingSM: 5 } } }}>
        <QRCodeThemeControl id="reset" {priority} />
      </ConfigProvider>
    </ConfigProvider>
    <ConfigProvider theme={{ token: { motion: false }, components: { QRCode: { paddingSM: 4 } } }}>
      <QRCodeThemeControl id="sibling" {priority} />
    </ConfigProvider>
  {/if}
  <ConfigProvider theme={{ token: { motion: false } }}>
    <QRCodeThemeControl id="outside" {priority} />
  </ConfigProvider>
</ConfigProvider>
