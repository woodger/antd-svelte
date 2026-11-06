<script lang="ts">
  import { ConfigProvider, enUS, type ThemeConfig } from 'antd-svelte';
  import DrawerThemeControl from './DrawerThemeControl.svelte';
  import { resolveDrawerTheme, type DrawerThemeSample } from './drawer-theme-presets';

  let {
    sample,
    scope = 'normal',
    mode = 'default',
    mounted = true,
    enabled = true,
    inherit = true,
    updated = false
  }: {
    sample: DrawerThemeSample;
    scope?: string;
    mode?: string;
    mounted?: boolean;
    enabled?: boolean;
    inherit?: boolean;
    updated?: boolean;
  } = $props();
  let source = $derived(resolveDrawerTheme(sample.config));
  let configured = $derived<ThemeConfig>(enabled ? {
    ...source,
    cssVar: source.cssVar ?? {},
    components: {
      ...source.components,
      Drawer: {
        ...source.components?.Drawer,
        ...(updated ? { footerPaddingBlock: 19, footerPaddingInline: 31 } : {})
      }
    }
  } : { mode: 'light', primary: 'blue' });
</script>

{#snippet control()}
  <DrawerThemeControl {scope} {mode} priority={sample.priority}
    prefix={sample.config.cssVar?.prefix ?? 'ant'} />
{/snippet}

{#if mounted}
  <ConfigProvider locale={enUS} theme={configured} direction={scope === 'rtl' ? 'rtl' : 'ltr'}>
    {#if scope === 'nested'}
      <ConfigProvider theme={{ inherit, components: { Drawer: { fontSize: 16 } } }}>
        {@render control()}
      </ConfigProvider>
    {:else if scope === 'reset'}
      <ConfigProvider theme={{ inherit: false, token: { motion: false }, components: {
        Drawer: { fontSize: 18 }
      } }}>{@render control()}</ConfigProvider>
    {:else if scope === 'sibling'}
      <ConfigProvider theme={{ inherit: false, cssVar: {}, token: { motion: false }, components: {
        Drawer: { fontSize: 17 }
      } }}>{@render control()}</ConfigProvider>
    {:else if scope === 'outside'}
      <ConfigProvider theme={{ inherit: false, cssVar: {}, token: { motion: false } }}>
        {@render control()}
      </ConfigProvider>
    {:else}{@render control()}{/if}
  </ConfigProvider>
{/if}
