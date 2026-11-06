<script lang="ts">
  import { ConfigProvider, type ThemeConfig } from 'antd-svelte';
  import TransferThemeControl from './TransferThemeControl.svelte';
  import { resolveTransferTheme, type TransferThemeSample } from './transfer-theme-presets';

  let {
    sample,
    mounted = true,
    enabled = true,
    inherit = true,
    updated = false
  }: {
    sample: TransferThemeSample;
    mounted?: boolean;
    enabled?: boolean;
    inherit?: boolean;
    updated?: boolean;
  } = $props();
  let source = $derived(resolveTransferTheme(sample.config));
  let configured = $derived<ThemeConfig>(enabled ? {
    ...source,
    cssVar: source.cssVar ?? {},
    components: {
      ...source.components,
      Transfer: {
        ...source.components?.Transfer,
        ...(updated ? { listWidth: 240, listWidthLG: 310, listHeight: 280,
          itemHeight: 48, itemPaddingBlock: 10, headerHeight: 56 } : {})
      }
    }
  } : { mode: 'light', primary: 'blue' });
  let priority = $derived(sample.priority);
  let prefix = $derived(sample.config.cssVar?.prefix ?? 'ant');
</script>

{#if mounted}
  <ConfigProvider theme={configured}>
    {#each ['normal', 'rtl', 'variable', 'priority'] as id}
      <TransferThemeControl {id} {priority} {prefix} />
    {/each}
    <ConfigProvider theme={{ inherit, components: { Transfer: { itemPaddingBlock: 7 } } }}>
      <TransferThemeControl id="nested" {priority} {prefix} />
    </ConfigProvider>
    <ConfigProvider theme={{ inherit: false, token: { motion: false }, components: {
      Transfer: { itemPaddingBlock: 9 }
    } }}>
      <TransferThemeControl id="reset" {priority} {prefix} />
    </ConfigProvider>
  </ConfigProvider>
{/if}
<ConfigProvider theme={{ cssVar: {}, token: { motion: false }, components: {
  Transfer: { listWidth: 195, fontSize: 18 }
} }}>
  <TransferThemeControl id="sibling" {priority} {prefix} />
</ConfigProvider>
<ConfigProvider theme={{ cssVar: {}, token: { motion: false } }}>
  <TransferThemeControl id="outside" {priority} {prefix} />
</ConfigProvider>
