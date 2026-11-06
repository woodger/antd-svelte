<script lang="ts">
  import { ConfigProvider, type ThemeConfig } from 'antd-svelte';
  import TypographyThemeControl from './TypographyThemeControl.svelte';
  import { resolveTypographyTheme, type TypographyThemeSample } from './typography-theme-presets';

  let {
    sample,
    mounted = true,
    enabled = true,
    inherit = true,
    fontSize,
    top,
    bottom
  }: {
    sample: TypographyThemeSample;
    mounted?: boolean;
    enabled?: boolean;
    inherit?: boolean;
    fontSize?: number;
    top?: number;
    bottom?: number;
  } = $props();
  let source = $derived(resolveTypographyTheme(sample.config));
  let configured = $derived<ThemeConfig>(enabled ? {
    ...source,
    cssVar: source.cssVar ?? {},
    components: {
      ...source.components,
      Typography: {
        ...source.components?.Typography,
        ...(fontSize !== undefined ? { fontSize } : {}),
        ...(top !== undefined ? { titleMarginTop: top } : {}),
        ...(bottom !== undefined ? { titleMarginBottom: bottom } : {})
      }
    }
  } : { mode: 'light', primary: 'blue' });
  let priority = $derived(sample.priority);
  let prefix = $derived(sample.config.cssVar?.prefix ?? 'ant');
</script>

{#if mounted}
  <ConfigProvider theme={configured}>
    {#each ['normal', 'rtl', 'variable', 'priority'] as id}
      <TypographyThemeControl {id} {priority} {prefix} />
    {/each}
    <ConfigProvider theme={{ inherit, components: { Typography: { titleMarginBottom: 6 } } }}>
      <TypographyThemeControl id="nested" {priority} {prefix} />
    </ConfigProvider>
    <ConfigProvider theme={{ inherit: false, token: { motion: false }, components: {
      Typography: { titleMarginBottom: 4 }
    } }}>
      <TypographyThemeControl id="reset" {priority} {prefix} />
    </ConfigProvider>
  </ConfigProvider>
{/if}
<ConfigProvider theme={{ cssVar: {}, token: { motion: false }, components: {
  Typography: { titleMarginTop: '0.8em', titleMarginBottom: '0.25em', fontSize: 18 }
} }}>
  <TypographyThemeControl id="sibling" {priority} {prefix} />
</ConfigProvider>
<ConfigProvider theme={{ cssVar: {}, token: { motion: false } }}>
  <TypographyThemeControl id="outside" {priority} {prefix} />
</ConfigProvider>
