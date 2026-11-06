<script lang="ts">
  import { ConfigProvider, type ThemeConfig } from 'antd-svelte';
  import CalendarThemeControl from './CalendarThemeControl.svelte';
  import { resolveCalendarTheme, type CalendarThemeSample } from './calendar-theme-presets';

  let {
    sample,
    mounted = true,
    enabled = true,
    inherit = true,
    updated = false
  }: {
    sample: CalendarThemeSample;
    mounted?: boolean;
    enabled?: boolean;
    inherit?: boolean;
    updated?: boolean;
  } = $props();
  let source = $derived(resolveCalendarTheme(sample.config));
  let configured = $derived<ThemeConfig>(enabled ? {
    ...source,
    cssVar: source.cssVar ?? {},
    components: {
      ...source.components,
      Calendar: {
        ...source.components?.Calendar,
        ...(updated ? { yearControlWidth: 135, monthControlWidth: 125, miniContentHeight: 360,
          fullBg: '#fff0f6', fullPanelBg: '#fffbe6', itemActiveBg: '#d3adf7' } : {})
      }
    }
  } : { mode: 'light', primary: 'blue' });
  let priority = $derived(sample.priority);
  let prefix = $derived(sample.config.cssVar?.prefix ?? 'ant');
</script>

{#if mounted}
  <ConfigProvider theme={configured}>
    {#each ['normal', 'rtl', 'variable', 'priority'] as id}
      <CalendarThemeControl {id} {priority} {prefix} />
    {/each}
    <ConfigProvider theme={{ inherit, components: { Calendar: { itemActiveBg: '#b5f5ec' } } }}>
      <CalendarThemeControl id="nested" {priority} {prefix} />
    </ConfigProvider>
    <ConfigProvider theme={{ inherit: false, token: { motion: false }, components: {
      Calendar: { itemActiveBg: '#ffd6e7' }
    } }}>
      <CalendarThemeControl id="reset" {priority} {prefix} />
    </ConfigProvider>
  </ConfigProvider>
{/if}
<ConfigProvider theme={{ cssVar: {}, token: { motion: false }, components: {
  Calendar: { fontSize: 18, miniContentHeight: 270 }
} }}>
  <CalendarThemeControl id="sibling" {priority} {prefix} />
</ConfigProvider>
<ConfigProvider theme={{ cssVar: {}, token: { motion: false } }}>
  <CalendarThemeControl id="outside" {priority} {prefix} />
</ConfigProvider>
