<script lang="ts">
  import { ConfigProvider, type ThemeConfig } from 'antd-svelte';
  import GridThemeControl from './GridThemeControl.svelte';
  import { resolveGridTheme, type GridThemeSample } from './grid-theme-presets';

  let {
    sample,
    scope = 'normal',
    mode = 'default',
    enabled = true,
    inherit = true,
    updated = false,
    mounted = true
  }: {
    sample: GridThemeSample;
    scope?: string;
    mode?: string;
    enabled?: boolean;
    inherit?: boolean;
    updated?: boolean;
    mounted?: boolean;
  } = $props();
  let source = $derived(resolveGridTheme(sample.config));
  let configured = $derived<ThemeConfig>(enabled ? {
    ...source, cssVar: source.cssVar ?? {}, components: { ...source.components, Grid: {
      ...source.components?.Grid, ...(updated ? { fontFamily: 'serif', fontSize: 23 } : {})
    } }
  } : { mode: 'light', primary: 'blue' });
</script>

{#snippet control()}<GridThemeControl {mode} prefix={source.cssVar?.prefix ?? 'ant'} />{/snippet}

{#if mounted}
  <ConfigProvider theme={configured} direction={scope === 'rtl' ? 'rtl' : 'ltr'}>
    {#if scope === 'nested'}
      <ConfigProvider theme={{ inherit, components: { Grid: { fontSize: 16 } } }}>
        {@render control()}
      </ConfigProvider>
    {:else if scope === 'reset'}
      <ConfigProvider theme={{ inherit: false, token: { motion: false }, components: {
        Grid: { fontSize: 18 }
      } }}>{@render control()}</ConfigProvider>
    {:else if scope === 'sibling'}
      <ConfigProvider theme={{ inherit: false, cssVar: {}, token: { motion: false }, components: {
        Grid: { fontSize: 17 }
      } }}>{@render control()}</ConfigProvider>
    {:else if scope === 'outside'}
      <ConfigProvider theme={{ inherit: false, cssVar: {}, token: { motion: false } }}>
        {@render control()}
      </ConfigProvider>
    {:else}{@render control()}{/if}
  </ConfigProvider>
{/if}
