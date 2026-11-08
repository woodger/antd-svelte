<script lang="ts">
  import {
    ConfigProvider, Layout, LayoutHeader, LayoutContent, LayoutFooter, LayoutSider,
    type LayoutCollapseType
  } from 'antd-svelte';
  import {
    layoutConfigRecord, layoutSiderLocalProps, type LayoutConfigSample
  } from './layout-config-cases';

  let { sample, interactive = false, showTrigger = false, legacyDark = false }: {
    sample: LayoutConfigSample;
    interactive?: boolean;
    showTrigger?: boolean;
    legacyDark?: boolean;
  } = $props();
  let context = $derived(layoutConfigRecord(sample.context));
  let local = $derived(layoutConfigRecord(sample.local));
  let inner = $derived(layoutConfigRecord(sample.inner));
  let siderLocal = $derived(layoutSiderLocalProps(sample));
  let sectionStyle = $derived(sample.sectionStyle ? 'color:#334455;padding-top:7px' : undefined);
  let collapsed = $state(false);
  let changes = $state<{ collapsed: boolean; type: LayoutCollapseType }[]>([]);
</script>

{#snippet sections(standalone: boolean)}
  <LayoutHeader data-layout-part={`${standalone ? 'standalone-' : ''}header`}
    class={sample.sectionStyle ? 'local-header' : undefined} style={sectionStyle}>header</LayoutHeader>
  <LayoutContent data-layout-part={`${standalone ? 'standalone-' : ''}content`}
    class={sample.sectionStyle ? 'local-content' : undefined} style={sectionStyle}>
    content
    {#if interactive && !standalone}<label>Layout config draft<input /></label>{/if}
  </LayoutContent>
  <LayoutFooter data-layout-part={`${standalone ? 'standalone-' : ''}footer`}
    class={sample.sectionStyle ? 'local-footer' : undefined} style={sectionStyle}>footer</LayoutFooter>
{/snippet}

{#snippet layout(id: string)}
  <div data-layout-config={id} data-layout-prefix={id}
    data-prefix={id === 'sibling' ? 'ant-layout' : sample.prefixCls || 'ant-layout'}
    data-sider-prefix={id === 'sibling' ? 'ant-layout-sider'
      : sample.siderPrefixCls || 'ant-layout-sider'}>
    <Layout {...local} rootClassName={sample.local?.rootClassName}
      data-layout-part="root" hasSider={sample.hasSider}
      prefixCls={id === 'sibling' ? undefined : sample.prefixCls}>
      {#if sample.withSider}
        <LayoutSider {...siderLocal} width={120} data-layout-part="sider"
          prefixCls={id === 'sibling' ? undefined : sample.siderPrefixCls}
          collapsed={interactive ? collapsed : sample.collapsed ?? collapsed}
          collapsedWidth={sample.collapsedWidth}
          theme={sample.siderTheme} reverseArrow={sample.reverseArrow}
          collapsible={interactive || showTrigger}
          onCollapse={(next, type) => {
            collapsed = next;
            changes = [...changes, { collapsed: next, type }];
          }}>
          Sidebar
          {#if interactive}<label>Layout sidebar draft<input /></label>{/if}
        </LayoutSider>
      {/if}
      {@render sections(false)}
    </Layout>
    {@render sections(true)}
    <LayoutSider data-layout-part="standalone-sider"
      class={sample.sectionStyle ? 'local-sider' : undefined} style={sectionStyle}>sider</LayoutSider>
  </div>
{/snippet}

<ConfigProvider direction={sample.direction} layout={context}
  theme={legacyDark ? { mode: 'dark', compact: true } : {
    ...sample.theme, token: { motion: false, ...sample.theme?.token }
  }}>
  {@render layout('normal')}
  <ConfigProvider layout={inner}>{@render layout('nested')}</ConfigProvider>
</ConfigProvider>
<ConfigProvider direction={sample.direction}
  theme={legacyDark ? { mode: 'dark', compact: true } : { token: { motion: false } }}
  layout={{ class: 'inner-sibling', style: 'padding:13px' }}>
  {@render layout('sibling')}
</ConfigProvider>
<output aria-label="Layout config changes">{JSON.stringify(changes)}</output>
