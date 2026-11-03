<script lang="ts">
  import { onDestroy, onMount, tick, untrack } from 'svelte';
  import TabsOverflow from './TabsOverflow.svelte';
  import { connectTabsNav, connectTabsScroll, revealTab } from './tabs.dom';
  import { getTabsIndicatorStyle, isTabsIndicatorStyleEqual } from './tabs-indicator.engine';
  import type { TabsIndicatorOffset, TabsIndicatorStyle } from './tabs-indicator.engine';
  import { connectTabsOverflow } from './tabs-overflow.dom';
  import {
    getTabsActiveKey,
    getTabsItemId,
    getTabsNavigationKey,
    isTabsItemRemovable
  } from './tabs.engine';
  import type { TabsContent, TabsItem } from './tabs.types';
  import type { TabsNavContext, TabsTabAttributes, TabsTabBarProps } from './tabs-nav.types';

  let { bar, context }: { bar: TabsTabBarProps; context: TabsNavContext; } = $props();
  let element = $state<HTMLDivElement>();
  let navRef = $derived(bar.ref);
  let viewport = $state<HTMLDivElement>();
  let list = $state<HTMLDivElement>();
  let activeOffset = $state<TabsIndicatorOffset>();
  let inkStyle = $state<TabsIndicatorStyle>();
  let operations = $state<HTMLDivElement>();
  let addButton = $state<HTMLButtonElement>();
  let hiddenKeys = $state<string[]>([]);
  let focusKey = $state<string | undefined>();
  let repairFocus = $state(false);
  let retainedFocus: HTMLElement | undefined;
  let active = true;
  let root = $derived(context.root);
  let items = $derived(context.items);
  let selectedKey = $derived(bar.activeKey);
  let tabStop = $derived(getTabsActiveKey(items, focusKey ?? selectedKey));
  let vertical = $derived(bar.tabPosition === 'left' || bar.tabPosition === 'right');
  let rtl = $derived(bar.rtl);
  let editable = $derived(Boolean(bar.editable));
  let nestedNavigation = $derived(editable || Boolean(bar.children));
  let showAdd = $derived(editable && bar.editable?.showAdd !== false);
  let animation = $derived(bar.animated);
  let locale = $derived(bar.locale);
  let classes = $derived(bar.classNames ?? {});
  let slots = $derived(bar.styles ?? {});
  let ariaLabel = $derived(context.ariaLabel);
  let ariaLabelledby = $derived(context.ariaLabelledby);
  let inkBarStyle = $derived(inkStyle && Object.entries(inkStyle)
    .map(([key, value]) => `${key}:${typeof value === 'number' ? `${value}px` : value}`)
    .join(';'));
  let gutterStyle = $derived(bar.tabBarGutter === undefined ? undefined
    : `${vertical ? 'margin-top' : 'margin-inline-start'}:${bar.tabBarGutter}px`);
  let extraLeft = $derived(
    bar.extra && typeof bar.extra === 'object' ? bar.extra.left : undefined
  );
  let extraRight = $derived(
    bar.extra && typeof bar.extra === 'object' ? bar.extra.right : bar.extra
  );

  onMount(() => context.register({
    get element() { return element; },
    focusTab
  }));

  $effect(() => {
    const ref = navRef;
    const node = element;
    if (!ref || !node) return;

    untrack(() => ref(node));
    return () => untrack(() => ref(null));
  });

  $effect.pre(() => {
    const nav = list;
    const key = selectedKey;
    const available = items.filter((item) => !item.disabled);
    const canAdd = showAdd;
    const layoutChanged = nav?.hasAttribute('data-tabs-nested') !== nestedNavigation;
    retainedFocus = undefined;
    if (!nav) return;

    const currentKeys = Array.from(
      nav.querySelectorAll<HTMLElement>('[role="tab"]'),
      (element) => element.dataset.tabsKey
    );
    const moving = currentKeys.length !== items.length
      || items.some(
        (item, index) => item.key !== currentKeys[index]
      );
    const focused = nav.ownerDocument.activeElement;
    if (!canAdd && focused instanceof HTMLElement && root?.contains(focused)
      && focused.matches('.ant-tabs-nav-add')) {
      focusKey = undefined;
      repairFocus = true;
    }
    if (nav.contains(focused)) {
      if (focused === nav)
        repairFocus = key !== undefined;
      else if (focused instanceof HTMLElement) {
        const focusedKey = focused.dataset.tabsKey
          ?? focused.closest<HTMLElement>('[data-tabs-cell]')?.dataset.tabsCell;
        const adding = focused.matches('.ant-tabs-nav-add');
        const removing = focused.matches('.ant-tabs-tab-remove');
        const candidates = focused.matches('[role="tab"]') || adding || removing
          ? available : items;
        const item = candidates.find(item => item.key === focusedKey);
        if (focusedKey === undefined && !adding && !removing) {
          if (moving) retainedFocus = focused;
        } else if (adding ? !canAdd : !item || layoutChanged
          || removing && !isTabsItemRemovable(item, editable)) {
          focusKey = adding ? undefined : item?.key;
          repairFocus = true;
        } else if (moving) {
          retainedFocus = focused;
        }
      }
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

    return untrack(() => connectTabsScroll(scroller, isVertical, info => bar.onTabScroll?.(info)));
  });

  $effect(() => {
    const view = root?.ownerDocument.defaultView;
    const next = getTabsIndicatorStyle(activeOffset, vertical, rtl, bar.indicator);
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
    const measureCells = nestedNavigation;

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
            measureCells,
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
    const isRTL = rtl;
    if (!scroller || !nav || !controls) return;

    return untrack(() => connectTabsOverflow(scroller, nav, controls, add, {
      vertical: isVertical,
      rtl: isRTL,
      onChange: next => hiddenKeys = next.filter(key => keys.includes(key))
    }));
  });

  function itemId(key: string, kind: 'tab' | 'panel') {
    return getTabsItemId(bar.id, key, kind);
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
    if (event.target instanceof Element && event.target !== list
      && !event.target.closest('[role="tab"]')) return;
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
      : rtl ? 'ArrowLeft' : 'ArrowRight';
    const backward = vertical ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft';
    const direction = event.key === 'Home'
      ? 'first'
      : event.key === 'End'
        ? 'last'
        : event.key === forward ? 'next' : event.key === backward ? 'previous' : null;
    if (!direction) return;

    event.preventDefault();
    focusTab(getTabsNavigationKey(items, tabStop, direction));
  }

  function handleFocusout(event: FocusEvent) {
    if (event.relatedTarget instanceof Node && !list?.contains(event.relatedTarget))
      focusKey = undefined;
    else if (event.relatedTarget instanceof Element
      && !event.relatedTarget.closest('[role="tab"]'))
      focusKey = undefined;
  }

  function handleTabFocus(key: string, element: HTMLElement) {
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
    bar.editable?.onEdit('remove', { key: item.key, event });
    if (!moveFocus) return;

    await tick();
    if (!active || !root) return;
    const focused = root.ownerDocument.activeElement;
    if (focused !== root.ownerDocument.body && !root.contains(focused)) return;

    focusTab(getTabsActiveKey(items, next));
  }

  function handleCellClick(item: TabsItem, event: MouseEvent) {
    if (event.target instanceof Element && event.target.closest('button')) return;
    bar.onTabClick(item.key, event);
  }

  function handleCellMouseDown(item: TabsItem, event: MouseEvent) {
    if (event.button === 1) void removeTab(item, event, true);
  }

  function tabAttributes(
    item: TabsItem,
    editing: boolean,
    first: boolean
  ): TabsTabAttributes & { type: 'button'; disabled?: boolean; } {
    return {
      type: 'button',
      role: 'tab',
      id: itemId(item.key, 'tab'),
      'data-tabs-key': item.key,
      'aria-controls': itemId(item.key, 'panel'),
      'aria-selected': selectedKey === item.key,
      disabled: item.disabled,
      tabindex: tabStop === item.key ? 0 : -1,
      style: editing ? undefined :
        [first ? undefined : gutterStyle, slots.item].filter(Boolean).join(';') || undefined,
      class: editing ? 'ant-tabs-tab-btn' : [
        'ant-tabs-tab',
        classes.item,
        selectedKey === item.key && 'ant-tabs-tab-active',
        item.disabled && 'ant-tabs-tab-disabled'
      ],
      onfocus: event => handleTabFocus(item.key, event.currentTarget),
      onclick: event => {
        if (bar.children) event.stopPropagation();
        bar.onTabClick(item.key, event);
      }
    };
  }

  function cellAttributes(item: TabsItem, first: boolean): TabsTabAttributes {
    return {
      role: 'presentation',
      'data-tabs-cell': item.key,
      style: [first ? undefined : gutterStyle, slots.item].filter(Boolean).join(';') || undefined,
      class: [
        'ant-tabs-tab',
        classes.item,
        selectedKey === item.key && 'ant-tabs-tab-active',
        item.disabled && 'ant-tabs-tab-disabled',
        focusKey === item.key && 'ant-tabs-tab-focus',
        isTabsItemRemovable(item, editable) && 'ant-tabs-tab-with-remove'
      ],
      onclick: event => handleCellClick(item, event),
      onmousedown: event => handleCellMouseDown(item, event)
    };
  }
</script>

<style>
  :global(.ant-tabs) .ant-tabs-nav { min-width: 0; }
  :global(.ant-tabs) .ant-tabs-nav .ant-tabs-nav-wrap { min-width: 0; overflow: auto; overscroll-behavior: contain; scrollbar-width: none; scroll-behavior: auto; }
  /* Operations не наследует inline gutter скрытого inner Add; исходный card gutter остаётся. */
  :global(.ant-tabs) .ant-tabs-nav :global(.ant-tabs-add-in-operations) { margin-block: 0 !important; margin-right: 0 !important; margin-left: var(--ant-tabs-card-gutter) !important; }
  :global(.ant-tabs) .ant-tabs-nav .ant-tabs-nav-list { flex: 0 0 auto; min-height: var(--ant-control-height); }
  /* Source tokens могут задавать шапку ниже native минимума, включая zero/undefined. */
  :global(.ant-tabs) .ant-tabs-nav[data-tabs-source-theme] .ant-tabs-nav-list { min-height: 0; }
  /* В исходном centered вертикальный список растягивается, заголовки остаются сверху. */
  :global(.ant-tabs) > .ant-tabs-nav[data-tabs-centered-vertical] .ant-tabs-nav-list { flex-grow: 1; }
  :global(.ant-tabs) > .ant-tabs-nav[data-tabs-root-placement="left"], :global(.ant-tabs) > .ant-tabs-nav[data-tabs-root-placement="right"] { max-width: 45%; }
  :global(.ant-tabs) > .ant-tabs-nav[data-tabs-root-placement="left"] .ant-tabs-nav-wrap, :global(.ant-tabs) > .ant-tabs-nav[data-tabs-root-placement="right"] .ant-tabs-nav-wrap { max-height: min(400px, 60dvh); }
  :global(.ant-tabs) > .ant-tabs-nav[data-tabs-root-placement="left"] .ant-tabs-tab, :global(.ant-tabs) > .ant-tabs-nav[data-tabs-root-placement="right"] .ant-tabs-tab { white-space: normal; overflow-wrap: anywhere; }
  :where(button.ant-tabs-tab) { appearance: none; margin: 0; font: inherit; text-align: inherit; flex: none; }
  button.ant-tabs-tab-btn { appearance: none; padding: 0; border: 0; background: transparent; font: inherit; color: inherit; text-align: inherit; cursor: inherit; }
  button.ant-tabs-tab-btn:disabled { cursor: not-allowed; }
  button.ant-tabs-tab-btn:focus-visible { outline: var(--ant-line-width-focus) solid var(--ant-color-primary-border); outline-offset: 1px; }
  :global(.ant-tabs) .ant-tabs-tab:focus-visible, .ant-tabs-nav-list:focus-visible { outline: var(--ant-line-width-focus) solid var(--ant-color-primary-border); outline-offset: -3px; }
  .ant-tabs-ink-bar[hidden] { display: none; }
  @media (prefers-reduced-motion: reduce) { :global(.ant-tabs) .ant-tabs-nav .ant-tabs-nav-list, :global(.ant-tabs) .ant-tabs-nav .ant-tabs-tab, :global(.ant-tabs) .ant-tabs-nav .ant-tabs-tab-btn, :global(.ant-tabs) .ant-tabs-nav .ant-tabs-ink-bar { animation: none; transition: none; } }
</style>

{#snippet value(node: TabsContent | undefined)}
  {#if typeof node === 'function'}{@render node()}{:else if node !== true && node !== false}{node ?? ''}{/if}
{/snippet}

{#snippet tabButton(
  item: TabsItem,
  editing: boolean,
  attributes: TabsTabAttributes,
  overrides: TabsTabAttributes = {}
)}
  <button {...attributes} {...overrides}>
    {#if editing}
      {#if item.icon}<span class="ant-tabs-tab-icon" aria-hidden="true">{@render item.icon()}</span>{/if}<span class="ant-tabs-tab-label">{@render value(item.label)}</span>
    {:else}
      <span class="ant-tabs-tab-btn">{#if item.icon}<span class="ant-tabs-tab-icon" aria-hidden="true">{@render item.icon()}</span>{/if}<span class="ant-tabs-tab-label">{@render value(item.label)}</span></span>
    {/if}
  </button>
{/snippet}

<div class={['ant-tabs-nav', bar.className, classes.header]} role="presentation" bind:this={element}
  data-tabs-source-theme={context.themeClassName ? '' : undefined}
  data-tabs-root-placement={context.rootPlacement}
  data-tabs-centered-vertical={context.centered && (context.rootPlacement === 'left' || context.rootPlacement === 'right') ? '' : undefined}
  style={[slots.header, bar.style].filter(Boolean).join(';') || undefined}>
  {#if extraLeft}<div class="ant-tabs-extra-content">{@render value(extraLeft)}</div>{/if}
  <div bind:this={viewport} class="ant-tabs-nav-wrap">
    <div bind:this={list} role="tablist" aria-label={ariaLabel} aria-labelledby={ariaLabelledby} aria-orientation={vertical ? 'vertical' : 'horizontal'} tabindex={tabStop === undefined ? 0 : undefined} class="ant-tabs-nav-list" data-tabs-editable={editable ? '' : undefined} data-tabs-nested={nestedNavigation ? '' : undefined} onkeydown={handleKeydown} onfocusout={handleFocusout}>
      {#each items as item, index (item.key)}
        {@const attributes = nestedNavigation ? cellAttributes(item, index === 0)
          : tabAttributes(item, false, index === 0)}
        {#snippet node(overrides: TabsTabAttributes = {})}
        {#if nestedNavigation}
          <div {...attributes} {...overrides}>
            {@render tabButton(item, true, tabAttributes(item, true, index === 0))}
            {#if isTabsItemRemovable(item, editable)}
              <button type="button" class={['ant-tabs-tab-remove', classes.remove]}
                style={slots.remove} data-tabs-key={item.key}
                aria-label={locale?.removeAriaLabel || 'remove'}
                tabindex={selectedKey === item.key ? 0 : -1}
                onclick={event => { void removeTab(item, event); }}>
                {@render value(item.closeIcon || bar.editable?.removeIcon || '×')}
              </button>
            {/if}
          </div>
        {:else}{@render tabButton(item, false, attributes, overrides)}{/if}
        {/snippet}
        {#if bar.children}{@render bar.children(node, item, attributes)}{:else}{@render node()}{/if}
      {/each}
      {#if showAdd}
        <button bind:this={addButton} type="button" class="ant-tabs-nav-add" aria-label={locale?.addAriaLabel || 'Add tab'}
          style={items.length ? gutterStyle : undefined}
          onclick={event => bar.editable?.onEdit('add', { event })}>
          {@render value(bar.editable?.addIcon)}
        </button>
      {/if}
      <div class={['ant-tabs-ink-bar', animation.inkBar && 'ant-tabs-ink-bar-animated', classes.indicator]} aria-hidden="true"
        style={[inkBarStyle, slots.indicator].filter(Boolean).join(';') || undefined}
        hidden={!activeOffset || context.card}></div>
    </div>
  </div>
  <TabsOverflow bind:nativeElement={operations} rootId={bar.id} ownerId={context.ownerId}
    {editable} {locale} more={bar.more} mobile={bar.mobile} rtl={bar.rtl}
      defaultMoreIcon={context.defaultMoreIcon}
    removeIcon={bar.editable?.removeIcon ?? '×'}
    removeClassName={classes.remove} removeStyle={slots.remove} popupStyle={slots.popup}
    themeClassName={context.themeClassName} themeStyle={context.themeStyle}
    popupClassName={bar.popupClassName} getPopupContainer={bar.getPopupContainer}
    tabBarGutter={bar.tabBarGutter}
    items={items.filter(item => hiddenKeys.includes(item.key))}
    panelId={key => itemId(key, 'panel')} onSelect={(key, event) => bar.onTabClick(key, event)}
    onRemove={(item, event) => { void removeTab(item, event); }}
    onUnavailable={() => focusTab(tabStop)} />
  {#if extraRight}<div class="ant-tabs-extra-content">{@render value(extraRight)}</div>{/if}
</div>
