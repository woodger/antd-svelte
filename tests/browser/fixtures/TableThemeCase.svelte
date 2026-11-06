<script lang="ts">
  import { ConfigProvider, enUS, type ThemeConfig } from 'antd-svelte';
  import TableThemeControl from './TableThemeControl.svelte';
  import { resolveTableTheme, type TableThemeSample } from './table-theme-presets';

  let {
    sample, scope = 'normal', mode = 'default', mounted = true,
    enabled = true, inherit = true, updated = false
  }: {
    sample: TableThemeSample;
    scope?: string;
    mode?: string;
    mounted?: boolean;
    enabled?: boolean;
    inherit?: boolean;
    updated?: boolean;
  } = $props();
  let source = $derived(resolveTableTheme(sample.config));
  let configured = $derived<ThemeConfig>(enabled ? {
    ...source,
    cssVar: source.cssVar ?? {},
    components: {
      ...source.components,
      Table: {
        ...source.components?.Table,
        ...(updated ? { headerBg: '#e6fffb', cellPaddingBlockMD: 10,
          cellFontSizeMD: 21, selectionColumnWidth: 70,
          filterDropdownBg: '#fff1f0', filterDropdownMenuBg: '#fffbe6' } : {})
      }
    }
  } : { mode: 'light', primary: 'blue' });
</script>

{#snippet control()}<TableThemeControl {mode} />{/snippet}

{#if mounted}
  <ConfigProvider locale={enUS} theme={configured} direction={scope === 'rtl' ? 'rtl' : 'ltr'}>
    {#if scope === 'nested'}
      <ConfigProvider theme={{ inherit, components: { Table: { fontSize: 16 } } }}>
        {@render control()}
      </ConfigProvider>
    {:else if scope === 'reset'}
      <ConfigProvider theme={{ inherit: false, token: { motion: false }, components: {
        Table: { fontSize: 18 }
      } }}>{@render control()}</ConfigProvider>
    {:else if scope === 'sibling'}
      <ConfigProvider theme={{ inherit: false, cssVar: {}, token: { motion: false }, components: {
        Table: { fontSize: 17 }
      } }}>{@render control()}</ConfigProvider>
    {:else if scope === 'outside'}
      <ConfigProvider theme={{ inherit: false, cssVar: {}, token: { motion: false } }}>
        {@render control()}
      </ConfigProvider>
    {:else}{@render control()}{/if}
  </ConfigProvider>
{/if}
