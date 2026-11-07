<script lang="ts">
  import { BackTop, ConfigProvider, type ThemeConfig } from 'antd-svelte';
  import { resolveBackTopTheme, type BackTopThemeSample } from './back-top-theme-presets';

  let {
    sample,
    mode = 'normal',
    updated = false,
    mounted = true
  }: {
    sample: BackTopThemeSample;
    mode?: string;
    updated?: boolean;
    mounted?: boolean;
  } = $props();
  let source = $derived(resolveBackTopTheme(sample.config));
  let configured = $derived<ThemeConfig>({
    ...source, cssVar: source.cssVar ?? {}, components: { ...source.components, BackTop: {
      ...source.components?.BackTop, ...(updated ? { zIndexPopup: 999, controlHeightLG: 52,
        fontSizeHeading3: 30 } : {})
    } }
  });
</script>

{#snippet control()}<BackTop id="back-top-control" visibilityHeight={0} duration={0}
    prefixCls={sample.prefix} />{/snippet}

{#if mounted}
  <ConfigProvider theme={configured} direction={mode === 'rtl' ? 'rtl' : 'ltr'}>
    {#if mode === 'nested'}
      <ConfigProvider theme={{ components: { BackTop: { zIndexPopup: 876 } } }}>
        {@render control()}
      </ConfigProvider>
    {:else if mode === 'reset'}
      <ConfigProvider theme={{ inherit: false, cssVar: {}, token: { motion: false } }}>
        {@render control()}
      </ConfigProvider>
    {:else}{@render control()}{/if}
  </ConfigProvider>
{/if}
