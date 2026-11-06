<script lang="ts">
  import { ConfigProvider, enUS, type ThemeConfig } from 'antd-svelte';
  import ModalThemeControl from './ModalThemeControl.svelte';
  import { resolveModalTheme, type ModalThemeSample } from './modal-theme-presets';

  let {
    sample,
    scope = 'normal',
    mode = 'default',
    mounted = true,
    enabled = true,
    inherit = true,
    updated = false
  }: {
    sample: ModalThemeSample;
    scope?: string;
    mode?: string;
    mounted?: boolean;
    enabled?: boolean;
    inherit?: boolean;
    updated?: boolean;
  } = $props();
  let source = $derived(resolveModalTheme(sample.config));
  let configured = $derived<ThemeConfig>(enabled ? {
    ...source,
    cssVar: source.cssVar ?? {},
    components: {
      ...source.components,
      Modal: {
        ...source.components?.Modal,
        ...(updated ? { titleFontSize: 26, contentBg: '#e6fffb' } : {})
      }
    }
  } : { mode: 'light', primary: 'blue' });
</script>

{#snippet control()}<ModalThemeControl {mode} />{/snippet}

{#if mounted}
  <ConfigProvider locale={enUS} theme={configured} direction={scope === 'rtl' ? 'rtl' : 'ltr'}>
    {#if scope === 'nested'}
      <ConfigProvider theme={{ inherit, components: { Modal: { fontSize: 16 } } }}>
        {@render control()}
      </ConfigProvider>
    {:else if scope === 'reset'}
      <ConfigProvider theme={{ inherit: false, token: { motion: false }, components: {
        Modal: { fontSize: 18 }
      } }}>{@render control()}</ConfigProvider>
    {:else if scope === 'sibling'}
      <ConfigProvider theme={{ inherit: false, cssVar: {}, token: { motion: false }, components: {
        Modal: { fontSize: 17 }
      } }}>{@render control()}</ConfigProvider>
    {:else if scope === 'outside'}
      <ConfigProvider theme={{ inherit: false, cssVar: {}, token: { motion: false } }}>
        {@render control()}
      </ConfigProvider>
    {:else}{@render control()}{/if}
  </ConfigProvider>
{/if}
