<script lang="ts">
  import {
    ConfigProvider,
    Tabs,
    type ComponentSize,
    type TabsPlacement
  } from 'antd-svelte';
  import reference from './ant-design-tabs-semantic-reference.json';
  import {
    tabsSemanticSettings,
    type TabsSemanticCase,
    type TabsSemanticTrace
  } from './tabs-semantic-presets';

  let name = $state(reference.cases[0].name);
  let sample: TabsSemanticCase = $derived(reference.cases.find(item => item.name === name)!);
  let configured = $state(true);
  let mounted = $state(true);
  let root = $state<HTMLDivElement>();
  let current = $state<string | undefined>('0');
  let nativeClicks = $state(0);
  let changes = $state<string[]>([]);
  let settings = $derived(tabsSemanticSettings(sample, info => {
    if (Reflect.get(window, 'tabsSemanticInfoCase') !== sample.name) {
      Reflect.set(window, 'tabsSemanticInfoCase', sample.name);
      Reflect.set(window, 'tabsSemanticInfo', []);
    }
    const entries: TabsSemanticTrace[] = Reflect.get(window, 'tabsSemanticInfo');
    entries.push(info);
  }));
</script>

<style>
  label { display: block; }
  .stage { width: 360px; }
</style>

{#snippet draft()}<input aria-label="Semantic Tabs draft" name="draft" value="Initial draft" />{/snippet}
{#snippet tabs()}
  {#if mounted}
    <Tabs {...settings.local} id="tabs-semantic-main" bind:nativeElement={root} bind:activeKey={current}
      aria-label="Semantic sections" title="Native Tabs root" data-native-owner="semantic"
      onclick={() => nativeClicks++} onChange={key => changes.push(key)}
      type={sample.defaultType ? undefined : 'editable-card'}
      size={sample.size as ComponentSize | 'medium' | undefined}
      tabPlacement={sample.placement as TabsPlacement | undefined}
      style={['height:280px', settings.local.style].filter(Boolean).join(';')}
      items={Array.from({ length: 10 }, (_, index) => ({
        key: String(index),
        label: `Tab ${index + 1}`,
        disabled: index === 2,
        destroyOnHidden: index === 1 ? false : undefined,
        children: index === 0 ? draft : undefined
      }))} />
  {/if}
{/snippet}
<section id="tabs-semantic-fixture">
  <h2>Tabs semantic slots</h2>
  <label>Tabs semantic reference <select aria-label="Tabs semantic reference" bind:value={name}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={configured} /> Apply global Tabs config</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount semantic Tabs</label>
  <input aria-label="Semantic Tabs outside" />
  <ConfigProvider componentSize={sample.defaultSize ? undefined : 'small'}
    direction={sample.rtl ? 'rtl' : 'ltr'}
    tabs={configured ? settings.context : undefined}>
    <div class="stage">
      {#if sample.nested}<ConfigProvider tabs={{ addIcon: 'INNER' }}>{@render tabs()}</ConfigProvider>
      {:else}{@render tabs()}{/if}
    </div>
  </ConfigProvider>
  <output aria-label="Semantic native root">{root?.id ?? 'none'}</output>
  <output aria-label="Semantic native clicks">{nativeClicks}</output>
  <output aria-label="Semantic Tabs changes">{JSON.stringify(changes)}</output>
</section>
