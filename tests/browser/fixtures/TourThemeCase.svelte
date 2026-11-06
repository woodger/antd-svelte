<script lang="ts">
  import { ConfigProvider, enUS, type ThemeConfig } from 'antd-svelte';
  import TourThemeControl from './TourThemeControl.svelte';
  import { resolveTourTheme, type TourThemeSample } from './tour-theme-presets';

  let {
    sample,
    scope = 'normal',
    mode = 'default',
    mounted = true,
    enabled = true,
    inherit = true,
    updated = false,
    draft = false,
    zIndex
  }: {
    sample: TourThemeSample;
    scope?: string;
    mode?: string;
    mounted?: boolean;
    enabled?: boolean;
    inherit?: boolean;
    updated?: boolean;
    draft?: boolean;
    zIndex?: number;
  } = $props();
  let source = $derived(resolveTourTheme(sample.config));
  let configured = $derived<ThemeConfig>(enabled ? {
    ...source,
    cssVar: source.cssVar ?? {},
    components: {
      ...source.components,
      Tour: {
        ...source.components?.Tour,
        ...(updated ? { closeBtnSize: 40, padding: 24, marginXS: 14 } : {})
      }
    }
  } : { mode: 'light', primary: 'blue' });
</script>

{#snippet control()}
  <TourThemeControl {scope} {mode} {draft} {zIndex} priority={sample.priority}
    prefix={sample.config.cssVar?.prefix ?? 'ant'} />
{/snippet}

{#if mounted}
  <ConfigProvider locale={enUS} theme={configured} direction={scope === 'rtl' ? 'rtl' : 'ltr'}>
    {#if scope === 'nested'}
      <ConfigProvider theme={{ inherit, components: { Tour: { fontSize: 16 } } }}>
        {@render control()}
      </ConfigProvider>
    {:else if scope === 'reset'}
      <ConfigProvider theme={{ inherit: false, token: { motion: false }, components: {
        Tour: { fontSize: 18 }
      } }}>{@render control()}</ConfigProvider>
    {:else if scope === 'sibling'}
      <ConfigProvider theme={{ inherit: false, cssVar: {}, token: { motion: false }, components: {
        Tour: { fontSize: 17 }
      } }}>{@render control()}</ConfigProvider>
    {:else if scope === 'outside'}
      <ConfigProvider theme={{ inherit: false, cssVar: {}, token: { motion: false } }}>
        {@render control()}
      </ConfigProvider>
    {:else}{@render control()}{/if}
  </ConfigProvider>
{/if}
