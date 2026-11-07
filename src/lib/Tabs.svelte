<script lang="ts">
  import { onDestroy, untrack } from 'svelte';
  import TabsPanel from './TabsPanel.svelte';
  import TabsEditIcon from './TabsEditIcon.svelte';
  import TabsNav from './TabsNav.svelte';
  import TabsMoreIcon from './TabsMoreIcon.svelte';
  import { useConfig } from './config-context';
  import { useComponentTheme } from './theme-component.svelte';
  import { tabsSemantics } from './tabs-semantic.engine';
  import { getTabsAnimation } from './tabs-motion.engine';
  import { useToken } from './theme-context.svelte';
  import { getTabsClickEvent } from './tabs.dom';
  import { isTabsMobileDevice } from './tabs-overflow.engine';
  import type { TabsNavApi, TabsNavContext, TabsTabBarProps } from './tabs-nav.types';
  import {
    getTabsActiveKey,
    getTabsItemId,
    getTabsPlacement,
    normalizeTabsItems
  } from './tabs.engine';
  import type { TabsProps } from './tabs.types';

  let {
    items: sourceItems,
    activeKey = $bindable<string | undefined>(),
    defaultActiveKey,
    onChange,
    onTabClick,
    onTabScroll,
    indicator,
    type,
    animated,
    onEdit,
    hideAdd,
    addIcon,
    removeIcon,
    locale,
    more,
    moreIcon,
    tabPlacement,
    centered,
    tabBarGutter,
    tabBarStyle,
    size,
    destroyOnHidden,
    tabBarExtraContent,
    renderTabBar,
    id,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    class: className,
    rootClassName,
    classNames,
    styles,
    style,
    nativeElement = $bindable<HTMLDivElement>(),
    ...rest
  }: TabsProps = $props();

  const config = useConfig();
  let getPopupContainer = $derived(rest.getPopupContainer);
  let popupContainer = $derived(Object.hasOwn(rest, 'getPopupContainer')
    ? getPopupContainer : config.getPopupContainer);
  let attributes = $derived.by(() => {
    const { getPopupContainer: _container, ...attributes } = rest;
    return attributes;
  });
  const componentTheme = useComponentTheme('Tabs');
  const designTokens = useToken();
  const generatedId = $props.id();
  const initialDefault = untrack(() => defaultActiveKey);
  let root = $derived(nativeElement);
  let body = $state<HTMLDivElement>();
  let mobileDevice = $state(false);
  const navigations = new Set<TabsNavApi>();
  let mobile = $state(false);
  let repairFocus = $state(false);
  let retainedFocus: HTMLElement | undefined;
  let active = true;
  let rootId = $derived(id ?? `ant-tabs-${generatedId}`);
  let items = $derived(normalizeTabsItems(sourceItems));
  let selectedKey = $derived(getTabsActiveKey(items, activeKey ?? initialDefault));
  let resolvedSize = $derived(size ?? config.componentSize);
  let rootDestroy = $derived(destroyOnHidden ?? false);
  let placement = $derived(getTabsPlacement(
    tabPlacement ?? 'top',
    config.direction,
    mobile
  ));
  let editable = $derived(type === 'editable-card');
  let animation = $derived(getTabsAnimation(animated));
  let semanticProps = $derived({
    ...rest,
    items: items.map(item => ({ ...item, destroyOnHidden: item.destroyOnHidden })),
    activeKey,
    defaultActiveKey,
    onChange,
    onTabClick,
    onTabScroll,
    indicator,
    type,
    animated,
    onEdit,
    hideAdd,
    addIcon,
    removeIcon,
    locale,
    more,
    moreIcon,
    getPopupContainer,
    tabPlacement: tabPlacement === undefined ? undefined
      : getTabsPlacement(tabPlacement, config.direction),
    centered,
    tabBarGutter,
    tabBarStyle,
    size: size ?? config.explicitComponentSize,
    destroyOnHidden,
    tabBarExtraContent,
    renderTabBar,
    id,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    class: className,
    rootClassName,
    classNames,
    styles,
    style
  });
  let semantics = $derived(tabsSemantics(config.tabs, classNames, styles, semanticProps));
  let classes = $derived(semantics.classes);
  let slots = $derived(semantics.styles);

  $effect(() => {
    const media = window.matchMedia('(max-width: 575px)');
    const update = () => {
      mobile = media.matches;
    };

    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  });

  $effect(() => {
    mobileDevice = isTabsMobileDevice(window.navigator.userAgent);
  });

  const navContext: TabsNavContext = {
    get items() { return items; },
    get root() { return root; },
    get ownerId() { return rootId; },
    get rootPlacement() { return placement; },
    get centered() { return Boolean(centered); },
    get card() { return type === 'card' || editable; },
    get ariaLabel() { return ariaLabel; },
    get ariaLabelledby() { return ariaLabelledby; },
    get themeClassName() { return componentTheme.className; },
    get themeStyle() { return componentTheme.inheritedStyle; },
    get defaultMoreIcon() { return defaultMore; },
    register(api) {
      navigations.add(api);
      return () => { navigations.delete(api); };
    }
  };
  let resolvedMore = $derived({
    icon: config.tabs?.more?.icon ?? config.tabs?.moreIcon ?? moreIcon ?? defaultMore,
    transitionName: 'ant-slide-up',
    ...more
  });
  let bar = $derived<TabsTabBarProps>({
    id: rootId,
    activeKey: selectedKey,
    animated: animation,
    tabPosition: placement,
    rtl: config.direction === 'rtl',
    mobile: mobileDevice,
    editable: editable ? {
      onEdit: (action, info) => onEdit?.(action === 'add' ? info.event : info.key!, action),
      showAdd: hideAdd !== true,
      addIcon: (addIcon ?? config.tabs?.addIcon) || defaultAdd,
      removeIcon: removeIcon ?? config.tabs?.removeIcon ?? defaultRemove
    } : undefined,
    locale,
    more: resolvedMore,
    tabBarGutter,
    onTabClick: activate,
    onTabScroll,
    extra: tabBarExtraContent,
    style: tabBarStyle,
    getPopupContainer: popupContainer,
    popupClassName: classes.popup.root || undefined,
    indicator: {
      size: indicator?.size ?? config.tabs?.indicator?.size,
      align: indicator?.align ?? config.tabs?.indicator?.align
    },
    classNames: {
      ...classes,
      popup: classes.popup.root || undefined
    },
    styles: { ...slots, popup: slots.popup.root }
  });

  $effect.pre(() => {
    const panels = body;
    const key = selectedKey;
    const current = items;
    retainedFocus = undefined;
    if (!panels) return;

    const focused = panels.ownerDocument.activeElement;
    const popupOwner = focused instanceof Element
      ? focused.closest<HTMLElement>('[data-tabs-popup-owner]')?.dataset.tabsPopupOwner : undefined;
    const ownedRoot = popupOwner ? panels.ownerDocument.getElementById(popupOwner) : null;
    const panel = Array.from(panels.children).find(element =>
      element.contains(focused) || element.contains(ownedRoot));
    if (!(panel instanceof HTMLElement)) return;

    if (panel.dataset.tabsKey !== key) repairFocus = true;
    else if (focused instanceof HTMLElement) {
      const keys = Array.from(panels.children, element => (element as HTMLElement).dataset.tabsKey);
      if (current.length !== keys.length || current.some((item, index) => item.key !== keys[index]))
        retainedFocus = focused;
    }
  });

  $effect(() => {
    const key = getTabsActiveKey(items, selectedKey);
    const previous = retainedFocus;
    retainedFocus = undefined;
    if (!body) return;

    if (repairFocus) {
      repairFocus = false;
      untrack(() => focusTab(key));
    } else if (previous?.isConnected && previous.getClientRects().length
      && !previous.matches(':disabled')
      && body.ownerDocument.activeElement === body.ownerDocument.body)
      untrack(() => previous.focus({ preventScroll: true }));
  });

  onDestroy(() => { active = false; });

  function focusTab(key: string | undefined) {
    for (const navigation of navigations) {
      if (navigation.element?.isConnected) {
        navigation.focusTab(key);
        return;
      }
    }
  }

  function itemId(key: string, kind: 'tab' | 'panel') {
    return getTabsItemId(rootId, key, kind);
  }

  function activate(key: string, sourceEvent: MouseEvent | KeyboardEvent) {
    const event = getTabsClickEvent(sourceEvent, root);
    if (!event) return;
    if (event.defaultPrevented || !items.some((item) => item.key === key && !item.disabled)) return;

    onTabClick?.(key, event);
    if (!active
      || event.defaultPrevented
      || !items.some(
        (item) => item.key === key && !item.disabled
      )
      || key === selectedKey) return;

    activeKey = key;
    onChange?.(key);
  }
</script>

<style>
  .ant-tabs { min-width: 0; max-width: 100%; }
  .ant-tabs-empty { padding: var(--ant-padding-sm); color: var(--ant-color-text-description); }
</style>

{#snippet defaultMore()}<TabsMoreIcon />{/snippet}
{#snippet defaultAdd()}<TabsEditIcon name="plus" />{/snippet}
{#snippet defaultRemove()}<TabsEditIcon name="close" />{/snippet}
{#snippet defaultTabBar(props: TabsTabBarProps)}
  <TabsNav bar={props} context={navContext} />
{/snippet}

<div {...attributes} bind:this={nativeElement} id={rootId} dir={config.direction} class={[
    'ant-tabs ant-tabs-css-var',
    componentTheme.className,
    componentTheme.className && 'ant-tabs-source-theme',
    `ant-tabs-${placement}`,
    (type === 'card' || editable) && 'ant-tabs-card',
    editable && 'ant-tabs-editable ant-tabs-editable-card',
    centered && 'ant-tabs-centered',
    (resolvedSize === 'small' || resolvedSize === 'large') && `ant-tabs-${resolvedSize}`,
    config.direction === 'rtl' && 'ant-tabs-rtl',
    config.tabs?.class,
    className,
    rootClassName,
    classes.root
  ]} style={[componentTheme.style, slots.root].filter(Boolean).join(';') || undefined}>
  {#if renderTabBar}{@render renderTabBar(bar, defaultTabBar)}
  {:else}{@render defaultTabBar(bar)}{/if}
  <div class="ant-tabs-body-holder"><div bind:this={body} class={[
    'ant-tabs-body',
    `ant-tabs-body-${placement}`,
    animation.tabPane && 'ant-tabs-body-animated',
    classes.body
  ]} style={slots.body}>
    {#each items as item (item.key)}
      <TabsPanel id={itemId(item.key, 'panel')} labelledBy={itemId(item.key, 'tab')} itemKey={item.key} active={selectedKey === item.key} children={item.children} forceRender={item.forceRender}
        destroyOnHidden={item.destroyOnHidden ?? rootDestroy}
        class={[classes.content, item.className].filter(Boolean).join(' ') || undefined}
        style={[slots.content, item.style].filter(Boolean).join(';') || undefined}
        motion={animation.tabPaneMotion} motionEnabled={designTokens.token.motion} />
    {:else}<div class="ant-tabs-empty">{config.locale.emptyText}</div>{/each}
  </div></div>
</div>
