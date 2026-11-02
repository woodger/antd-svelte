<script lang="ts">
  import { ConfigProvider, Tabs, type TabsPlacement } from 'antd-svelte';
  import reference from './ant-design-tabs-motion-reference.json';
  import { tabsMotionSettings, type TabsMotionCase, type TabsMotionTrace } from './tabs-motion-presets';
  import TabsMotionContent from './TabsMotionContent.svelte';
  import './tabs-motion-fixture.css';

  let name = $state('default');
  let sample: TabsMotionCase = $derived(reference.cases.find(item => item.name === name)!);
  let current = $state<string | undefined>('alpha');
  let mounted = $state(true);
  let animated = $state(true);
  let holdPrepare = $state(false);
  let allowEnd = $state(true);
  let events = $state<string[]>([]);
  let changes = $state<string[]>([]);
  const pending = new Set<() => void>();
  let settings = $derived(tabsMotionSettings(
    sample,
    event => {
      let trace: TabsMotionTrace[] | undefined = Reflect.get(window, 'tabsMotionTrace');
      if (!trace) Reflect.set(window, 'tabsMotionTrace', trace = []);
      trace.push(event);
    },
    () => holdPrepare ? new Promise<void>(resolve => { pending.add(resolve); }) : Promise.resolve(),
    () => allowEnd
  ));

  function resolvePrepare() {
    for (const resolve of pending) resolve();
    pending.clear();
  }
</script>

<style>
  label { display: block; }
  .stage { width: 360px; }
</style>

{#snippet alpha()}<TabsMotionContent name="alpha" onLifecycle={event => events.push(event)} />{/snippet}
{#snippet beta()}<TabsMotionContent name="beta" onLifecycle={event => events.push(event)} />{/snippet}
<section id="tabs-motion-fixture">
  <h2>Tabs source motion</h2>
  <label>Tabs motion reference <select aria-label="Tabs motion reference" bind:value={name}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount motion Tabs</label>
  <label><input type="checkbox" bind:checked={animated} /> Enable Tabs animation</label>
  <label><input type="checkbox" bind:checked={holdPrepare} /> Hold motion prepare</label>
  <label><input type="checkbox" bind:checked={allowEnd} /> Allow motion end</label>
  <button type="button" onclick={resolvePrepare}>Resolve motion prepare</button>
  <button type="button" onclick={() => {
    events = [];
    changes = [];
    Reflect.set(window, 'tabsMotionTrace', []);
  }}>Reset motion observation</button>
  <button type="button" onclick={() => current = 'beta'}>Hide motion Alpha</button>
  <input aria-label="Motion Tabs outside" />
  <ConfigProvider theme={settings.theme} direction={sample.rtl ? 'rtl' : 'ltr'}>
    <form id="tabs-motion-form" class="stage" onsubmit={event => event.preventDefault()}>
      {#if mounted}
        <Tabs id="tabs-motion-main" aria-label="Animated sections" bind:activeKey={current}
          animated={animated ? settings.animated : false} destroyOnHidden={sample.destroy ?? true}
          tabPlacement={sample.placement as TabsPlacement | undefined}
          items={[
            { key: 'alpha', label: 'Alpha', children: alpha, forceRender: sample.force },
            { key: 'beta', label: 'Beta', children: beta, forceRender: sample.force }
          ]} onChange={key => changes.push(key)} />
      {/if}
    </form>
  </ConfigProvider>
  <output aria-label="Tabs motion lifecycle">{JSON.stringify(events)}</output>
  <output aria-label="Tabs motion changes">{JSON.stringify(changes)}</output>
</section>
