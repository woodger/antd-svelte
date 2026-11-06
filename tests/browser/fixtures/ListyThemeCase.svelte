<script lang="ts">
  import { ConfigProvider, type ThemeConfig } from 'antd-svelte';
  import ListyThemeControl from './ListyThemeControl.svelte';
  import { resolveListyTheme, type ListyThemeSample } from './listy-theme-presets';

  let {
    sample,
    mounted = true,
    enabled = true,
    inherit = true,
    itemPaddingBlock,
    itemPaddingInline,
    fontSize
  }: {
    sample: ListyThemeSample;
    mounted?: boolean;
    enabled?: boolean;
    inherit?: boolean;
    itemPaddingBlock?: number;
    itemPaddingInline?: number;
    fontSize?: number;
  } = $props();
  let source = $derived(resolveListyTheme(sample.config));
  let configured = $derived<ThemeConfig>(enabled ? {
    ...source,
    cssVar: source.cssVar ?? {},
    components: {
      ...source.components,
      Listy: {
        ...source.components?.Listy,
        ...(itemPaddingBlock !== undefined ? { itemPaddingBlock } : {}),
        ...(itemPaddingInline !== undefined ? { itemPaddingInline } : {}),
        ...(fontSize !== undefined ? { fontSize } : {})
      }
    }
  } : { mode: 'light', primary: 'blue' });
  let priority = $derived(sample.priority);
  let prefix = $derived(sample.config.cssVar?.prefix ?? 'ant');
</script>

{#if mounted}
  <ConfigProvider theme={configured}>
    {#each ['normal', 'rtl', 'variable', 'priority'] as id}
      <ListyThemeControl {id} {priority} {prefix} />
    {/each}
    <ConfigProvider theme={{ inherit, components: { Listy: { itemPaddingInline: 6 } } }}>
      <ListyThemeControl id="nested" {priority} {prefix} />
    </ConfigProvider>
    <ConfigProvider theme={{ inherit: false, token: { motion: false }, components: {
      Listy: { itemPaddingInline: 4 }
    } }}>
      <ListyThemeControl id="reset" {priority} {prefix} />
    </ConfigProvider>
  </ConfigProvider>
{/if}
<ConfigProvider theme={{ cssVar: {}, token: { motion: false }, components: {
  Listy: { itemPaddingBlock: 8, itemPaddingInline: 10, fontSize: 18 }
} }}>
  <ListyThemeControl id="sibling" {priority} {prefix} />
</ConfigProvider>
<ConfigProvider theme={{ cssVar: {}, token: { motion: false } }}>
  <ListyThemeControl id="outside" {priority} {prefix} />
</ConfigProvider>
