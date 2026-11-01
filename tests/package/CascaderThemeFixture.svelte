<script lang="ts">
  import { Cascader, CascaderPanel, ConfigProvider } from 'antd-svelte';
  import { cascaderThemePresets } from '../browser/fixtures/cascader-theme-presets';

  let { preset = 'default', native = false, panelOnly = false }: {
    preset?: string;
    native?: boolean;
    panelOnly?: boolean;
  } = $props();
  const options = [{ value: 'p', label: 'Parent', children: [{ value: 'a', label: 'Alpha' }] }];
</script>

<ConfigProvider theme={native ? { compact: true } : {
  ...cascaderThemePresets[preset],
  cssVar: { ...cascaderThemePresets[preset].cssVar, key: 'cascader-ssr' }
}}>
  {#if !panelOnly}
    <Cascader {options} value={['p', 'a']} aria-label="SSR path" defaultOpen style="width:240px" />
    <Cascader {options} value={[[ 'p', 'a' ]]} multiple aria-label="SSR multiple path" />
  {/if}
  <CascaderPanel {options} value={['p', 'a']} aria-label="SSR path panel" />
</ConfigProvider>
