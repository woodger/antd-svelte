<script lang="ts">
  import { ConfigProvider, Tabs, type TabsPlacement } from 'antd-svelte';
  import reference from '../browser/fixtures/ant-design-tabs-motion-reference.json';
  import { tabsMotionSettings, type TabsMotionCase } from '../browser/fixtures/tabs-motion-presets';

  let { preset = 'default' }: { preset?: string; } = $props();
  let sample: TabsMotionCase = $derived(reference.cases.find(item => item.name === preset)!);
  const browserOnly = () => { throw new Error('Unexpected motion callback during SSR'); };
  let settings = $derived(tabsMotionSettings(sample, browserOnly, browserOnly));
</script>

{#snippet alpha()}<input name="alpha" value="alpha initial" />{/snippet}
{#snippet beta()}<input name="beta" value="beta initial" />{/snippet}
<ConfigProvider theme={settings.theme} direction={sample.rtl ? 'rtl' : 'ltr'}>
  <Tabs id="motion-ssr" aria-label="Animated sections" animated={settings.animated}
    destroyOnHidden={sample.destroy ?? true}
    tabPlacement={sample.placement as TabsPlacement | undefined}
    items={[
      { key: 'alpha', label: 'Alpha', children: alpha, forceRender: sample.force },
      { key: 'beta', label: 'Beta', children: beta, forceRender: sample.force }
    ]} onChange={browserOnly} onTabScroll={browserOnly} />
</ConfigProvider>
