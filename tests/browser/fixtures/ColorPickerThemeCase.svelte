<script lang="ts">
  import { ConfigProvider, type ThemeConfig } from 'antd-svelte';
  import ColorPickerThemeControl from './ColorPickerThemeControl.svelte';
  import { resolveColorPickerTheme, type ColorPickerThemeSample } from './color-picker-theme-presets';

  let { sample, mounted = true, enabled = true, inherit = true, updated = false, opened = '' }: {
    sample: ColorPickerThemeSample;
    mounted?: boolean;
    enabled?: boolean;
    inherit?: boolean;
    updated?: boolean;
    opened?: string;
  } = $props();
  let source = $derived(resolveColorPickerTheme(sample.config));
  let configured = $derived<ThemeConfig>(enabled ? {
    ...source,
    cssVar: source.cssVar ?? {},
    components: {
      ...source.components,
      ColorPicker: { ...source.components?.ColorPicker,
        ...(updated ? { fontSize: 22, paddingXXS: 8, marginSM: 20, controlHeight: 44 } : {}) }
    }
  } : { mode: 'light', primary: 'blue' });
  let priority = $derived(sample.priority);
  let prefix = $derived(sample.config.cssVar?.prefix ?? 'ant');
</script>

{#if mounted}
  <ConfigProvider theme={configured}>
    {#each ['normal', 'rtl', 'variable', 'priority'] as id}
      <ColorPickerThemeControl {id} {priority} {prefix} {opened} />
    {/each}
    <ConfigProvider theme={{ inherit, components: { ColorPicker: { fontSize: 16 } } }}>
      <ColorPickerThemeControl id="nested" {priority} {prefix} />
    </ConfigProvider>
    <ConfigProvider theme={{ inherit: false, token: { motion: false }, components: {
      ColorPicker: { fontSize: 18 }
    } }}>
      <ColorPickerThemeControl id="reset" {priority} {prefix} />
    </ConfigProvider>
  </ConfigProvider>
{/if}
<ConfigProvider theme={{ cssVar: {}, token: { motion: false }, components: {
  ColorPicker: { fontSize: 17 }
} }}>
  <ColorPickerThemeControl id="sibling" {priority} {prefix} />
</ConfigProvider>
<ConfigProvider theme={{ cssVar: {}, token: { motion: false } }}>
  <ColorPickerThemeControl id="outside" {priority} {prefix} />
</ConfigProvider>
