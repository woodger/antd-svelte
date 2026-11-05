<script lang="ts">
  import { ConfigProvider, type ThemeConfig } from 'antd-svelte';
  import { resolveMasonryTheme, type MasonryThemeSample } from './masonry-theme-presets';
  import MasonryThemeControl from './MasonryThemeControl.svelte';

  let {
    sample,
    mounted = true,
    enabled = true,
    inherit = true,
    reversed = false,
    removed = false,
    fontSize,
    motion,
    zeroCss = false
  }: {
    sample: MasonryThemeSample;
    mounted?: boolean;
    enabled?: boolean;
    inherit?: boolean;
    reversed?: boolean;
    removed?: boolean;
    fontSize?: number;
    motion?: boolean;
    zeroCss?: boolean;
  } = $props();
  let source = $derived(resolveMasonryTheme(sample.config));
  let configured = $derived<ThemeConfig>(enabled ? {
    ...source,
    cssVar: source.cssVar ?? {},
    token: {
      ...source.token,
      ...(motion !== undefined ? { motion } : {}),
      ...(zeroCss ? { motion: true } : {})
    },
    components: {
      ...source.components,
      Masonry: {
        ...source.components?.Masonry,
        ...(zeroCss ? { algorithm: true, motion: false } : {}),
        ...(fontSize !== undefined ? { fontSize } : {})
      }
    }
  } : { mode: 'light', primary: 'blue' });
  let priority = $derived(sample.priority);
  let prefix = $derived(sample.config.cssVar?.prefix ?? 'ant');
</script>

{#if mounted}
  <ConfigProvider theme={configured}>
    {#each ['normal', 'rtl', 'stale', 'two', 'variable'] as id}
      <MasonryThemeControl {id} {priority} {prefix} {reversed} {removed} />
    {/each}
    <ConfigProvider theme={{ inherit, components: { Masonry: { fontSize: 24 } } }}>
      <MasonryThemeControl id="nested" {priority} {prefix} />
    </ConfigProvider>
    <ConfigProvider theme={{
      inherit: false,
      token: { motion: false },
      components: { Masonry: { fontSize: 16 } }
    }}>
      <MasonryThemeControl id="reset" {priority} {prefix} />
    </ConfigProvider>
  </ConfigProvider>
{/if}
<ConfigProvider theme={{
  cssVar: {},
  token: { motion: false },
  components: { Masonry: { fontSize: 20 } }
}}>
  <MasonryThemeControl id="sibling" {priority} {prefix} />
</ConfigProvider>
<ConfigProvider theme={{ cssVar: {}, token: { motion: false } }}>
  <MasonryThemeControl id="outside" {priority} {prefix} />
</ConfigProvider>
