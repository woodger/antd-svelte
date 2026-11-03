<script lang="ts">
  import { onMount, untrack, type Snippet } from 'svelte';
  import { ConfigProvider, Tabs, Select, type TabsMoreProps } from 'antd-svelte';
  import type { TabsMoreRuntimeCase } from './tabs-more-runtime-presets';
  import TabsMoreRuntimeContent from './TabsMoreRuntimeContent.svelte';
  import './tabs-more-runtime.css';

  let {
    sample,
    mounted = true,
    styled = false,
    nested = false,
    motion = true,
    destroy = false,
    autofocus = false
  }: {
    sample: TabsMoreRuntimeCase;
    mounted?: boolean;
    styled?: boolean;
    nested?: boolean;
    motion?: boolean;
    destroy?: boolean;
    autofocus?: boolean;
  } = $props();
  let ownerVisible = $state(false);
  let lifecycle = $state<string[]>([]);
  let events = $state<string[]>([]);
  let changes = $state<string[]>([]);
  let more = $derived.by(() => {
    const options: TabsMoreProps = {
      icon: 'Runtime More',
      trigger: 'click',
      ...sample.more,
      autoDestroy: destroy || sample.more?.autoDestroy,
      autoFocus: autofocus || sample.more?.autoFocus,
      onOverlayClick: () => events.push('overlay:click'),
      overlayStyle: styled ? 'padding-top:13px;color:rgb(70,80,90)' : sample.more?.overlayStyle
    };
    if (sample.raw) options.overlay = raw;
    if (sample.wrap) options.popupRender = wrapped;
    if (sample.controlled) options.visible = ownerVisible;
    if (sample.undefinedVisible) options.visible = undefined;
    if (sample.undefinedEnterDelay) options.mouseEnterDelay = undefined;
    if (sample.controlled || sample.callbackOnly) options.onVisibleChange = value => {
      events.push(`visible:${value}`);
      if (sample.controlled) ownerVisible = value;
    };
    return options;
  });
  const record = (event: string) => untrack(() => lifecycle.push(event));
  onMount(() => {
    if (!sample.overrideDuration) return;
    const style = document.createElement('style');
    style.textContent = '.ant-tabs-dropdown { animation-duration: .35s; }';
    document.head.append(style);
    return () => style.remove();
  });
</script>

<style>
  .stage { width: 360px; margin-top: 240px; }
</style>

{#snippet raw()}
  <TabsMoreRuntimeContent {record} />
  {#if nested}
    <Select aria-label="Nested raw More select" options={[{ value: 'a', label: 'Alpha' }]} />
  {/if}
{/snippet}
{#snippet wrapped(menu: Snippet)}
  <TabsMoreRuntimeContent {record} />
  {@render menu()}
{/snippet}

<input aria-label="Runtime More outside" />
<ConfigProvider theme={{
  cssVar: { key: 'tabs-more-runtime' },
  token: { motion: motion && !sample.motionOff }
}}>
  <div class="stage">
    {#if mounted}
      <Tabs id="tabs-more-runtime-main" {more} items={Array.from({ length: 10 }, (_, index) => ({
        key: String(index), label: `Tab ${index + 1}`, disabled: index === 2
      }))} onTabClick={key => events.push(`tab:${key}`)} onChange={key => changes.push(key)} />
    {/if}
  </div>
</ConfigProvider>
<output aria-label="Runtime More lifecycle">{JSON.stringify(lifecycle)}</output>
<output aria-label="Runtime More events">{JSON.stringify(events)}</output>
<output aria-label="Runtime More changes">{JSON.stringify(changes)}</output>
