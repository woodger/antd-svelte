<script lang="ts">
  import { ConfigProvider, type ThemeConfig } from 'antd-svelte';
  import TreeThemeControl from './TreeThemeControl.svelte';
  import { resolveTreeTheme, type TreeThemeSample } from './tree-theme-presets';

  let {
    sample,
    mounted = true,
    enabled = true,
    inherit = true,
    titleHeight,
    switcherSize,
    indentSize,
    nodeSelectedBg
  }: {
    sample: TreeThemeSample;
    mounted?: boolean;
    enabled?: boolean;
    inherit?: boolean;
    titleHeight?: number;
    switcherSize?: number;
    indentSize?: number;
    nodeSelectedBg?: string;
  } = $props();
  let source = $derived(resolveTreeTheme(sample.config));
  let configured = $derived<ThemeConfig>(enabled ? {
    ...source,
    cssVar: source.cssVar ?? {},
    components: {
      ...source.components,
      Tree: {
        ...source.components?.Tree,
        ...(titleHeight !== undefined ? { titleHeight } : {}),
        ...(switcherSize !== undefined ? { switcherSize } : {}),
        ...(indentSize !== undefined ? { indentSize } : {}),
        ...(nodeSelectedBg !== undefined ? { nodeSelectedBg } : {})
      }
    }
  } : { mode: 'light', primary: 'blue' });
  let priority = $derived(sample.priority);
  let prefix = $derived(sample.config.cssVar?.prefix ?? 'ant');
</script>

{#if mounted}
  <ConfigProvider theme={configured}>
    {#each ['normal', 'rtl', 'variable', 'priority'] as id}
      <TreeThemeControl {id} {priority} {prefix} />
    {/each}
    <ConfigProvider theme={{ inherit, components: { Tree: { nodeSelectedColor: '#08979c' } } }}>
      <TreeThemeControl id="nested" {priority} {prefix} />
    </ConfigProvider>
    <ConfigProvider theme={{ inherit: false, token: { motion: false }, components: {
      Tree: { nodeSelectedColor: '#ad6800' }
    } }}>
      <TreeThemeControl id="reset" {priority} {prefix} />
    </ConfigProvider>
  </ConfigProvider>
{/if}
<ConfigProvider theme={{ cssVar: {}, token: { motion: false }, components: {
  Tree: { titleHeight: 28, fontSize: 18 }
} }}>
  <TreeThemeControl id="sibling" {priority} {prefix} />
</ConfigProvider>
<ConfigProvider theme={{ cssVar: {}, token: { motion: false } }}>
  <TreeThemeControl id="outside" {priority} {prefix} />
</ConfigProvider>
