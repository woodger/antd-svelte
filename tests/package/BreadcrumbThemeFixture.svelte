<script lang="ts">
  import { Breadcrumb, ConfigProvider, type BreadcrumbItem } from 'antd-svelte';
  import { breadcrumbThemePresets } from '../browser/fixtures/breadcrumb-theme-presets';

  let { preset = 'default', native = false, semantic = false }: {
    preset?: string;
    native?: boolean;
    semantic?: boolean;
  } = $props();
  const browserOnly = () => { throw new Error('browser only'); };
  const items: BreadcrumbItem[] = [
    { href: '/home', title: 'Home', onClick: browserOnly },
    {
      href: '/section',
      title: 'Section',
      menu: { items: [{ key: 'one', label: 'Menu One', path: '/one' }], onClick: browserOnly },
      dropdownProps: { open: true, trigger: 'click', onOpenChange: browserOnly }
    },
    { title: 'Current' }
  ];
</script>

<ConfigProvider theme={native ? { compact: true } : {
  ...breadcrumbThemePresets[preset],
  cssVar: { ...breadcrumbThemePresets[preset].cssVar, key: 'breadcrumb-ssr' }
}}>
  <Breadcrumb {items}
    styles={semantic ? { root: '--ant-breadcrumb-separator-margin:21px' } : undefined}
    style={semantic ? '--ant-breadcrumb-separator-margin:27px' : undefined} />
</ConfigProvider>
