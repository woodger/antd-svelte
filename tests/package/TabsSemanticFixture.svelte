<script lang="ts">
  import {
    ConfigProvider,
    Tabs,
    type ComponentSize,
    type TabsPlacement
  } from 'antd-svelte';
  import reference from '../browser/fixtures/ant-design-tabs-semantic-reference.json';
  import {
    tabsSemanticSettings,
    type TabsSemanticCase,
    type TabsSemanticTrace
  } from '../browser/fixtures/tabs-semantic-presets';

  let { preset = 'layers', report }: {
    preset?: string;
    report?: (info: TabsSemanticTrace) => void;
  } = $props();
  let sample: TabsSemanticCase = $derived(reference.cases.find(item => item.name === preset)!);
  let settings = $derived(tabsSemanticSettings(sample, report));
  let root = $state<HTMLDivElement>();
  const browserOnly = () => { throw new Error('Unexpected browser callback during SSR'); };
</script>

{#snippet draft()}<input name="draft" aria-label="Semantic SSR draft" value="Initial draft" />{/snippet}
{#snippet tabs()}
  <Tabs {...settings.local} id="semantic-ssr" bind:nativeElement={root}
    aria-label="Semantic sections" title="Native Tabs root" data-native-owner="semantic"
    onclick={browserOnly} onChange={browserOnly} onEdit={browserOnly}
    onTabClick={browserOnly} onTabScroll={browserOnly} getPopupContainer={browserOnly}
    indicator={{ size: browserOnly }}
    type={sample.defaultType ? undefined : 'editable-card'}
    size={sample.size as ComponentSize | 'medium' | undefined}
    tabPlacement={sample.placement as TabsPlacement | undefined}
    items={Array.from({ length: 10 }, (_, index) => ({
      key: String(index),
      label: `Tab ${index + 1}`,
      disabled: index === 2,
      destroyInactiveTabPane: index === 1 ? false : undefined,
      children: index === 0 ? draft : undefined
    }))} />
{/snippet}
<ConfigProvider componentSize={sample.defaultSize ? undefined : 'small'}
  direction={sample.rtl ? 'rtl' : 'ltr'} tabs={settings.context}>
  {#if sample.nested}<ConfigProvider tabs={{ addIcon: 'INNER' }}>{@render tabs()}</ConfigProvider>
  {:else}{@render tabs()}{/if}
</ConfigProvider>
<output aria-label="SSR native root">{root?.id ?? 'none'}</output>
