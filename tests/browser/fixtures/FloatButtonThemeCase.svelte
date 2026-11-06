<script lang="ts">
  import { ConfigProvider, type ThemeConfig } from 'antd-svelte';
  import FloatButtonThemeControl from './FloatButtonThemeControl.svelte';
  import { resolveFloatButtonTheme, type FloatButtonThemeSample } from './float-button-theme-presets';

  let {
    sample,
    mounted = true,
    enabled = true,
    inherit = true,
    size,
    iconSize,
    padding
  }: {
    sample: FloatButtonThemeSample;
    mounted?: boolean;
    enabled?: boolean;
    inherit?: boolean;
    size?: number;
    iconSize?: number;
    padding?: number;
  } = $props();
  let source = $derived(resolveFloatButtonTheme(sample.config));
  let configured = $derived<ThemeConfig>(enabled ? {
    ...source,
    cssVar: source.cssVar ?? {},
    components: {
      ...source.components,
      FloatButton: {
        ...source.components?.FloatButton,
        ...(size !== undefined ? { controlHeightLG: size } : {}),
        ...(iconSize !== undefined ? { fontSizeIcon: iconSize } : {}),
        ...(padding !== undefined ? { paddingXXS: padding } : {})
      }
    }
  } : { mode: 'light', primary: 'blue' });
  let priority = $derived(sample.priority);
  let buttonStyle = $derived(sample.buttonStyle);
  let prefix = $derived(sample.config.cssVar?.prefix ?? 'ant');
</script>

<div style="display:grid;grid-template-columns:repeat(4,360px);gap:12px">
  {#if mounted}
    <ConfigProvider theme={configured}>
      {#each ['normal', 'primary', 'content', 'disabled', 'backtop', 'group-circle',
        'group-square', 'group-menu', 'rtl', 'variable', 'priority'] as id}
        <FloatButtonThemeControl {id} {priority} {prefix} {buttonStyle} />
      {/each}
      <ConfigProvider theme={{ inherit, components: {
        FloatButton: { controlHeightLG: 44, fontSizeIcon: 15 }
      } }}>
        <FloatButtonThemeControl id="nested" {priority} {prefix} {buttonStyle} />
      </ConfigProvider>
      <ConfigProvider theme={{ inherit: false, token: { motion: false }, components: {
        FloatButton: { controlHeightLG: 36, fontSizeIcon: 12 }
      } }}>
        <FloatButtonThemeControl id="reset" {priority} {prefix} {buttonStyle} />
      </ConfigProvider>
    </ConfigProvider>
  {/if}
  <ConfigProvider theme={{ cssVar: {}, token: { motion: false }, components: {
    FloatButton: { controlHeightLG: 48, fontSizeIcon: 10 }
  } }}>
    <FloatButtonThemeControl id="sibling" {priority} {prefix} {buttonStyle} />
  </ConfigProvider>
  <ConfigProvider theme={{ cssVar: {}, token: { motion: false } }}>
    <FloatButtonThemeControl id="outside" {priority} {prefix} {buttonStyle} />
  </ConfigProvider>
</div>
