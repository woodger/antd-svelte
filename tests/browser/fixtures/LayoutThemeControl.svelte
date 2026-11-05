<script lang="ts">
  import {
    ConfigProvider,
    Layout,
    LayoutHeader,
    LayoutContent,
    LayoutFooter,
    LayoutSider,
    type LayoutCollapseType
  } from 'antd-svelte';

  let { id, priority, prefix = 'ant' }: {
    id: string;
    priority?: boolean;
    prefix?: string;
  } = $props();
  let zero = $derived(['zero', 'zero-light', 'rtl', 'reverse'].includes(id));
  let light = $derived(['light', 'zero-light'].includes(id));
  let collapsed = $state<boolean>();
  let root = $state<HTMLElement>();
  let sider = $state<HTMLElement>();
  let changes = $state<{ collapsed: boolean; type: LayoutCollapseType }[]>([]);
</script>

<ConfigProvider direction={id === 'rtl' ? 'rtl' : 'ltr'}>
  <div data-layout-theme={id} dir={id === 'rtl' ? 'rtl' : 'ltr'}
    style="width:650px;font-size:14px;line-height:22px;color:rgb(31,41,51)">
    <Layout hasSider bind:nativeElement={root} style={[
      'height:240px;transform:translateZ(0)',
      id === 'root-variable' && `--${prefix}-layout-header-height:94px`,
      priority && 'background:#fff0f6'
    ].filter(Boolean).join(';')}>
      <LayoutSider bind:nativeElement={sider} bind:collapsed defaultCollapsed={zero}
        collapsible collapsedWidth={zero ? 0 : 80} reverseArrow={id === 'reverse'}
        theme={light ? 'light' : 'dark'}
        styles={priority ? { root: 'background:#e6fffb', body: 'padding:5px' } : undefined}
        style={priority ? 'background:#fffbe6;width:999px' : undefined}
        zeroWidthTriggerStyle={priority ? 'height:31px;background:#ffd6e7' : undefined}
        onCollapse={(collapsed, type) => changes = [...changes, { collapsed, type }]}>
        <input aria-label={`Layout draft ${id}`} value="Draft" />
      </LayoutSider>
      <Layout style={[
        'min-width:0',
        id === 'root-variable' && `--${prefix}-layout-header-height:94px`
      ].filter(Boolean).join(';')}>
        <LayoutHeader style={priority
          ? 'height:66px;line-height:66px;background:#391085' : undefined}>Header</LayoutHeader>
        <LayoutContent>Content</LayoutContent><LayoutFooter>Footer</LayoutFooter>
      </Layout>
    </Layout>
  </div>
</ConfigProvider>
<output aria-label={`Layout theme changes ${id}`}>{JSON.stringify(changes)}</output>
<output aria-label={`Layout theme refs ${id}`}>{root && sider ? 'mounted' : 'empty'}</output>
