<script lang="ts">
  import { ConfigProvider, type ThemeConfig } from 'antd-svelte';
  import CardThemeCard from './CardThemeCard.svelte';
  import {
    resolveCardTheme,
    type CardThemeSample,
    type CardReferenceTheme
  } from './card-theme-presets';

  let {
    sample,
    enabled = true,
    mounted = true,
    bodyPadding,
    cssVar,
    inherit = true
  }: {
    sample: CardThemeSample;
    enabled?: boolean;
    mounted?: boolean;
    bodyPadding?: number;
    cssVar?: ThemeConfig['cssVar'];
    inherit?: boolean;
  } = $props();
  let config = $derived(resolveCardTheme(sample.config as CardReferenceTheme));
  let current = $derived<ThemeConfig>(enabled ? {
    ...config,
    ...(cssVar ? { cssVar } : {}),
    components: { ...config.components, Card: {
      ...config.components?.Card,
      ...(bodyPadding === undefined ? {} : { bodyPadding })
    } }
  } : { mode: 'light', primary: 'blue' });
</script>

{#if mounted}
  <ConfigProvider theme={current} direction={'rtl' in sample && sample.rtl ? 'rtl' : 'ltr'}>
    {#each ['normal', 'small', 'inner', 'small-inner', 'tabs', 'grid', 'loading'] as kind}
      <CardThemeCard id={kind} {kind} priority={'priority' in sample && sample.priority} />
    {/each}
    <ConfigProvider theme={{ inherit, components: { Card: { bodyPadding: 7, headerHeight: 69 } } }}>
      <CardThemeCard id="nested" priority={'priority' in sample && sample.priority} />
    </ConfigProvider>
    <ConfigProvider theme={{ inherit: false, components: { Card: { bodyPadding: 5 } } }}>
      <CardThemeCard id="reset" priority={'priority' in sample && sample.priority} />
    </ConfigProvider>
  </ConfigProvider>
  <ConfigProvider theme={resolveCardTheme({
    cssVar: cssVar ?? config.cssVar,
    components: { Card: { bodyPadding: 10 } }
  })}>
    <CardThemeCard id="sibling" priority={'priority' in sample && sample.priority} />
  </ConfigProvider>
{/if}
<CardThemeCard id="outside" priority={'priority' in sample && sample.priority} />
