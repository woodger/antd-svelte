<script lang="ts">
  import { ConfigProvider, enUS, type ThemeConfig } from 'antd-svelte';
  import UploadThemeControl from './UploadThemeControl.svelte';
  import { resolveUploadTheme, type UploadThemeSample } from './upload-theme-presets';

  let {
    sample,
    scope = 'normal',
    mode = 'default',
    mounted = true,
    enabled = true,
    inherit = true,
    updated = false
  }: {
    sample: UploadThemeSample;
    scope?: string;
    mode?: string;
    mounted?: boolean;
    enabled?: boolean;
    inherit?: boolean;
    updated?: boolean;
  } = $props();
  let source = $derived(resolveUploadTheme(sample.config));
  let configured = $derived<ThemeConfig>(enabled ? {
    ...source,
    cssVar: source.cssVar ?? {},
    components: {
      ...source.components,
      Upload: {
        ...source.components?.Upload,
        ...(updated ? { pictureCardSize: 160, actionsColor: '#722ed1' } : {})
      }
    }
  } : { mode: 'light', primary: 'blue' });
</script>

{#snippet control()}
  <UploadThemeControl {scope} {mode} priority={sample.priority}
    prefix={sample.config.cssVar?.prefix ?? 'ant'} />
{/snippet}

{#if mounted}
  <ConfigProvider locale={enUS} theme={configured} direction={scope === 'rtl' ? 'rtl' : 'ltr'}>
    {#if scope === 'nested'}
      <ConfigProvider theme={{ inherit, components: { Upload: { fontSize: 16 } } }}>
        {@render control()}
      </ConfigProvider>
    {:else if scope === 'reset'}
      <ConfigProvider theme={{ inherit: false, token: { motion: false }, components: {
        Upload: { fontSize: 18 }
      } }}>{@render control()}</ConfigProvider>
    {:else if scope === 'sibling'}
      <ConfigProvider theme={{ inherit: false, cssVar: {}, token: { motion: false }, components: {
        Upload: { fontSize: 17 }
      } }}>{@render control()}</ConfigProvider>
    {:else if scope === 'outside'}
      <ConfigProvider theme={{ inherit: false, cssVar: {}, token: { motion: false } }}>
        {@render control()}
      </ConfigProvider>
    {:else}{@render control()}{/if}
  </ConfigProvider>
{/if}
