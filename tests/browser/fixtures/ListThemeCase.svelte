<script lang="ts">
  import { ConfigProvider, type ThemeConfig } from 'antd-svelte';
  import ListThemeControl from './ListThemeControl.svelte';
  import { resolveListTheme, type ListThemeSample } from './list-theme-presets';

  let {
    sample,
    mounted = true,
    enabled = true,
    inherit = true,
    itemPadding,
    descriptionFontSize,
    headerBg
  }: {
    sample: ListThemeSample;
    mounted?: boolean;
    enabled?: boolean;
    inherit?: boolean;
    itemPadding?: string;
    descriptionFontSize?: number;
    headerBg?: string;
  } = $props();
  let source = $derived(resolveListTheme(sample.config));
  let configured = $derived<ThemeConfig>(enabled ? {
    ...source,
    cssVar: source.cssVar ?? {},
    components: {
      ...source.components,
      List: {
        ...source.components?.List,
        ...(itemPadding !== undefined ? { itemPadding } : {}),
        ...(descriptionFontSize !== undefined ? { descriptionFontSize } : {}),
        ...(headerBg !== undefined ? { headerBg } : {})
      }
    }
  } : { mode: 'light', primary: 'blue' });
  let priority = $derived(sample.priority);
  let prefix = $derived(sample.config.cssVar?.prefix ?? 'ant');
</script>

{#if mounted}
  <ConfigProvider theme={configured}>
    {#each ['normal', 'rtl', 'variable', 'priority'] as id}
      <ListThemeControl {id} {priority} {prefix} />
    {/each}
    <ConfigProvider theme={{ inherit, components: { List: { titleMarginBottom: 6 } } }}>
      <ListThemeControl id="nested" {priority} {prefix} />
    </ConfigProvider>
    <ConfigProvider theme={{ inherit: false, token: { motion: false }, components: {
      List: { titleMarginBottom: 4 }
    } }}>
      <ListThemeControl id="reset" {priority} {prefix} />
    </ConfigProvider>
  </ConfigProvider>
{/if}
<ConfigProvider theme={{ cssVar: {}, token: { motion: false }, components: {
  List: { itemPadding: '6px 3px', descriptionFontSize: 16, fontSize: 18 }
} }}>
  <ListThemeControl id="sibling" {priority} {prefix} />
</ConfigProvider>
<ConfigProvider theme={{ cssVar: {}, token: { motion: false } }}>
  <ListThemeControl id="outside" {priority} {prefix} />
</ConfigProvider>
