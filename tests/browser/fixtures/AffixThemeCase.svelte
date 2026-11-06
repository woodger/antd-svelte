<script lang="ts">
  import { ConfigProvider, type ThemeConfig } from 'antd-svelte';
  import AffixThemeControl from './AffixThemeControl.svelte';
  import { resolveAffixTheme, type AffixThemeSample } from './affix-theme-presets';

  let { sample, mounted = true, enabled = true, popup, fontSize, inherit = true }: {
    sample: AffixThemeSample;
    mounted?: boolean;
    enabled?: boolean;
    popup?: number;
    fontSize?: number;
    inherit?: boolean;
  } = $props();
  let resolved = $derived(resolveAffixTheme(sample.config));
  let configured = $derived<ThemeConfig>(enabled ? {
    ...resolved,
    components: { ...resolved.components, Affix: { ...resolved.components?.Affix,
      ...(popup === undefined ? {} : { zIndexPopup: popup }),
      ...(fontSize === undefined ? {} : { fontSize }) } }
  } : { mode: 'light', primary: 'blue' });
</script>

{#if mounted}
  <ConfigProvider theme={configured}>
    <AffixThemeControl id="normal" />
    <AffixThemeControl id="style" />
    <ConfigProvider theme={{ inherit, components: { Affix: { zIndexPopup: 21 } } }}>
      <AffixThemeControl id="nested" />
    </ConfigProvider>
    <ConfigProvider theme={{ inherit: false, token: { motion: false },
      components: { Affix: { zIndexPopup: 31 } } }}>
      <AffixThemeControl id="reset" />
    </ConfigProvider>
  </ConfigProvider>
{/if}
<ConfigProvider theme={{ cssVar: {}, token: { motion: false },
  components: { Affix: { zIndexPopup: 41 } } }}>
  <AffixThemeControl id="sibling" />
</ConfigProvider>
<ConfigProvider theme={{ cssVar: {}, token: { motion: false } }}>
  <AffixThemeControl id="outside" />
</ConfigProvider>
