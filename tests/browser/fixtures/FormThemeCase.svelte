<script lang="ts">
  import { ConfigProvider, type ThemeConfig } from 'antd-svelte';
  import FormThemeControl from './FormThemeControl.svelte';
  import { resolveFormTheme, type FormThemeSample } from './form-theme-presets';

  let {
    sample,
    mounted = true,
    enabled = true,
    inherit = true,
    labelHeight,
    verticalHeight,
    fontSize,
    margin
  }: {
    sample: FormThemeSample;
    mounted?: boolean;
    enabled?: boolean;
    inherit?: boolean;
    labelHeight?: number;
    verticalHeight?: number;
    fontSize?: number;
    margin?: number;
  } = $props();
  let source = $derived(resolveFormTheme(sample.config));
  let configured = $derived<ThemeConfig>(enabled ? {
    ...source,
    cssVar: source.cssVar ?? {},
    components: {
      ...source.components,
      Form: {
        ...source.components?.Form,
        ...(labelHeight !== undefined ? { labelHeight } : {}),
        ...(verticalHeight !== undefined ? { verticalLabelHeight: verticalHeight } : {}),
        ...(fontSize !== undefined ? { labelFontSize: fontSize } : {}),
        ...(margin !== undefined ? { itemMarginBottom: margin } : {})
      }
    }
  } : { mode: 'light', primary: 'blue' });
  let priority = $derived(sample.priority);
  let prefix = $derived(sample.config.cssVar?.prefix ?? 'ant');
</script>

{#if mounted}
  <ConfigProvider theme={configured}>
    {#each ['normal', 'horizontal', 'rtl', 'standalone', 'variable', 'priority'] as id}
      <FormThemeControl {id} {priority} {prefix} />
    {/each}
    <ConfigProvider theme={{ inherit, components: { Form: { labelFontSize: 24 } } }}>
      <FormThemeControl id="nested" {priority} {prefix} />
    </ConfigProvider>
    <ConfigProvider theme={{ inherit: false, token: { motion: false }, components: {
      Form: { labelFontSize: 16 }
    } }}>
      <FormThemeControl id="reset" {priority} {prefix} />
    </ConfigProvider>
  </ConfigProvider>
{/if}
<ConfigProvider theme={{ cssVar: {}, token: { motion: false }, components: {
  Form: { labelFontSize: 18 }
} }}>
  <FormThemeControl id="sibling" {priority} {prefix} />
</ConfigProvider>
<ConfigProvider theme={{ cssVar: {}, token: { motion: false } }}>
  <FormThemeControl id="outside" {priority} {prefix} />
</ConfigProvider>
