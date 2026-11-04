<script lang="ts">
  import { ConfigProvider, Divider, Input } from 'antd-svelte';
  import type { DividerProps, ThemeConfig } from 'antd-svelte';
  import { dividerThemePresets } from './divider-theme-presets';

  let {
    preset = 'default',
    enabled = true,
    mounted = true,
    rtl = false,
    hashed = true,
    inherited = true,
    padding,
    priority = false
  }: {
    preset?: string;
    enabled?: boolean;
    mounted?: boolean;
    rtl?: boolean;
    hashed?: boolean;
    inherited?: boolean;
    padding?: number;
    priority?: boolean;
  } = $props();
  let config = $derived<ThemeConfig>({
    ...dividerThemePresets[preset],
    token: { ...dividerThemePresets[preset]?.token, motion: false },
    cssVar: { ...dividerThemePresets[preset]?.cssVar, key: 'divider-theme-scope' },
    components: {
      ...dividerThemePresets[preset]?.components,
      Divider: {
        ...dividerThemePresets[preset]?.components?.Divider,
        ...(padding === undefined ? {} : { textPaddingInline: padding })
      }
    },
    hashed
  });
  const entries: { id: string; props: DividerProps; }[] = [
    { id: 'empty', props: {} },
    { id: 'title', props: { children: 'Title' } },
    { id: 'start', props: { children: 'Title', titlePlacement: 'start' } },
    { id: 'end', props: { children: 'Title', titlePlacement: 'end' } },
    { id: 'plain', props: { children: 'Title', plain: true } },
    { id: 'vertical', props: { children: 'Title', orientation: 'vertical' } },
    { id: 'small', props: { size: 'small' } },
    { id: 'middle', props: { size: 'middle' } },
    { id: 'dashed', props: { children: 'Title', variant: 'dashed' } },
    { id: 'dotted', props: { children: 'Title', variant: 'dotted' } },
    { id: 'margin', props: { children: 'Title', titlePlacement: 'start', orientationMargin: 12 } }
  ];
</script>

{#if mounted}
  <ConfigProvider theme={enabled ? config : undefined} direction={rtl ? 'rtl' : 'ltr'}>
    {#each entries as entry}
      <div data-divider-theme={entry.id} style="width:360px">
        <Divider {...entry.props}
          style={priority ? '--ant-divider-text-padding-inline:31px' : undefined}
          styles={priority ? { root: '--ant-divider-text-padding-inline:29px',
            content: 'padding-inline-end:37px' } : undefined} />
      </div>
    {/each}
    <ConfigProvider theme={{ inherit: inherited, cssVar: { key: 'divider-child-scope' },
      components: { Divider: { textPaddingInline: 9 } } }}>
      <div data-divider-nested><Divider orientation="vertical" /><Divider>Nested</Divider></div>
    </ConfigProvider>
    <Input aria-label="Divider token neighbor" />
  </ConfigProvider>
{/if}
<ConfigProvider theme={{ cssVar: { key: 'divider-sibling-scope' },
  components: { Divider: { textPaddingInline: 7 } } }}>
  <div data-divider-sibling><Divider>Sibling</Divider></div>
</ConfigProvider>
<div data-divider-outside><Divider>Outside</Divider></div>
