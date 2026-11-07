<script lang="ts">
  import {
    ConfigProvider,
    Tabs,
    type ComponentSize,
    type TabsPlacement,
    type TabsPosition,
    type TabsType
  } from 'antd-svelte';
  import reference from './ant-design-tabs-layout-metrics.json';

  let sample = $state(reference.cases[0].name);
  let interactive = $state(false);
  let centered = $state(false);
  let gutter = $state<number | undefined>();
  let placement = $state<TabsPlacement>('top');
  let legacyPlacement = $state(false);
  let physicalPlacement = $state<TabsPosition>('left');
  let type = $state<TabsType>('line');
  let size = $state<ComponentSize | 'medium' | ''>('');
  let providerSize = $state<ComponentSize>('medium');
  let rtl = $state(false);
  let dark = $state(false);
  let compact = $state(false);
  let narrow = $state(false);
  let mounted = $state(true);
  let headerStyle = $state('');
  let current = $state<string | undefined>('');
  let changes = $state<string[]>([]);
  let clicks = $state<string[]>([]);
  let selected = $derived(reference.cases.find(item => item.name === sample)!);
  let options = $derived(interactive ? {
    direction: rtl ? 'rtl' as const : 'ltr' as const,
    tabPlacement: placement,
    type,
    centered,
    gutter,
    headerStyle
  } : selected);
</script>

<style>
  label { display: block; }
  .stage { width: 760px; }
  .stage.narrow { width: 200px; }
</style>

{#snippet alpha()}<input name="alpha" aria-label="Layout Alpha draft" value="Alpha draft" />{/snippet}
{#snippet beta()}<input name="beta" aria-label="Layout Beta draft" value="Beta draft" />{/snippet}
<section id="tabs-layout-fixture">
  <h2>Tabs layout</h2>
  <label>Tabs layout reference <select aria-label="Tabs layout reference" bind:value={sample}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={interactive} /> Interactive Tabs layout</label>
  <label><input type="checkbox" bind:checked={centered} /> Center Tabs layout</label>
  <label>Tabs layout gap <input type="number" step="any" bind:value={gutter} /></label>
  <label>Tabs layout placement <select aria-label="Tabs layout placement" bind:value={placement}>
    {#each ['top', 'bottom', 'start', 'end'] as value}<option>{value}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={legacyPlacement} /> Use legacy Tabs placement</label>
  <label>Tabs physical position <select aria-label="Tabs physical position" bind:value={physicalPlacement}>
    {#each ['top', 'right', 'bottom', 'left'] as value}<option>{value}</option>{/each}
  </select></label>
  <label>Tabs layout type <select aria-label="Tabs layout type" bind:value={type}>
    {#each ['line', 'card', 'editable-card'] as value}<option>{value}</option>{/each}
  </select></label>
  <label>Tabs layout size <select aria-label="Tabs layout size" bind:value={size}>
    <option value="">inherit</option>
    {#each ['small', 'medium', 'large'] as value}<option>{value}</option>{/each}
  </select></label>
  <label>Tabs provider size <select aria-label="Tabs provider size" bind:value={providerSize}>
    {#each ['small', 'medium', 'large'] as value}<option>{value}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={rtl} /> RTL Tabs layout</label>
  <label><input type="checkbox" bind:checked={dark} /> Dark Tabs layout</label>
  <label><input type="checkbox" bind:checked={compact} /> Compact Tabs layout</label>
  <label><input type="checkbox" bind:checked={narrow} /> Narrow Tabs layout</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount Tabs layout</label>
  <label>Tabs header style <input bind:value={headerStyle} /></label>
  <input aria-label="Tabs layout outside" />
  <ConfigProvider direction={options.direction === 'rtl' ? 'rtl' : 'ltr'}
    componentSize={interactive ? providerSize : undefined}
    theme={{ mode: dark ? 'dark' : 'light', compact }}>
    <div class="stage" class:narrow>
      {#if mounted}
        <Tabs id="tabs-layout-main" aria-label="Layout sections" bind:activeKey={current}
          type={options.type as TabsType}
          tabPlacement={interactive && legacyPlacement ? undefined : options.tabPlacement as TabsPlacement}
          tabPosition={interactive ? physicalPlacement : undefined}
          size={interactive ? size || undefined : undefined}
          centered={options.centered} tabBarGutter={options.gutter}
          tabBarStyle={options.headerStyle} style="height:320px;color:rgb(170,20,30)"
          items={!interactive && selected.empty ? [] : [
            { key: '', label: 'Alpha', children: alpha },
            { key: 'locked', label: 'Locked', disabled: true },
            { key: 'beta', label: 'Beta', children: beta }
          ]} onChange={key => changes = [...changes, key]}
          onTabClick={key => clicks = [...clicks, key]} />
      {/if}
    </div>
  </ConfigProvider>
  <output aria-label="Tabs layout changes">{JSON.stringify(changes)}</output>
  <output aria-label="Tabs layout clicks">{JSON.stringify(clicks)}</output>
</section>
