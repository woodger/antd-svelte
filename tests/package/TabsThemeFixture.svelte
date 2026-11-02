<script lang="ts">
  import { ConfigProvider, Tabs } from 'antd-svelte';
  import { tabsThemePresets } from '../browser/fixtures/tabs-theme-presets';

  let { preset = 'default', native = false, override = false }: {
    preset?: string;
    native?: boolean;
    override?: boolean;
  } = $props();
  const browserOnly = () => { throw new Error('Unexpected browser callback during SSR'); };
</script>

<ConfigProvider theme={native ? { compact: true, primary: 'purple' } : {
  ...tabsThemePresets[preset],
  cssVar: { ...tabsThemePresets[preset].cssVar, key: 'tabs-theme-ssr' }
}}>
  <Tabs type="editable-card" items={[{ key: 'first', label: 'First' }]}
    style={override ? '--ant-tabs-card-height:51px' : undefined}
    indicator={{ size: browserOnly }} onTabScroll={browserOnly} onEdit={browserOnly} />
</ConfigProvider>
