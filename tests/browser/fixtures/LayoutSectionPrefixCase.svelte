<script lang="ts">
  import {
    ConfigProvider, Layout, LayoutHeader, LayoutContent, LayoutFooter, theme
  } from 'antd-svelte';
  import { layoutConfigRecord } from './layout-config-cases';
  import {
    layoutSectionPrefix, type LayoutSectionPrefixSample
  } from './layout-section-prefix-cases';

  let { sample, enabled = true, interactive = false, legacy = false }: {
    sample: LayoutSectionPrefixSample;
    enabled?: boolean;
    interactive?: boolean;
    legacy?: boolean;
  } = $props();
  const parts = ['header', 'content', 'footer'] as const;
  const components = { header: LayoutHeader, content: LayoutContent, footer: LayoutFooter };
  let parentStyle = $derived(layoutConfigRecord({ style: sample.parentStyle })?.style);
  let localStyle = $derived(layoutConfigRecord({ style: sample.localStyle })?.style);
  let resolvedTheme = $derived(legacy ? { mode: 'dark' as const, compact: true } : {
    ...sample.theme,
    token: { motion: false, ...sample.theme?.token },
    algorithm: sample.algorithms?.map(name => theme[name])
  });
</script>

{#snippet sections(id: string)}
  {#each parts as part}
    {@const Component = components[part]}
    <Component data-section-part={part} style={localStyle}
      prefixCls={enabled && id !== 'sibling' ? layoutSectionPrefix(sample, part) : undefined}>
      {part}
      {#if interactive}<label>{part} section draft<input /></label>{/if}
    </Component>
  {/each}
{/snippet}

<ConfigProvider direction={sample.direction} theme={resolvedTheme}>
  <div data-section-prefix="normal">
    <Layout prefixCls={sample.parentPrefix} style={parentStyle}>
      {@render sections('normal')}
    </Layout>
  </div>
  <div data-section-prefix="standalone">{@render sections('standalone')}</div>
  <div data-section-prefix="sibling"><Layout>{@render sections('sibling')}</Layout></div>
</ConfigProvider>
