<script lang="ts">
  import { ConfigProvider, Dropdown } from 'antd-svelte';
  import { dropdownThemePresets } from '../browser/fixtures/dropdown-theme-presets';

  let { preset = 'default', native = false }: { preset?: string; native?: boolean; } = $props();
  const browserOnly = () => { throw new Error('browser only'); };
</script>

<ConfigProvider theme={native ? { compact: true } : {
  ...dropdownThemePresets[preset],
  cssVar: { ...dropdownThemePresets[preset].cssVar, key: 'dropdown-ssr' }
}}>
  <Dropdown defaultOpen arrow onOpenChange={browserOnly} menu={{
    items: [{ key: 'home', label: 'Overview', href: '/overview' }],
    onClick: browserOnly
  }}><button type="button">Open SSR Dropdown</button></Dropdown>
</ConfigProvider>
