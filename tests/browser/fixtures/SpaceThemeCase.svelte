<script lang="ts">
  import { ConfigProvider, type SpaceConfig, type ThemeConfig } from 'antd-svelte';
  import { resolveSpaceTheme, type SpaceThemeSample } from './space-theme-presets';
  import { sourceSpaceConfig } from './space-provider-presets';
  import SpaceThemeControl from './SpaceThemeControl.svelte';

  let {
    sample,
    mounted = true,
    enabled = true,
    inherit = true,
    replaced = false,
    reversed = false,
    padding,
    configUpdate = false
  }: {
    sample: SpaceThemeSample;
    mounted?: boolean;
    enabled?: boolean;
    inherit?: boolean;
    replaced?: boolean;
    reversed?: boolean;
    padding?: number;
    configUpdate?: boolean;
  } = $props();
  let source = $derived(resolveSpaceTheme(sample.config));
  let configured = $derived<ThemeConfig>(enabled ? {
    ...source,
    cssVar: source.cssVar ?? {},
    components: {
      ...source.components,
      Space: {
        ...source.components?.Space,
        ...(padding !== undefined ? { paddingXS: padding, padding: padding + 4 } : {})
      }
    }
  } : { mode: 'light', primary: 'blue' });
  let context = $derived<SpaceConfig | undefined>(replaced ? {} : configUpdate ? {
    ...sourceSpaceConfig(sample.configMode),
    size: [4, 6],
    class: 'context-updated',
    style: 'column-gap:47px;background:#e6f4ff'
  } : sourceSpaceConfig(sample.configMode));
  let priority = $derived(sample.priority);
  let prefix = $derived(sample.config.cssVar?.prefix ?? 'ant');
</script>

{#if mounted}
  <ConfigProvider componentSize="large" theme={configured} space={context}>
    {#each ['default', 'small', 'medium', 'large', 'tuple', 'variable',
      'numeric', 'zero', 'vertical', 'rtl', 'compact'] as id}
      <SpaceThemeControl {id} {priority} {prefix} {reversed} />
    {/each}
    <ConfigProvider theme={{ inherit, components: { Space: { paddingXS: 6, padding: 18 } } }}>
      <SpaceThemeControl id="nested" {priority} {prefix} {reversed} />
    </ConfigProvider>
    <ConfigProvider space={{ size: 'small' }}>
      <SpaceThemeControl id="replace" {priority} {prefix} {reversed} />
    </ConfigProvider>
    <ConfigProvider space={undefined}>
      <SpaceThemeControl id="inherit" {priority} {prefix} {reversed} />
    </ConfigProvider>
    <ConfigProvider space={{}}>
      <SpaceThemeControl id="empty" {priority} {prefix} {reversed} />
    </ConfigProvider>
    <ConfigProvider theme={{ inherit: false, token: { motion: false } }}>
      <SpaceThemeControl id="reset" {priority} {prefix} {reversed} />
    </ConfigProvider>
  </ConfigProvider>
{/if}
<ConfigProvider theme={{ cssVar: {}, token: { motion: false } }} space={{ size: [3, 5] }}>
  <SpaceThemeControl id="sibling" {priority} {prefix} />
</ConfigProvider>
<ConfigProvider theme={{ cssVar: {}, token: { motion: false } }}>
  <SpaceThemeControl id="outside" {priority} {prefix} />
</ConfigProvider>
