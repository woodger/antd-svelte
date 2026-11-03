<script lang="ts">
  import { untrack, type Snippet } from 'svelte';
  import {
    ColorPicker,
    ConfigProvider,
    Tabs,
    Tour,
    type ConfigProviderProps,
    type TabsDefaultTabBar,
    type TabsTabBarProps,
    type TabsMoreProps
  } from 'antd-svelte';
  import type { PopupContainerCase } from './popup-container-presets';
  import PopupContainerContent from './PopupContainerContent.svelte';

  let {
    sample,
    mounted = true,
    revision = 0,
    alternate = false,
    dark = false,
    onCall
  }: {
    sample: PopupContainerCase;
    mounted?: boolean;
    revision?: number;
    alternate?: boolean;
    dark?: boolean;
    onCall?: () => void;
  } = $props();
  let shadow = $state<ShadowRoot>();
  let calls = $state<{ getter: string; trigger: string; }[]>([]);
  let parentOptions = $derived.by(() => {
    void revision;
    const target = alternate ? 'child' : sample.parent ?? 'parent';
    const options: Partial<ConfigProviderProps> = {};
    if (sample.parent !== 'none') options.getPopupContainer = trigger =>
      getContainer('parent', target, trigger);
    return options;
  });
  let childOptions = $derived.by(() => {
    const options: Partial<ConfigProviderProps> = {};
    if (sample.child === 'undefined') options.getPopupContainer = undefined;
    else if (sample.child && sample.child !== 'absent') {
      const target = sample.child;
      options.getPopupContainer = trigger => getContainer('child', target, trigger);
    }
    if (sample.resetTheme) options.theme = { inherit: false, token: { motion: false } };
    return options;
  });
  let localOptions = $derived.by(() => {
    const options: { getPopupContainer?: (trigger?: HTMLElement) => HTMLElement; } = {};
    if (sample.local === 'undefined') options.getPopupContainer = undefined;
    else if (sample.local === 'local') options.getPopupContainer = trigger => {
      record('local', trigger);
      return document.getElementById('provider-local')!;
    };
    return options;
  });
  let more = $derived.by(() => {
    const options: TabsMoreProps = { trigger: 'click' };
    if (!sample.menu) options.overlay = content;
    if (sample.more === 'undefined') options.getPopupContainer = undefined;
    else if (sample.more === 'more') options.getPopupContainer = trigger => {
      record('more', trigger);
      return document.getElementById('provider-more')!;
    };
    return options;
  });

  function record(getter: string, trigger?: HTMLElement) {
    untrack(() => {
      onCall?.();
      calls.push({
        getter,
        trigger: !trigger ? 'none'
          : trigger.classList.contains('ant-tabs-nav-more') ? 'tabs-more'
          : trigger.classList.contains('ant-color-picker-trigger') ? 'color-picker'
          : trigger.classList.contains('ant-tour-target-placeholder') ? 'tour-placeholder' : 'other'
      });
    });
  }

  function getContainer(getter: string, target: string, trigger?: HTMLElement) {
    record(getter, trigger);
    return target === 'shadow' ? shadow ?? document.body
      : document.getElementById(`provider-${target}`)!;
  }

  function overrideBar(bar: TabsTabBarProps): TabsTabBarProps {
    if (sample.bar === 'undefined') return { ...bar, getPopupContainer: undefined };
    if (sample.bar === 'local') return { ...bar, getPopupContainer: trigger => {
      record('bar', trigger);
      return document.getElementById('provider-local')!;
    } };
    return bar;
  }
</script>

{#snippet content()}<PopupContainerContent />{/snippet}
{#snippet colorPanel(panel: Snippet)}<PopupContainerContent>{@render panel()}</PopupContainerContent>{/snippet}
{#snippet renderBar(bar: TabsTabBarProps, DefaultBar: TabsDefaultTabBar)}
  {@render DefaultBar(overrideBar(bar))}
{/snippet}

<div id="provider-parent" data-container-target="parent"></div>
<div id="provider-child" data-container-target="child"></div>
<div id="provider-local" data-container-target="local"></div>
<div id="provider-more" data-container-target="more"></div>
<div id="provider-shadow" data-container-target="shadow" {@attach element => {
  const root = element.attachShadow({ mode: 'open' });
  // Как у потребителя ShadowRoot: его собственные стили не берутся из document.
  const style = element.ownerDocument.createElement('style');
  style.textContent = '[popover]{position:fixed;inset:auto;border:0;margin:0;padding:0}';
  root.append(style);
  shadow = root;
}}></div>
<div style="width:280px;margin:100px">
  <ConfigProvider {...parentOptions} theme={{
    mode: dark ? 'dark' : 'light', token: { motion: false }, cssVar: { key: 'provider-container' }
  }}>
    <ConfigProvider {...childOptions}>
      {#if mounted}
        {#if sample.component === 'tabs'}
          <Tabs id="provider-tabs" {...localOptions} {more}
            renderTabBar={sample.bar ? renderBar : undefined} items={Array.from(
            { length: 10 }, (_, index) => ({ key: String(index), label: `Tab ${index + 1}` })
          )} />
        {:else if sample.component === 'color-picker'}
          <ColorPicker aria-label="Container color picker" {...localOptions}
            defaultValue="#123456" panelRender={colorPanel} />
        {:else}
          <Tour {...localOptions} open steps={[{
            title: 'Container tour', target: () => document.getElementById('provider-tour-target')
          }]} />
        {/if}
      {/if}
    </ConfigProvider>
  </ConfigProvider>
</div>
<button type="button" id="provider-tour-target">Tour target</button>
<output aria-label="Container calls">{JSON.stringify(calls)}</output>
