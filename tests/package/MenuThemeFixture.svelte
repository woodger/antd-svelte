<script lang="ts">
  import { ConfigProvider, Menu, type MenuItemType, type MenuMode } from 'antd-svelte';
  import { menuThemePresets } from '../browser/fixtures/menu-theme-presets';

  let { preset = 'default', native = false, mode = 'vertical', override = false }: {
    preset?: string;
    native?: boolean;
    mode?: MenuMode;
    override?: boolean;
  } = $props();
  const items: MenuItemType[] = [
    { key: 'home', label: home },
    { key: 'parent', label: 'Parent', children: [{ key: 'leaf', label: 'Leaf' }] }
  ];
  const browserOnly = () => { throw new Error('browser only'); };
</script>

{#snippet home()}<a href="/overview">Overview</a>{/snippet}
<ConfigProvider theme={native ? { compact: true } : {
  ...menuThemePresets[preset],
  cssVar: { ...menuThemePresets[preset].cssVar, key: 'menu-ssr' }
}}>
  <Menu {items} {mode} selectedKeys={['leaf']} openKeys={['parent']}
    onOpenChange={browserOnly} onSelect={browserOnly} onClick={browserOnly}
    style={override ? '--ant-menu-item-selected-bg:#ffddee' : undefined} />
</ConfigProvider>
