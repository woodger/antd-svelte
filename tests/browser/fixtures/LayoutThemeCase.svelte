<script lang="ts">
  import {
    ConfigProvider,
    LayoutHeader,
    LayoutContent,
    LayoutFooter,
    type ThemeConfig
  } from 'antd-svelte';
  import { resolveLayoutTheme, type LayoutThemeSample } from './layout-theme-presets';
  import LayoutThemeControl from './LayoutThemeControl.svelte';

  let {
    sample,
    enabled = true,
    mounted = true,
    inherit = true,
    headerHeight,
    background,
    triggerHeight
  }: {
    sample: LayoutThemeSample;
    enabled?: boolean;
    mounted?: boolean;
    inherit?: boolean;
    headerHeight?: number;
    background?: string;
    triggerHeight?: number;
  } = $props();
  let source = $derived(resolveLayoutTheme(sample.config));
  let configured = $derived<ThemeConfig>(enabled ? {
    ...source,
    cssVar: source.cssVar ?? {},
    components: {
      ...source.components,
      Layout: {
        ...source.components?.Layout,
        ...(headerHeight !== undefined ? { headerHeight } : {}),
        ...(background !== undefined ? { bodyBg: background, siderBg: background } : {}),
        ...(triggerHeight !== undefined ? { triggerHeight } : {})
      }
    }
  } : { mode: 'light', primary: 'blue' });
  let priority = $derived(sample.priority);
  let prefix = $derived(sample.config.cssVar?.prefix ?? 'ant');
</script>

{#if mounted}
  <ConfigProvider theme={configured}>
    {#each ['dark', 'light', 'zero', 'zero-light', 'rtl', 'reverse', 'root-variable'] as id}
      <LayoutThemeControl {id} {priority} {prefix} />
    {/each}
    <ConfigProvider theme={{
      inherit,
      components: { Layout: { headerHeight: 88, triggerHeight: 36 } }
    }}>
      <LayoutThemeControl id="nested" {priority} {prefix} />
    </ConfigProvider>
    <ConfigProvider theme={{
      inherit: false,
      token: { motion: false },
      components: { Layout: { headerHeight: 76 } }
    }}>
      <LayoutThemeControl id="reset" {priority} />
    </ConfigProvider>
    <div data-layout-standalone style="font-size:14px;line-height:22px;color:rgb(31,41,51)">
      <LayoutHeader>Standalone header</LayoutHeader>
      <LayoutContent>Standalone content</LayoutContent>
      <LayoutFooter>Standalone footer</LayoutFooter>
    </div>
  </ConfigProvider>
{/if}
<ConfigProvider theme={{
  cssVar: {},
  token: { motion: false },
  components: { Layout: { headerHeight: 52 } }
}}>
  <LayoutThemeControl id="sibling" {priority} />
</ConfigProvider>
<ConfigProvider theme={{ cssVar: {}, token: { motion: false } }}>
  <LayoutThemeControl id="outside" {priority} />
</ConfigProvider>
