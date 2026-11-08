<script lang="ts">
  import {
    App,
    Layout,
    LayoutSider,
    LayoutHeader,
    LayoutContent,
    LayoutFooter,
    theme
  } from 'antd-svelte';
  export interface ConfigPrefixSample {
    id: string;
    prefix?: string;
    childPrefix?: string;
    childTheme?: boolean;
    reset?: boolean;
    clearVariablePrefix?: boolean;
    noTheme?: boolean;
    rtl?: boolean;
    variablePrefix?: string;
    app?: string;
    layout?: string;
    sider?: string;
    header?: string;
    content?: string;
    footer?: string;
  }
  let { scope, sample, local = true }: {
    scope: string;
    sample: ConfigPrefixSample;
    local?: boolean;
  } = $props();
  const token = theme.useToken();
</script>

<div data-prefix-scope={scope} data-prefix-token={JSON.stringify({
  fontSize: token.cssVar.fontSize, colorText: token.cssVar.colorText
})}>
  <App prefixCls={local ? sample.app : undefined}>
    <Layout prefixCls={local ? sample.layout : undefined} data-prefix-part="layout">
      <LayoutSider prefixCls={local ? sample.sider : undefined} data-prefix-part="sider"
        collapsible width={120}>Sidebar</LayoutSider>
      <LayoutHeader prefixCls={local ? sample.header : undefined}
        data-prefix-part="header">Header</LayoutHeader>
      <LayoutContent prefixCls={local ? sample.content : undefined} data-prefix-part="content">
        <input aria-label={`${scope} prefix draft`} value="initial draft" />
      </LayoutContent>
      <LayoutFooter prefixCls={local ? sample.footer : undefined}
        data-prefix-part="footer">Footer</LayoutFooter>
    </Layout>
  </App>
</div>
