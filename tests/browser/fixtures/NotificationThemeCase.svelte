<script lang="ts">
  import { ConfigProvider, enUS, type ThemeConfig } from 'antd-svelte';
  import NotificationThemeControl from './NotificationThemeControl.svelte';
  import { resolveNotificationTheme, type NotificationThemeSample }
    from './notification-theme-presets';

  let {
    sample,
    scope = 'normal',
    mode = 'default',
    mounted = true,
    enabled = true,
    inherit = true,
    updated = false,
    editable = false,
    sameColors = false,
    undefinedWidth = false
  }: {
    sample: NotificationThemeSample;
    scope?: string;
    mode?: string;
    mounted?: boolean;
    enabled?: boolean;
    inherit?: boolean;
    updated?: boolean;
    editable?: boolean;
    sameColors?: boolean;
    undefinedWidth?: boolean;
  } = $props();
  let source = $derived(resolveNotificationTheme(sample.config));
  let configured = $derived<ThemeConfig>(enabled ? {
    ...source,
    cssVar: source.cssVar ?? {},
    components: {
      ...source.components,
      Notification: {
        ...source.components?.Notification,
        ...(updated ? { width: 460, colorInfoBg: '#fff0f6' } : {}),
        ...(sameColors ? { colorSuccessBg: '#f6ffed', colorWarningBg: '#fffbe6' } : {}),
        ...(undefinedWidth ? { width: undefined } : {})
      }
    }
  } : { mode: 'light', primary: 'blue' });
</script>

{#snippet control()}
  <NotificationThemeControl {mode} {scope} {editable} priority={sample.priority}
    prefix={sample.config.cssVar?.prefix ?? 'ant'} />
{/snippet}

{#if mounted}
  <ConfigProvider locale={enUS} theme={configured} direction={scope === 'rtl' ? 'rtl' : 'ltr'}>
    {#if scope === 'nested'}
      <ConfigProvider theme={{ inherit, components: { Notification: { fontSize: 16 } } }}>
        {@render control()}
      </ConfigProvider>
    {:else if scope === 'reset'}
      <ConfigProvider theme={{ inherit: false, token: { motion: false }, components: {
        Notification: { fontSize: 18 }
      } }}>{@render control()}</ConfigProvider>
    {:else if scope === 'sibling'}
      <ConfigProvider theme={{ inherit: false, cssVar: {}, token: { motion: false }, components: {
        Notification: { fontSize: 17 }
      } }}>{@render control()}</ConfigProvider>
    {:else if scope === 'outside'}
      <ConfigProvider theme={{ inherit: false, cssVar: {}, token: { motion: false } }}>
        {@render control()}
      </ConfigProvider>
    {:else}{@render control()}{/if}
  </ConfigProvider>
{/if}
