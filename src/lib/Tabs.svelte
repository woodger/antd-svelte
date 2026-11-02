<script lang="ts">
  import { onDestroy, tick, untrack } from 'svelte';
  import TabsPanel from './TabsPanel.svelte';
  import TabsEditIcon from './TabsEditIcon.svelte';
  import TabsOverflow from './TabsOverflow.svelte';
  import { useConfig } from './config-context';
  import { connectTabsNav, connectTabsScroll, revealTab } from './tabs.dom';
  import { getTabsIndicatorStyle, isTabsIndicatorStyleEqual } from './tabs-indicator.engine';
  import type { TabsIndicatorOffset, TabsIndicatorStyle } from './tabs-indicator.engine';
  import { connectTabsOverflow } from './tabs-overflow.dom';
  import {
    getTabsActiveKey,
    getTabsNavigationKey,
    getTabsPlacement,
    isTabsItemRemovable,
    normalizeTabsItems
  } from './tabs.engine';
  import type { TabsContent, TabsItem, TabsProps } from './tabs.types';

  let {
    items: sourceItems,
    activeKey = $bindable<string | undefined>(),
    defaultActiveKey,
    onChange,
    onTabClick,
    onTabScroll,
    indicator,
    indicatorSize,
    type = 'line',
    onEdit,
    hideAdd = false,
    addIcon,
    removeIcon,
    locale,
    more,
    moreIcon,
    popupClassName,
    getPopupContainer,
    tabPlacement,
    tabPosition,
    centered = false,
    tabBarGutter,
    tabBarStyle,
    size,
    destroyOnHidden = false,
    tabBarExtraContent,
    id,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    class: className = '',
    style
  }: TabsProps = $props();

  const config = useConfig();
  const generatedId = $props.id();
  const initialDefault = untrack(() => defaultActiveKey);
  let root = $state<HTMLDivElement>();
  let viewport = $state<HTMLDivElement>();
  let list = $state<HTMLDivElement>();
  let body = $state<HTMLDivElement>();
  let activeOffset = $state<TabsIndicatorOffset>();
  let inkStyle = $state<TabsIndicatorStyle>();
  let operations = $state<HTMLDivElement>();
  let addButton = $state<HTMLButtonElement>();
  let hiddenKeys = $state<string[]>([]);
  let resolvedMore = $derived(more ? { ...more } : undefined);
  let focusKey = $state<string | undefined>();
  let mobile = $state(false);
  let repairFocus = $state(false);
  let retainedFocus: HTMLElement | undefined;
  let active = true;
  let rootId = $derived(id ?? `ant-tabs-${generatedId}`);
  let items = $derived(normalizeTabsItems(sourceItems));
  let selectedKey = $derived(getTabsActiveKey(items, activeKey ?? initialDefault));
  let tabStop = $derived(getTabsActiveKey(items, focusKey ?? selectedKey));
  let resolvedSize = $derived(size ?? config.componentSize);
  let inkBarStyle = $derived(inkStyle && Object.entries(inkStyle)
    .map(([key, value]) => `${key}:${typeof value === 'number' ? `${value}px` : value}`)
    .join(';'));
  let placement = $derived(getTabsPlacement(
    tabPlacement ?? tabPosition ?? 'top',
    config.direction,
    mobile
  ));
  let vertical = $derived(placement === 'left' || placement === 'right');
  let editable = $derived(type === 'editable-card');
  let showAdd = $derived(editable && hideAdd !== true);
  let gutterStyle = $derived(tabBarGutter === undefined ? undefined
    : `${vertical ? 'margin-top' : 'margin-inline-start'}:${tabBarGutter}px`);
  let extraLeft = $derived(
    tabBarExtraContent && typeof tabBarExtraContent === 'object'
      ? tabBarExtraContent.left
      : undefined
  );
  let extraRight = $derived(
    tabBarExtraContent && typeof tabBarExtraContent === 'object'
      ? tabBarExtraContent.right
      : tabBarExtraContent
  );

  $effect(() => {
    const media = window.matchMedia('(max-width: 575px)');
    const update = () => {
      mobile = media.matches;
    };

    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  });

  $effect.pre(() => {
    const nav = list;
    const panels = body;
    const key = selectedKey;
    const available = items.filter((item) => !item.disabled);
    const canAdd = showAdd;
    const layoutChanged = nav?.hasAttribute('data-tabs-editable') !== editable;
    retainedFocus = undefined;
    if (!nav || !panels) return;

    const currentKeys = Array.from(
      nav.querySelectorAll<HTMLElement>('[role="tab"]'),
      (element) => element.dataset.tabsKey
    );
    const moving = currentKeys.length !== items.length
      || items.some(
        (item, index) => item.key !== currentKeys[index]
      );
    const focused = nav.ownerDocument.activeElement;
    const popupOwner = focused instanceof Element
      ? focused.closest<HTMLElement>('[data-tabs-popup-owner]')?.dataset.tabsPopupOwner : undefined;
    const ownedRoot = popupOwner ? nav.ownerDocument.getElementById(popupOwner) : null;
    if (!canAdd && focused instanceof HTMLElement && root?.contains(focused)
      && focused.matches('.ant-tabs-nav-add')) {
      focusKey = undefined;
      repairFocus = true;
    }
    if (nav.contains(focused)) {
      if (focused === nav)
        repairFocus = key !== undefined;
      else if (focused instanceof HTMLElement) {
        const item = available.find(item => item.key === focused.dataset.tabsKey);
        const adding = focused.matches('.ant-tabs-nav-add');
        const removing = focused.matches('.ant-tabs-tab-remove');
        if (adding ? !canAdd : !item || layoutChanged
          || removing && !isTabsItemRemovable(item, editable)) {
          focusKey = adding ? undefined : item?.key;
          repairFocus = true;
        } else if (moving) {
          retainedFocus = focused;
        }
      }
    } else if (panels.contains(focused) || panels.contains(ownedRoot)) {
      const panel = Array.from(panels.children).find(element =>
        element.contains(focused) || element.contains(ownedRoot));
      if (panel instanceof HTMLElement && panel.dataset.tabsKey !== key)
        repairFocus = true;
      else if (moving && focused instanceof HTMLElement)
        retainedFocus = focused;
    }
  });

  $effect(() => {
    const nav = list;
    const key = getTabsActiveKey(items, focusKey ?? selectedKey);
    const previous = retainedFocus;
    retainedFocus = undefined;
    if (!nav) return;

    if (repairFocus) {
      repairFocus = false;
      untrack(() => focusTab(key));
    }
    // Перемещение keyed DOM сохраняет экземпляр панели, но браузер сбрасывает её фокус.
    else if (previous?.isConnected
      && previous.getClientRects().length
      && !previous.matches(
        ':disabled'
      )
      && nav.ownerDocument.activeElement === nav.ownerDocument.body)
      untrack(() => previous.focus({ preventScroll: true }));
  });

  $effect(() => {
    const scroller = viewport;
    const isVertical = vertical;
    if (!scroller) return;

    return untrack(() => connectTabsScroll(scroller, isVertical, info => onTabScroll?.(info)));
  });

  $effect(() => {
    const view = root?.ownerDocument.defaultView;
    const next = getTabsIndicatorStyle(activeOffset, vertical, config.direction === 'rtl', {
      size: indicator?.size ?? indicatorSize,
      align: indicator?.align
    });
    if (!view) return;

    const frame = view.requestAnimationFrame(() => {
      if (!isTabsIndicatorStyleEqual(inkStyle, next)) inkStyle = next;
    });
    return () => view.cancelAnimationFrame(frame);
  });

  $effect(() => {
    const container = root;
    const scroller = viewport;
    const nav = list;
    const selected = items.find((item) => item.key === selectedKey);
    const isVertical = vertical;
    const isEditable = editable;

    if (container
      && scroller
      && nav) return untrack(
        () => connectTabsNav(
          container,
          scroller,
          nav,
          {
            key: selected?.key,
            vertical: isVertical,
            editable: isEditable,
            onIndicatorChange: next => activeOffset = next
          }
        )
      );
  });

  onDestroy(() => {
    active = false;
  });

  $effect(() => {
    const scroller = viewport;
    const nav = list;
    const controls = operations;
    const add = addButton;
    const keys = items.map(item => item.key);
    const isVertical = vertical;
    if (!scroller || !nav || !controls) return;

    return untrack(() => connectTabsOverflow(scroller, nav, controls, add, {
      vertical: isVertical,
      onChange: next => hiddenKeys = next.filter(key => keys.includes(key))
    }));
  });

  function itemId(key: string, kind: 'tab' | 'panel') {
    const encoded = Array.from(key, (character) => character.codePointAt(0)!.toString(16)).join(
      '-'
    );
    return `${rootId}-${kind}-${encoded || 'empty'}`;
  }

  function focusTab(key: string | undefined) {
    if (!list) return;

    const tab = Array.from(list.querySelectorAll<HTMLButtonElement>('[role="tab"]')).find(
      (element) => element.dataset.tabsKey === key && !element.disabled
    );
    focusKey = tab?.dataset.tabsKey;
    (tab ?? list).focus({ preventScroll: true });
    if (tab && viewport)
      revealTab(viewport, tab, vertical);
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.defaultPrevented || event.isComposing) return;
    if (event.target instanceof Element
      && event.target.closest('.ant-tabs-tab-remove, .ant-tabs-nav-add')) return;

    if (editable && (event.key === 'Delete' || event.key === 'Backspace')) {
      const item = items.find(item => item.key === focusKey);
      if (item) void removeTab(item, event, true);
      return;
    }

    if (event.ctrlKey
      || event.metaKey
      || event.altKey) return;

    const forward = vertical
      ? 'ArrowDown'
      : config.direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
    const backward = vertical ? 'ArrowUp' : config.direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
    const direction = event.key === 'Home'
      ? 'first'
      : event.key === 'End'
        ? 'last'
        : event.key === forward ? 'next' : event.key === backward ? 'previous' : null;
    if (!direction) return;

    event.preventDefault();
    focusTab(getTabsNavigationKey(items, tabStop, direction));
  }

  function activate(key: string, event: MouseEvent) {
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

  function handleFocusout(event: FocusEvent) {
    if (event.relatedTarget instanceof Node && !list?.contains(event.relatedTarget))
      focusKey = undefined;
    else if (event.relatedTarget instanceof Element
      && event.relatedTarget.closest('.ant-tabs-nav-add, .ant-tabs-tab-remove'))
      focusKey = undefined;
  }

  function handleTabFocus(key: string, element: HTMLButtonElement) {
    focusKey = key;
    if (viewport)
      revealTab(viewport, element.closest<HTMLElement>('[data-tabs-cell]') ?? element, vertical);
  }

  async function removeTab(
    item: TabsItem,
    event: MouseEvent | KeyboardEvent,
    moveFocus = false
  ) {
    if (!isTabsItemRemovable(item, editable)) return;

    event.preventDefault();
    event.stopPropagation();
    const enabled = items.filter(item => !item.disabled);
    const last = enabled.at(-1)?.key === item.key;
    const next = getTabsNavigationKey(items, tabStop, last ? 'previous' : 'next');
    onEdit?.(item.key, 'remove');
    if (!moveFocus) return;

    await tick();
    if (!active || !root) return;
    const focused = root.ownerDocument.activeElement;
    if (focused !== root.ownerDocument.body && !root.contains(focused)) return;

    focusTab(getTabsActiveKey(items, next));
  }

  function handleCellClick(item: TabsItem, event: MouseEvent) {
    if (event.target instanceof Element && event.target.closest('button')) return;
    activate(item.key, event);
  }

  function handleCellMouseDown(item: TabsItem, event: MouseEvent) {
    if (event.button === 1) void removeTab(item, event, true);
  }
</script>

<style>
  .ant-tabs { min-width: 0; max-width: 100%; }
  .ant-tabs > .ant-tabs-nav { min-width: 0; }
  .ant-tabs > .ant-tabs-nav .ant-tabs-nav-wrap { min-width: 0; overflow: auto; overscroll-behavior: contain; scrollbar-width: none; scroll-behavior: auto; }
  /* Operations не наследует inline gutter скрытого inner Add; исходный card gutter остаётся. */
  .ant-tabs > .ant-tabs-nav :global(.ant-tabs-add-in-operations) { margin-block: 0 !important; margin-right: 0 !important; margin-left: var(--ant-tabs-card-gutter) !important; }
  .ant-tabs > .ant-tabs-nav .ant-tabs-nav-list { flex: 0 0 auto; min-height: var(--ant-control-height); }
  /* В исходном centered вертикальный список растягивается, заголовки остаются сверху. */
  .ant-tabs-centered:is(.ant-tabs-left, .ant-tabs-right) > .ant-tabs-nav .ant-tabs-nav-list { flex-grow: 1; }
  .ant-tabs-left > .ant-tabs-nav, .ant-tabs-right > .ant-tabs-nav { max-width: 45%; }
  .ant-tabs-left > .ant-tabs-nav .ant-tabs-nav-wrap, .ant-tabs-right > .ant-tabs-nav .ant-tabs-nav-wrap { max-height: min(400px, 60dvh); }
  .ant-tabs-left > .ant-tabs-nav .ant-tabs-tab, .ant-tabs-right > .ant-tabs-nav .ant-tabs-tab { white-space: normal; overflow-wrap: anywhere; }
  :where(button.ant-tabs-tab) { appearance: none; margin: 0; font: inherit; text-align: inherit; flex: none; }
  button.ant-tabs-tab-btn { appearance: none; padding: 0; border: 0; background: transparent; font: inherit; color: inherit; text-align: inherit; cursor: inherit; }
  button.ant-tabs-tab-btn:disabled { cursor: not-allowed; }
  button.ant-tabs-tab-btn:focus-visible { outline: var(--ant-line-width-focus) solid var(--ant-color-primary-border); outline-offset: 1px; }
  .ant-tabs .ant-tabs-tab:focus-visible, .ant-tabs-nav-list:focus-visible { outline: var(--ant-line-width-focus) solid var(--ant-color-primary-border); outline-offset: -3px; }
  .ant-tabs-empty { padding: var(--ant-padding-sm); color: var(--ant-color-text-description); }
  .ant-tabs-ink-bar[hidden] { display: none; }
  @media (prefers-reduced-motion: reduce) { .ant-tabs > .ant-tabs-nav .ant-tabs-nav-list, .ant-tabs > .ant-tabs-nav .ant-tabs-tab, .ant-tabs > .ant-tabs-nav .ant-tabs-tab-btn, .ant-tabs > .ant-tabs-nav .ant-tabs-ink-bar { animation: none; transition: none; } }
</style>

{#snippet value(node: TabsContent | undefined)}
  {#if typeof node === 'function'}{@render node()}{:else if node !== true && node !== false}{node ?? ''}{/if}
{/snippet}

{#snippet defaultRemove()}<TabsEditIcon name="close" />{/snippet}
{#snippet tabButton(item: TabsItem, editing: boolean, first: boolean)}
  <button type="button" role="tab" id={itemId(item.key, 'tab')} data-tabs-key={item.key}
    aria-controls={itemId(item.key, 'panel')} aria-selected={selectedKey === item.key}
    disabled={item.disabled} tabindex={tabStop === item.key ? 0 : -1}
    style={editing || first ? undefined : gutterStyle}
    class={editing ? 'ant-tabs-tab-btn' : [
      'ant-tabs-tab',
      selectedKey === item.key && 'ant-tabs-tab-active',
      item.disabled && 'ant-tabs-tab-disabled'
    ]}
    onfocus={event => handleTabFocus(item.key, event.currentTarget)}
    onclick={event => activate(item.key, event)}>
    {#if editing}
      {#if item.icon}<span class="ant-tabs-tab-icon" aria-hidden="true">{@render item.icon()}</span>{/if}<span class="ant-tabs-tab-label">{@render value(item.label)}</span>
    {:else}
      <span class="ant-tabs-tab-btn">{#if item.icon}<span class="ant-tabs-tab-icon" aria-hidden="true">{@render item.icon()}</span>{/if}<span class="ant-tabs-tab-label">{@render value(item.label)}</span></span>
    {/if}
  </button>
{/snippet}

<div bind:this={root} id={rootId} dir={config.direction} class={[
    'ant-tabs ant-tabs-css-var',
    `ant-tabs-${placement}`,
    (type === 'card' || editable) && 'ant-tabs-card',
    editable && 'ant-tabs-editable ant-tabs-editable-card',
    centered && 'ant-tabs-centered',
    (resolvedSize === 'small' || resolvedSize === 'large') && `ant-tabs-${resolvedSize}`,
    config.direction === 'rtl' && 'ant-tabs-rtl',
    className
  ]} {style}>
  <div class="ant-tabs-nav" role="presentation" style={tabBarStyle}>
    {#if extraLeft}<div class="ant-tabs-extra-content">{@render value(extraLeft)}</div>{/if}
    <div bind:this={viewport} class="ant-tabs-nav-wrap">
      <div bind:this={list} role="tablist" aria-label={ariaLabel} aria-labelledby={ariaLabelledby} aria-orientation={vertical ? 'vertical' : 'horizontal'} tabindex={tabStop === undefined ? 0 : undefined} class="ant-tabs-nav-list" data-tabs-editable={editable ? '' : undefined} onkeydown={handleKeydown} onfocusout={handleFocusout}>
        {#each items as item, index (item.key)}
          {#if editable}
            <div role="presentation" data-tabs-cell={item.key} style={index ? gutterStyle : undefined} class={[
              'ant-tabs-tab',
              selectedKey === item.key && 'ant-tabs-tab-active',
              item.disabled && 'ant-tabs-tab-disabled',
              focusKey === item.key && 'ant-tabs-tab-focus',
              isTabsItemRemovable(item, editable) && 'ant-tabs-tab-with-remove'
            ]} onclick={event => handleCellClick(item, event)}
              onmousedown={event => handleCellMouseDown(item, event)}>
              {@render tabButton(item, true, index === 0)}
              {#if isTabsItemRemovable(item, editable)}
                <button type="button" class="ant-tabs-tab-remove" data-tabs-key={item.key}
                  aria-label={locale?.removeAriaLabel || 'remove'}
                  tabindex={selectedKey === item.key ? 0 : -1}
                  onclick={event => { void removeTab(item, event); }}>
                  {@render value(item.closeIcon || (removeIcon ?? defaultRemove) || '×')}
                </button>
              {/if}
            </div>
          {:else}{@render tabButton(item, false, index === 0)}{/if}
        {/each}
        {#if showAdd}
          <button bind:this={addButton} type="button" class="ant-tabs-nav-add" aria-label={locale?.addAriaLabel || 'Add tab'}
            style={items.length ? gutterStyle : undefined}
            onclick={event => onEdit?.(event, 'add')}>
            {#if addIcon}{@render value(addIcon)}{:else}<TabsEditIcon name="plus" />{/if}
          </button>
        {/if}
        <div class="ant-tabs-ink-bar ant-tabs-ink-bar-animated" aria-hidden="true"
          style={inkBarStyle} hidden={!activeOffset || type !== 'line'}></div>
      </div>
    </div>
    <TabsOverflow bind:nativeElement={operations} {rootId} {editable} {locale} more={resolvedMore} {moreIcon}
      {removeIcon} {popupClassName} {getPopupContainer} {tabBarGutter}
      items={items.filter(item => hiddenKeys.includes(item.key))}
      panelId={key => itemId(key, 'panel')} onSelect={activate}
      onRemove={(item, event) => { void removeTab(item, event); }}
      onUnavailable={() => focusTab(tabStop)} />
    {#if extraRight}<div class="ant-tabs-extra-content">{@render value(extraRight)}</div>{/if}
  </div>
  <div class="ant-tabs-body-holder"><div bind:this={body} class="ant-tabs-body">
    {#each items as item (item.key)}
      <TabsPanel id={itemId(item.key, 'panel')} labelledBy={itemId(item.key, 'tab')} itemKey={item.key} active={selectedKey === item.key} children={item.children} forceRender={item.forceRender} destroyOnHidden={item.destroyOnHidden ?? destroyOnHidden} />
    {:else}<div class="ant-tabs-empty">{config.locale.emptyText}</div>{/each}
  </div></div>
</div>
