<script lang="ts">
  import { untrack } from 'svelte';
  import { ConfigProvider, Input, theme, type ComponentSize, type ThemeConfig } from 'antd-svelte';
  import CompactThemeControls from './CompactThemeControls.svelte';

  let { initialMode = 'native', initialPreset = 'compact', initialSize = 'middle' }: {
    initialMode?: string; initialPreset?: string; initialSize?: ComponentSize;
  } = $props();
  let mode = $state(untrack(() => initialMode));
  let preset = $state(untrack(() => initialPreset));
  let size = $state<ComponentSize>(untrack(() => initialSize));
  let compact = $derived(preset.includes('compact'));
  let dark = $derived(preset.includes('dark'));
  let algorithm = $derived([
    dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
    ...(compact ? [theme.compactAlgorithm] : [])
  ]);
  let config = $derived<ThemeConfig>(preset === 'custom-compact' ? {
    algorithm,
    token: { fontSize: 18, controlHeight: 44, lineWidth: 2 },
    components: { Input: { paddingInline: 15 }, Button: { paddingInline: 18 } }
  } : mode === 'source' ? { algorithm }
    : { compact, mode: dark ? 'dark' : 'light', ...(mode === 'native-token' ? { token: {} } : {}) });
</script>

<section id="compact-theme-fixture">
  <h2>Compact theme metrics</h2>
  <label>Compact theme mode <select bind:value={mode} aria-label="Compact theme mode">
    <option value="native">Native flags</option><option value="source">Source algorithm</option>
    <option value="native-token">Native flags with token</option>
    <option value="source-parent">Native flags in source parent</option>
  </select></label>
  <label>Compact theme preset <select bind:value={preset} aria-label="Compact theme preset">
    <option value="default">Default</option><option value="dark">Dark</option>
    <option value="compact">Compact</option><option value="dark-compact">Dark compact</option>
    <option value="custom-compact">Custom compact</option>
  </select></label>
  <label>Compact control size <select bind:value={size} aria-label="Compact control size">
    <option value="small">Small</option><option value="middle">Middle</option>
    <option value="large">Large</option>
  </select></label>
  <ConfigProvider theme={mode === 'source-parent'
    ? { token: {}, cssVar: { key: 'compact-metrics-parent' } } : undefined}>
    <ConfigProvider theme={config} componentSize={size} class="compact-metrics-provider">
      <CompactThemeControls id="compact-metrics" />
      <Input id="compact-style-priority" aria-label="Compact style priority"
        style="--ant-input-padding-block:9px;--ant-input-padding-inline:17px" />
      <ConfigProvider><CompactThemeControls id="compact-inherited" /></ConfigProvider>
      <ConfigProvider theme={{ compact: false }}>
        <CompactThemeControls id="compact-normal-child" />
      </ConfigProvider>
      <ConfigProvider theme={{ inherit: false }}>
        <CompactThemeControls id="compact-reset-child" />
      </ConfigProvider>
    </ConfigProvider>
  </ConfigProvider>
  <ConfigProvider><CompactThemeControls id="compact-outside" /></ConfigProvider>
</section>
