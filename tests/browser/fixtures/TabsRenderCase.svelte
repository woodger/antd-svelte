<script lang="ts">
  import { untrack } from 'svelte';
  import { createAttachmentKey } from 'svelte/attachments';
  import {
    ConfigProvider,
    Tabs,
    getTabsItemId,
    theme,
    type TabsDefaultTabBar,
    type TabsItem,
    type TabsTabAttributes,
    type TabsTabNode,
    type TabsTabBarProps
  } from 'antd-svelte';
  import { tabsRenderProps, type TabsRenderCase } from './tabs-render-presets';
  import TabsRenderContent from './TabsRenderContent.svelte';

  let {
    sample,
    updated = false,
    reverse = false,
    compact = false,
    custom = true,
    keyboard = false,
    cancel = false,
    observeScroll = false,
    onAttachment,
    onHeaderRef,
    onLifecycle
  }: {
    sample: TabsRenderCase;
    updated?: boolean;
    reverse?: boolean;
    compact?: boolean;
    custom?: boolean;
    keyboard?: boolean;
    cancel?: boolean;
    observeScroll?: boolean;
    onAttachment?: (event: string) => void;
    onHeaderRef?: (event: string) => void;
    onLifecycle?: (event: string) => void;
  } = $props();
  let root = $state<HTMLDivElement>();
  let header = $state<HTMLDivElement | null>(null);
  let current = $state<string | undefined>('alpha');
  let trace = $state<string[]>([]);
  let clickEvents = $state<{
    mouse: boolean;
    type: string;
    target: string | null;
    currentTarget: string | null;
    ctrlKey: boolean;
    controlState: boolean;
  }[]>([]);
  let scrolls = $state<string[]>([]);
  let keyEvents = $state<{ prevented: boolean; stopped: boolean; }[]>([]);
  let config = $derived(sample.root ?? {});
  let items = $derived.by(() => {
    const entries: TabsItem[] = Array.from(
      { length: config.count ?? (config.many ? 10 : 3) },
      (_, index) => ({
        key: index === 0 ? 'alpha' : index === 1 ? 'beta' : index === 2 ? 'locked' : String(index),
        label: index === 0 ? 'Alpha' : index === 1 ? 'Beta'
          : index === 2 ? 'Locked' : `Tab ${index + 1}`,
        disabled: index === 2,
        children: index === 0 ? alpha : index === 1 ? beta : undefined
      })
    );
    return reverse ? entries.toReversed() : entries;
  });
  const attachmentKey = createAttachmentKey();

  const headerRef = (element: HTMLDivElement | null) => {
    header = element;
    onHeaderRef?.(`old:${element ? 'set' : 'clear'}`);
  };
  const newHeaderRef = (element: HTMLDivElement | null) => {
    header = element;
    onHeaderRef?.(`new:${element ? 'set' : 'clear'}`);
  };

  function trackTab(element: HTMLElement) {
    const key = element.dataset.renderKey;
    untrack(() => onAttachment?.(`attach:${key}`));
    return () => untrack(() => onAttachment?.(`detach:${key}`));
  }

  function attributes(item: TabsItem, original: TabsTabAttributes): TabsTabAttributes {
    const result: TabsTabAttributes = {
      'data-render-key': item.key,
      title: `Custom ${item.key}`,
      draggable: true,
      role: 'button',
      tabindex: 0,
      'aria-roledescription': 'sortable',
      [attachmentKey]: trackTab
    };
    if (sample.node === 'style') result.style = [
      typeof original.style === 'string' ? original.style : undefined,
      'cursor:move;padding-left:15px'
    ].filter(Boolean).join(';');
    if (sample.node === 'intercept') result.onclick = () => trace.push(`node:${item.key}`);
    if (sample.node === 'forward') result.onclick = event => {
      trace.push(`node:${item.key}`);
      original.onclick?.(event);
    };
    if (sample.node === 'class') result.class = [original.class, 'o-node'];
    return result;
  }

  function barProps(
    props: TabsTabBarProps,
    children: TabsTabBarProps['children']
  ): TabsTabBarProps {
    const override = sample.override ?? {};
    const scrollPrefix = updated ? 'new' : 'old';
    return {
      ...props,
      ...override,
      ref: sample.ref ? updated ? newHeaderRef : headerRef : props.ref,
      more: sample.unsetMore ? undefined : 'more' in override ? override.more : props.more,
      style: updated ? `${override.style ?? props.style ?? ''};padding-top:15px` :
        'style' in override ? override.style : props.style,
      editable: sample.disableEditable ? undefined : override.editable ? {
        ...override.editable,
        onEdit: (action, info) => trace.push(`edit:${action}:${info.key ?? info.event.type}`)
      } : props.editable,
      onTabClick: sample.intercept || sample.forward ? (key, event) => {
        trace.push(`bar:${key}`);
        if (sample.forward) props.onTabClick(key, event);
      } : props.onTabClick,
      onTabScroll: observeScroll ? info => scrolls.push(`${scrollPrefix}:${info.direction}`)
        : props.onTabScroll,
      children: sample.node ? children : undefined
    };
  }

  function handleTabClick(key: string, event: MouseEvent) {
    trace.push(`click:${key}`);
    clickEvents.push({
      mouse: event instanceof MouseEvent,
      type: event.type,
      target: event.target instanceof HTMLElement ? event.target.textContent : null,
      currentTarget: event.currentTarget instanceof HTMLElement
        ? event.currentTarget.textContent : null,
      ctrlKey: event.ctrlKey,
      controlState: event.getModifierState('Control')
    });
    if (cancel) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
</script>

<style>
  .stage { width: 360px; }
</style>

{#snippet alpha()}<TabsRenderContent name="alpha" onLifecycle={event => onLifecycle?.(event)} />{/snippet}
{#snippet beta()}<TabsRenderContent name="beta" onLifecycle={event => onLifecycle?.(event)} />{/snippet}
{#snippet renderTabBar(props: TabsTabBarProps, DefaultTabBar: TabsDefaultTabBar)}
  {#snippet customNode(
    node: TabsTabNode,
    item: TabsItem,
    original: TabsTabAttributes
  )}
    {#if sample.node === 'wrapper'}<div class="o-node-wrapper" data-render-key={item.key}>{@render node()}</div>
    {:else}{@render node(attributes(item, original))}{/if}
  {/snippet}
  <output hidden data-tabs-render-props>{JSON.stringify(tabsRenderProps(props))}</output>
  {#if sample.renderer === 'manual'}
    <div role="tablist" aria-label="Custom sections" class="o-manual">
      {#each items as item (item.key)}
        <button type="button" role="tab" id={getTabsItemId(props.id, item.key, 'tab')}
          aria-controls={getTabsItemId(props.id, item.key, 'panel')}
          aria-selected={props.activeKey === item.key} disabled={item.disabled}
          onclick={event => props.onTabClick(item.key, event)}
          onkeydown={event => {
            if (keyboard && event.key === 'F2') {
              props.onTabClick(item.key, event);
              keyEvents.push({ prevented: event.defaultPrevented, stopped: event.cancelBubble });
            }
          }}>{item.label}</button>
      {/each}
    </div>
  {:else if sample.renderer !== 'empty'}
    <div class="o-bar-wrapper">{@render DefaultTabBar(barProps(props, customNode))}</div>
  {/if}
{/snippet}

<ConfigProvider direction={config.rtl ? 'rtl' : 'ltr'}
  theme={{
    cssVar: { key: 'tabs-render-reference' },
    token: { motion: false },
    algorithm: compact ? theme.compactAlgorithm : undefined
  }}>
  <form class="stage" id="tabs-render-form" onsubmit={event => event.preventDefault()}>
    <Tabs id="tabs-render-main" bind:nativeElement={root} bind:activeKey={current} {items}
      type={config.type} tabPlacement={config.placement} animated={config.animated}
      tabBarGutter={config.gutter} tabBarStyle={config.tabBarStyle}
      tabBarExtraContent={config.extraLeft || config.extraRight
        ? { left: config.extraLeft, right: config.extraRight } : undefined}
      locale={config.locale} moreIcon={config.moreIcon}
      classNames={config.classNames} styles={config.styles}
      renderTabBar={custom ? renderTabBar : undefined} onTabClick={handleTabClick}
      onChange={key => trace.push(`change:${key}`)} />
  </form>
</ConfigProvider>
<output aria-label="Render Tabs trace">{JSON.stringify(trace)}</output>
<output aria-label="Render Tabs click events">{JSON.stringify(clickEvents)}</output>
<output aria-label="Render Tabs scrolls">{JSON.stringify(scrolls)}</output>
<output aria-label="Render Tabs keyboard events">{JSON.stringify(keyEvents)}</output>
<output aria-label="Render Tabs native root">{root?.id ?? 'none'}</output>
<output hidden data-tabs-header-ref>{header !== null && header === root?.querySelector('.ant-tabs-nav')}</output>
