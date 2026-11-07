<script lang="ts">
  import {
    ConfigProvider,
    Tabs,
    type TabsIndicator,
    type TabsIndicatorSize,
    type TabsPlacement,
    type TabsScrollInfo
  } from 'antd-svelte';
  import reference from './ant-design-tabs-indicator-metrics.json';

  let name = $state(reference.cases[0].name);
  let selected = $derived(reference.cases.find(item => item.name === name)!);
  let mounted = $state(true);
  let overflow = $state(false);
  let empty = $state(false);
  let disabled = $state(false);
  let dark = $state(false);
  let compact = $state(false);
  let alternate = $state(false);
  let current = $state<string | undefined>('beta');
  let changes = $state<string[]>([]);
  let clicks = $state<string[]>([]);
  let scrolls = $state<TabsScrollInfo[]>([]);
  let owners = $state<string[]>([]);
  let indicator = $derived.by((): TabsIndicator => {
    const kind = selected.size;
    let size: TabsIndicatorSize | undefined;
    if (kind === 'fixed') size = 12.5;
    if (kind === 'function') size = origin => origin - 20;
    if (kind === 'zero') size = 0;
    if (kind === 'negative') size = -3;
    return {
      size,
      align: 'align' in selected ? selected.align as TabsIndicator['align'] : undefined
    };
  });
  let items = $derived(empty ? [] : Array.from({ length: overflow ? 16 : 3 }, (_, index) => ({
    key: index === 0 ? 'alpha' : index === 1 ? 'locked' : index === 2 ? 'beta' : String(index),
    label: index === 0 ? 'Alpha' : index === 1 ? 'Locked' : index === 2 ? 'Beta' : `Tab ${index + 1}`,
    disabled: disabled || index === 1,
    children: index === 2 ? draft : undefined
  })));

  function record(info: TabsScrollInfo, owner: string) {
    scrolls = [...scrolls, info];
    owners = [...owners, owner];
  }
</script>

<style>
  label { display: block; }
  .stage { width: 760px; }
  .stage.narrow { width: 360px; }
</style>

{#snippet draft()}<input aria-label="Indicator draft" name="draft" value="Beta draft" />{/snippet}
<section id="tabs-indicator-fixture">
  <h2>Tabs indicator</h2>
  <label>Tabs indicator reference <select aria-label="Tabs indicator reference" bind:value={name}>
    {#each reference.cases as sample}<option value={sample.name}>{sample.name}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount indicator Tabs</label>
  <label><input type="checkbox" bind:checked={overflow} /> Overflow indicator Tabs</label>
  <label><input type="checkbox" bind:checked={empty} /> Empty indicator Tabs</label>
  <label><input type="checkbox" bind:checked={disabled} /> Disable indicator tabs</label>
  <label><input type="checkbox" bind:checked={dark} /> Dark indicator Tabs</label>
  <label><input type="checkbox" bind:checked={compact} /> Compact indicator Tabs</label>
  <label><input type="checkbox" bind:checked={alternate} /> Replace scroll callback</label>
  <button type="button" onclick={() => { scrolls = []; owners = []; }}>Clear indicator events</button>
  <input aria-label="Indicator outside" />
  <ConfigProvider direction={selected.direction === 'rtl' ? 'rtl' : 'ltr'}
    theme={{ mode: dark ? 'dark' : 'light', compact }}>
    <div class="stage" class:narrow={overflow}>
      {#if mounted}
        <Tabs id="tabs-indicator-main" aria-label="Indicator sections" {items} {indicator}
          bind:activeKey={current} tabPlacement={selected.placement as TabsPlacement}
          tabBarGutter={12.5} style={`height:${overflow ? 180 : 320}px`}
          onTabScroll={alternate ? info => record(info, 'new') : info => record(info, 'original')}
          onChange={key => changes = [...changes, key]}
          onTabClick={key => clicks = [...clicks, key]} />
      {/if}
    </div>
  </ConfigProvider>
  <output aria-label="Indicator changes">{JSON.stringify(changes)}</output>
  <output aria-label="Indicator clicks">{JSON.stringify(clicks)}</output>
  <output aria-label="Indicator scrolls">{JSON.stringify(scrolls)}</output>
  <output aria-label="Indicator scroll owners">{JSON.stringify(owners)}</output>
</section>
