<script lang="ts">
  import { ConfigProvider, type ThemeConfig } from 'antd-svelte';
  import PickerThemeControl from './PickerThemeControl.svelte';
  import { resolvePickerTheme, type PickerThemeSample } from './picker-theme-presets';

  let {
    sample,
    mounted = true,
    enabled = true,
    inherit = true,
    updated = false,
    header = 'normal',
    opened = ''
  }: {
    sample: PickerThemeSample;
    mounted?: boolean;
    enabled?: boolean;
    inherit?: boolean;
    updated?: boolean;
    header?: string;
    opened?: string;
  } = $props();
  let source = $derived(resolvePickerTheme(sample.config));
  let configured = $derived<ThemeConfig>(enabled ? {
    ...source,
    cssVar: source.cssVar ?? {},
    components: {
      ...source.components,
      DatePicker: {
        ...source.components?.DatePicker,
        ...(updated ? { paddingBlock: 10, timeColumnWidth: 80, timeColumnHeight: 280,
          timeCellHeight: 40, cellHeight: 36, cellWidth: 46,
          cellActiveWithRangeBg: '#d3adf7' } : {})
      }
    }
  } : { mode: 'light', primary: 'blue' });
  let priority = $derived(sample.priority);
  let prefix = $derived(sample.config.cssVar?.prefix ?? 'ant');
</script>

{#if mounted}
  <ConfigProvider theme={configured}>
    {#each ['normal', 'rtl', 'variable', 'priority'] as id}
      <PickerThemeControl {id} {priority} {prefix} {opened} {header} />
    {/each}
    <ConfigProvider theme={{ inherit, components: { DatePicker: { inputFontSize: 16 } } }}>
      <PickerThemeControl id="nested" {priority} {prefix} />
    </ConfigProvider>
    <ConfigProvider theme={{ inherit: false, token: { motion: false }, components: {
      DatePicker: { inputFontSize: 18 }
    } }}>
      <PickerThemeControl id="reset" {priority} {prefix} />
    </ConfigProvider>
  </ConfigProvider>
{/if}
<ConfigProvider theme={{ cssVar: {}, token: { motion: false }, components: {
  DatePicker: { inputFontSize: 17 }
} }}>
  <PickerThemeControl id="sibling" {priority} {prefix} />
</ConfigProvider>
<ConfigProvider theme={{ cssVar: {}, token: { motion: false } }}>
  <PickerThemeControl id="outside" {priority} {prefix} />
</ConfigProvider>
