<script lang="ts">
  import { Anchor, ConfigProvider } from 'antd-svelte';
  import { anchorThemePresets } from '../browser/fixtures/anchor-theme-presets';

  let { preset = 'default', native = false, semantic = false, affix = false }: {
    preset?: string;
    native?: boolean;
    semantic?: boolean;
    affix?: boolean;
  } = $props();
  const items = [{ key: 'a', href: '#overview', title: 'Overview', children: [
    { key: 'b', href: '#details', title: 'Details' }
  ] }];
  const browserOnly = () => { throw new Error('browser only'); };
</script>

<ConfigProvider theme={native ? { compact: true } : {
  ...anchorThemePresets[preset],
  cssVar: { ...anchorThemePresets[preset].cssVar, key: 'anchor-ssr' }
}}>
  <Anchor {items} {affix} getContainer={browserOnly} getCurrentAnchor={browserOnly}
    onChange={browserOnly} offsetTop={30}
    styles={semantic ? { root: '--ant-anchor-link-padding-inline-start:31px;max-height:200px' }
      : undefined}
    style={semantic ? '--ant-anchor-link-padding-inline-start:37px;max-height:100px' : undefined} />
</ConfigProvider>
