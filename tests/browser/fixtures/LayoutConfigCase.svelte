<script lang="ts">
  import {
    ConfigProvider, Layout, LayoutHeader, LayoutContent, LayoutFooter, LayoutSider,
    type LayoutCollapseType
  } from 'antd-svelte';
  import { layoutConfigRecord, type LayoutConfigSample } from './layout-config-cases';

  let { sample, interactive = false }: {
    sample: LayoutConfigSample;
    interactive?: boolean;
  } = $props();
  let context = $derived(layoutConfigRecord(sample.context));
  let local = $derived(layoutConfigRecord(sample.local));
  let inner = $derived(layoutConfigRecord(sample.inner));
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
  <div data-layout-config={id}>
    <Layout {...local} rootClassName={sample.local?.rootClassName}
      data-layout-part="root" hasSider={sample.hasSider}>
      {#if sample.withSider}
        <LayoutSider width={120} data-layout-part="sider" bind:collapsed collapsible={interactive}
          onCollapse={(collapsed, type) => { changes = [...changes, { collapsed, type }]; }}>
          Sidebar
        </LayoutSider>
      {/if}
      {@render sections(false)}
    </Layout>
    {@render sections(true)}
    <LayoutSider data-layout-part="standalone-sider"
      class={sample.sectionStyle ? 'local-sider' : undefined} style={sectionStyle}>sider</LayoutSider>
  </div>
{/snippet}

<ConfigProvider direction={sample.direction} theme={{ token: { motion: false } }} layout={context}>
  {@render layout('normal')}
  <ConfigProvider layout={inner}>{@render layout('nested')}</ConfigProvider>
</ConfigProvider>
<ConfigProvider direction={sample.direction} theme={{ token: { motion: false } }}
  layout={{ class: 'inner-sibling', style: 'padding:13px' }}>
  {@render layout('sibling')}
</ConfigProvider>
<output aria-label="Layout config changes">{JSON.stringify(changes)}</output>
