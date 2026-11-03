<script lang="ts">
  import { flushSync, onDestroy, untrack } from 'svelte';
  import { useConfig } from './config-context';
  import { connectPopup } from './popup.dom';
  import { connectPopupPortal } from './popup-portal.dom';
  import { getTooltipDelay, getTooltipPosition } from './tooltip.engine';
  import { getTabsMoreActions } from './tabs-more.engine';
  import { getTabsMoreSize } from './tabs-more.dom';
  import { getTabsClickEvent } from './tabs.dom';
  import { createTabsPaneMotion, type TabsPaneMotionState } from './tabs-motion.dom';
  import { useToken } from './theme-context.svelte';
  import { getTabsMoreNavigationKey, isTabsMobileDevice } from './tabs-overflow.engine';
  import { getTabsNavigationKey, isTabsItemRemovable } from './tabs.engine';
  import TabsEditIcon from './TabsEditIcon.svelte';
  import type {
    TabsContent,
    TabsItem,
    TabsLocale,
    TabsMoreProps,
    TabsMoreTrigger
  } from './tabs.types';

  let {
    nativeElement = $bindable<HTMLDivElement | undefined>(),
    rootId,
    ownerId,
    mobile: mobileOverride,
    rtl,
    items,
    editable,
    locale,
    more,
    defaultMoreIcon,
    removeIcon,
    removeClassName,
    removeStyle,
    popupClassName,
    popupStyle,
    getPopupContainer,
    tabBarGutter,
    themeClassName,
    themeStyle,
    panelId,
    onSelect,
    onRemove,
    onUnavailable
  }: {
    nativeElement?: HTMLDivElement;
    rootId: string;
    ownerId?: string;
    mobile?: boolean;
    rtl?: boolean;
    items: readonly TabsItem[];
    editable: boolean;
    locale?: TabsLocale;
    more?: TabsMoreProps;
    defaultMoreIcon?: TabsContent;
    removeIcon?: TabsContent;
    removeClassName?: string;
    removeStyle?: string;
    popupClassName?: string;
    popupStyle?: string;
    getPopupContainer?: (trigger: HTMLElement) => HTMLElement;
    tabBarGutter?: number;
    themeClassName?: string;
    themeStyle?: string;
    panelId: (key: string) => string;
    onSelect: (key: string, event: MouseEvent) => void;
    onRemove: (item: TabsItem, event: MouseEvent) => void;
    onUnavailable: () => void;
  } = $props();

  const config = useConfig();
  const tokens = useToken();
  let button = $state<HTMLButtonElement>();
  let popup = $state<HTMLDivElement>();
  let list = $state<HTMLUListElement>();
  let open = $state(false);
  let triggerOpen = $state(false);
  let shown = $state(false);
  let rendered = $state(false);
  let runtime = $state<ReturnType<typeof createTabsPaneMotion>>();
  let motionState = $state<TabsPaneMotionState>({ running: false });
  let motionStarted = $state(false);
  let mobileDevice = $state(false);
  let mobile = $derived(mobileOverride ?? mobileDevice);
  let selectedKey = $state<string | null>(null);
  let menuKey = $state<string | undefined>();
  let repairFocus = $state(false);
  let actualSide = $state<'top' | 'bottom'>('bottom');
  let focusAttempted = false;
  let keyboardClick = false;
  let pending: ReturnType<typeof setTimeout> | undefined;
  let focusFrame = 0;
  let focusView: Window | undefined;
  let active = true;
  let touched = false;
  let detachPortal: (() => void) | undefined;
  let motionProperties: string[] = [];
  let popupId = $derived(`${rootId}-more-popup`);
  let available = $derived(items.length > 0 && !mobile);
  let dropdownVisible = $derived(more && Object.hasOwn(more, 'visible')
    ? more.visible : Boolean(items.length && open));
  let visible = $derived(!mobile && (dropdownVisible ?? triggerOpen));
  let actions = $derived(getTabsMoreActions(more ?? {}));
  let autoDestroy = $derived(more?.autoDestroy === true);
  let motionName = $derived(more?.animation ? `ant-tabs-dropdown-${more.animation}`
    : more?.transitionName);
  let present = $derived(visible || motionState.running);
  let motionConfig = $derived({
    motionName,
    onAppearPrepare: () => {},
    onEnterPrepare: () => {},
    onVisibleChanged: (next: boolean) => {
      if (!next && !visible && autoDestroy) destroyPopup();
    }
  });
  let icon = $derived(more?.icon === undefined ? 'More' : more.icon);
  let placement = $derived(more?.placement ?? 'bottomLeft');
  let side = $derived(placement.startsWith('top') ? 'top' as const : 'bottom' as const);
  let align = $derived(placement.endsWith('Left') ? 'left' as const
    : placement.endsWith('Right') ? 'right' as const : undefined);
  let containerGetter = $derived(more && Object.hasOwn(more, 'getPopupContainer')
    ? more.getPopupContainer : getPopupContainer);
  let overlayStyle = $derived(more && Object.hasOwn(more, 'overlayStyle')
    ? more.overlayStyle : popupStyle);
  let ownOverlayClass = $derived(Boolean(more && Object.hasOwn(more, 'overlayClassName')));
  let popupDirection = $derived(ownOverlayClass || rtl === undefined
    ? config.direction : rtl ? 'rtl' : 'ltr');
  const initialStyle = untrack(() => [themeStyle, overlayStyle].filter(Boolean).join(';') || undefined);
  let initialStyleElement: HTMLDivElement | undefined;
  let matchWidth = $derived(more?.minOverlayWidthMatchTrigger !== false);
  let selectedId = $derived(selectedKey !== null && items.some(item => item.key === selectedKey)
    ? optionId(selectedKey) : undefined);

  $effect(() => {
    mobileDevice = isTabsMobileDevice(window.navigator.userAgent);
  });

  $effect(() => {
    if (visible) rendered = true;
  });

  $effect.pre(() => {
    // Trigger useControlledState сбрасывает внутреннее значение при смене controlled prop.
    triggerOpen = dropdownVisible ?? false;
  });

  $effect(() => {
    const surface = popup;
    if (!surface) return;

    const controller = createTabsPaneMotion(surface, (next, commit) => {
      if (commit) flushSync(() => { motionState = next; });
      else motionState = next;
    });
    runtime = controller;
    return () => {
      controller.destroy();
      runtime = undefined;
      motionState = { running: false };
      motionStarted = false;
    };
  });

  $effect.pre(() => {
    const controller = runtime;
    const next = visible;
    const options = motionConfig;
    const ready = shown;
    const enabled = tokens.token.motion && ready;
    if (controller && (motionStarted || ready)) {
      motionStarted = true;
      untrack(() => controller.sync(next, options, enabled));
    } else if (!next && autoDestroy) rendered = false;
  });

  $effect(() => {
    if (autoDestroy && rendered && !visible && motionStarted && !motionState.running)
      untrack(destroyPopup);
  });

  $effect.pre(() => {
    const focused = button?.ownerDocument.activeElement;
    const canShow = available;
    const current = items;
    if (!canShow) {
      cancelPending();
      if (!visible && focused && (focused === button || popup?.contains(focused)))
        untrack(onUnavailable);
    } else if (focused instanceof HTMLElement && popup?.contains(focused)
      && focused.dataset.tabsOverflowKey !== undefined
      && !current.some(item => item.key === focused.dataset.tabsOverflowKey && !item.disabled)) {
      repairFocus = true;
    }
    if (!open) {
      selectedKey = null;
      focusAttempted = false;
    }
  });

  $effect(() => {
    const element = button;
    if (repairFocus && element) {
      repairFocus = false;
      if (element.ownerDocument.activeElement === element.ownerDocument.body)
        element.focus({ preventScroll: true });
    }
  });

  $effect(() => {
    const surface = popup;
    const source = button;
    const origin = nativeElement;
    const container = containerGetter;
    const cssText = overlayStyle;
    const inherited = themeStyle;
    if (!surface || !source || !origin || !rendered) return;

    return untrack(() => {
      // До первого открытия markup уже содержит начальные styles; props могли успеть измениться.
      if (initialStyleElement !== surface) {
        const initial = surface.ownerDocument.createElement('span').style;
        initial.cssText = initialStyle ?? '';
        for (const name of initial) surface.style.removeProperty(name);
        initialStyleElement = surface;
      }
      const css = surface.ownerDocument.createElement('span').style;
      css.cssText = cssText ?? '';
      const names = Array.from(css);
      const inheritedCSS = surface.ownerDocument.createElement('span').style;
      inheritedCSS.cssText = inherited ?? '';
      const inheritedNames = Array.from(inheritedCSS);
      for (const name of inheritedNames)
        surface.style.setProperty(name, inheritedCSS.getPropertyValue(name));
      const marker = surface.ownerDocument.createComment('tabs-popup');
      surface.before(marker);
      const disconnect = connectPopupPortal(surface, {
        getPopupContainer: container ? () => container(source) : undefined,
        reference: source,
        origin,
        marker,
        autoLock: false,
        restoreOnDestroy: true,
        preserveVariables: names.filter(name => name.startsWith('--'))
      });
      for (const name of names)
        surface.style.setProperty(name, css.getPropertyValue(name), css.getPropertyPriority(name));

      let connected = true;
      const cleanup = () => {
        if (!connected) return;
        connected = false;
        for (const name of names) surface.style.removeProperty(name);
        for (const name of inheritedNames) surface.style.removeProperty(name);
        disconnect();
        marker.remove();
      };
      detachPortal = cleanup;
      return () => {
        cleanup();
        if (detachPortal === cleanup) detachPortal = undefined;
      };
    });
  });

  $effect(() => {
    const surface = popup;
    const cssText = motionState.style;
    const authorStyle = overlayStyle;
    if (!surface) return;

    const css = surface.ownerDocument.createElement('span').style;
    const author = surface.ownerDocument.createElement('span').style;
    css.cssText = cssText ?? '';
    author.cssText = authorStyle ?? '';
    for (const name of new Set([...motionProperties, ...css])) {
      const source = css.getPropertyValue(name) ? css : author;
      surface.style.setProperty(name, source.getPropertyValue(name), source.getPropertyPriority(name));
    }
    motionProperties = Array.from(css);
  });

  $effect(() => {
    const surface = popup;
    const source = button;
    const show = present;
    const requestedSide = side;
    const requestedAlign = align;
    const match = matchWidth;
    if (!surface || !source || !show) return;

    return untrack(() => {
      if (!match) {
        const style = surface.ownerDocument.createElement('span').style;
        style.cssText = overlayStyle ?? '';
        surface.style.minWidth = style.minWidth;
      }
      return connectPopup(surface, source, {
        placement: requestedSide,
        align: requestedAlign,
        autoAdjustOverflow: true,
        gap: 4,
        maxWidth: '100vw',
        matchAnchorWidth: match,
        preserveFocus: false,
        getPosition: (anchor, _bounds, viewport) => getTooltipPosition(
          anchor,
          getTabsMoreSize(surface),
          viewport,
          requestedSide,
          true,
          requestedAlign,
          4
        ),
        onPlacement: value => actualSide = value === 'top' ? 'top' : 'bottom',
        onDismiss: reason => {
          if (!visible) return;
          if (reason === 'escape') source.focus({ preventScroll: true });
          if (reason === 'escape' || actions.hide.has('click')
            || actions.hide.has('contextMenu') || actions.hide.has('touch')) requestVisible(false);
        },
        onKeydown: event => {
          if (!visible || event.key !== 'Tab' || dropdownVisible === undefined) return;
          const overlay = more && Object.hasOwn(more, 'overlay')
            ? popup?.firstElementChild : list;
          if (!focusAttempted && overlay instanceof HTMLElement) {
            overlay.focus({ preventScroll: true });
            focusAttempted = true;
            event.preventDefault();
          } else {
            source.focus({ preventScroll: true });
            requestVisible(false);
          }
        },
        onVisibilityChange: next => {
          shown = next;
          if (!next) cancelFocus();
          else if (more?.autoFocus && dropdownVisible !== undefined) scheduleFocus();
        }
      });
    });
  });

  $effect(() => {
    const key = selectedKey;
    const id = selectedId;
    if (key !== null && id && list) {
      const item = list.ownerDocument.getElementById(id);
      if (item) untrack(() => item.scrollIntoView(false));
    }
  });

  onDestroy(() => {
    active = false;
    cancelPending();
    cancelFocus();
    detachPortal?.();
  });

  function destroyPopup() {
    // Svelte удаляет conditional range после возврата portal в исходное место.
    detachPortal?.();
    rendered = false;
  }

  function cancelPending() {
    if (pending !== undefined) clearTimeout(pending);
    pending = undefined;
  }

  function cancelFocus() {
    if (focusFrame) focusView?.cancelAnimationFrame(focusFrame);
    focusFrame = 0;
    focusView = undefined;
  }

  function scheduleFocus() {
    cancelFocus();
    let frames = 3;
    const view = button!.ownerDocument.defaultView!;
    focusView = view;
    function focus() {
      if (!active || !visible) {
        focusFrame = 0;
        return;
      }
      if (--frames) focusFrame = view.requestAnimationFrame(focus);
      else if (active && visible) {
        focusFrame = 0;
        const overlay = more && Object.hasOwn(more, 'overlay')
          ? popup?.firstElementChild : list;
        if (overlay instanceof HTMLElement) {
          overlay.focus({ preventScroll: true });
          focusAttempted = true;
        }
      }
    }
    focusFrame = view.requestAnimationFrame(focus);
  }

  function supports(kind: TabsMoreTrigger | 'touch', show: boolean) {
    return (show ? actions.show : actions.hide).has(kind);
  }

  function requestVisible(next: boolean) {
    cancelPending();
    if (!active || next === visible) return;
    triggerOpen = next;
    if (more && 'onVisibleChange' in more) more.onVisibleChange?.(next);
    else open = next;
  }

  function hover(next: boolean, event: PointerEvent) {
    if (event.pointerType === 'touch' || touched || !supports('hover', next)
      || !available && !visible) return;
    cancelPending();
    pending = setTimeout(() => {
      pending = undefined;
      if (active) requestVisible(next);
    }, getTooltipDelay(next ? more?.mouseEnterDelay : more?.mouseLeaveDelay,
      next && more && Object.hasOwn(more, 'mouseEnterDelay') ? 0 : 0.1));
  }

  function optionId(key: string) {
    return `${popupId}-${Array.from(key, part => part.codePointAt(0)!.toString(16)).join('-')
      || 'empty'}`;
  }

  function focusOption(key: string | undefined) {
    if (!list || key === undefined) return;
    const option = Array.from(list.querySelectorAll<HTMLButtonElement>('[role="option"]'))
      .find(element => element.dataset.tabsOverflowKey === key && !element.disabled);
    option?.focus();
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.defaultPrevented || event.isComposing) return;
    const fromMore = event.currentTarget === button;
    if (fromMore && !open) {
      if (['ArrowDown', ' ', 'Enter'].includes(event.key)) {
        cancelPending();
        open = true;
        event.preventDefault();
      }
      return;
    }
    if (event.target instanceof Element && event.target.closest('.ant-tabs-dropdown-menu-item-remove'))
      return;
    if (!fromMore && event.target instanceof Element && event.target.closest('[role="option"]')
      && (event.key === 'Enter' || event.key === ' ')) return;

    if (fromMore && event.key === 'Escape') {
      open = false;
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      const offset = event.key === 'ArrowDown' ? 1 : -1;
      if (fromMore) selectedKey = getTabsMoreNavigationKey(items, selectedKey, offset);
      else focusOption(getTabsNavigationKey(items, menuKey, offset === 1 ? 'next' : 'previous'));
      event.preventDefault();
    } else if (!fromMore && (event.key === 'Home' || event.key === 'End')) {
      focusOption(getTabsNavigationKey(items, menuKey, event.key === 'Home' ? 'first' : 'last'));
      event.preventDefault();
    } else if (!fromMore && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
      if (menuKey === undefined)
        focusOption(getTabsNavigationKey(items, undefined, event.key === 'ArrowLeft' ? 'last' : 'first'));
      event.preventDefault();
    } else if (event.key === 'Enter' || event.key === ' ') {
      if (!fromMore) {
        focusOption(menuKey ?? getTabsNavigationKey(items, undefined, 'first'));
        event.preventDefault();
      } else if (selectedKey !== null) {
        const option = Array.from(list?.querySelectorAll<HTMLButtonElement>('[role="option"]') ?? [])
          .find(element => element.dataset.tabsOverflowKey === selectedKey);
        // Публичный onTabClick остаётся MouseEvent, как у обычного native tab button.
        if (option) {
          keyboardClick = true;
          option.click();
          keyboardClick = false;
        } else {
          const click = getTabsClickEvent(event, button);
          if (click) onSelect(selectedKey, click);
        }
      }
    }
  }

  function select(item: TabsItem, event: MouseEvent) {
    if (item.disabled || event.defaultPrevented) return;
    onSelect(item.key, event);
    if (active && !keyboardClick) open = false;
  }
</script>

<style>
  .ant-tabs-nav-more[hidden] { display: none; }
  .ant-tabs-dropdown { position: fixed; inset: auto; border: 0; margin: 0; padding: 0; background: transparent; visibility: visible; overflow: visible; }
  .ant-tabs-dropdown[hidden] { display: none; }
  .ant-tabs-dropdown-menu-item { position: relative; }
  .ant-tabs-dropdown-menu-option { appearance: none; padding: 0; border: 0; background: transparent; color: inherit; font: inherit; text-align: inherit; flex: 1; min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; cursor: inherit; }
  .ant-tabs-dropdown-menu-option::after { content: ''; position: absolute; inset: 0; }
  .ant-tabs-dropdown-menu-item-remove { position: relative; z-index: 1; }
  @media (prefers-reduced-motion: reduce) { .ant-tabs-dropdown-menu-item { transition: none; } }
</style>

{#snippet value(node: TabsContent | undefined)}
  {#if typeof node === 'function'}{@render node()}{:else if node !== true && node !== false}{node ?? ''}{/if}
{/snippet}
{#snippet defaultRemove()}<TabsEditIcon name="close" />{/snippet}
{#snippet menu()}
  <ul bind:this={list} id={popupId} role="listbox" tabindex="-1"
    aria-label={locale?.dropdownAriaLabel !== undefined ? locale.dropdownAriaLabel : 'expanded dropdown'}
    aria-activedescendant={selectedId} class="ant-tabs-dropdown-menu ant-tabs-dropdown-menu-root ant-tabs-dropdown-menu-vertical"
    onkeydown={handleKeydown}>
    {#each items as item (item.key)}
      <li role="presentation" class={[
        'ant-tabs-dropdown-menu-item',
        item.disabled && 'ant-tabs-dropdown-menu-item-disabled',
        selectedKey === item.key && 'ant-tabs-dropdown-menu-item-selected'
      ]} onpointerenter={event => {
        if (!item.disabled && event.pointerType !== 'touch') menuKey = item.key;
      }}>
        <button type="button" role="option" id={optionId(item.key)}
          data-tabs-overflow-key={item.key} aria-controls={panelId(item.key)}
          aria-selected={selectedKey === item.key} aria-disabled={item.disabled || undefined}
          disabled={item.disabled} tabindex="-1" class="ant-tabs-dropdown-menu-option"
          onfocus={() => menuKey = item.key}
          onpointerdown={event => event.preventDefault()} onclick={event => select(item, event)}>
          {@render value(item.label)}
        </button>
        {#if isTabsItemRemovable(item, editable)}
          <button type="button" class={['ant-tabs-dropdown-menu-item-remove', removeClassName]}
            style={removeStyle} data-tabs-overflow-key={item.key}
            aria-label={locale?.removeAriaLabel || 'remove'} tabindex="0"
            onclick={event => onRemove(item, event)}>
            {@render value(item.closeIcon || (removeIcon ?? defaultRemove) || '×')}
          </button>
        {/if}
      </li>
    {/each}
  </ul>
{/snippet}

<div bind:this={nativeElement} class={[
  'ant-tabs-nav-operations',
  !items.length && 'ant-tabs-nav-operations-hidden'
]}>
  <button bind:this={button} type="button" id={`${rootId}-more`} class={[
      'ant-tabs-nav-more',
      dropdownVisible && (more?.openClassName ?? 'ant-tabs-dropdown-open')
    ]} hidden={mobile}
    style={`${tabBarGutter === undefined ? '' : `margin-inline-start:${tabBarGutter}px;`}${items.length ? '' : 'visibility:hidden;order:1'}`}
    aria-haspopup="listbox" aria-controls={popupId} aria-expanded={open}
    aria-label={icon === defaultMoreIcon || icon === null
      || typeof icon === 'boolean' || icon === ''
      ? 'ellipsis' : undefined}
    onpointerenter={event => hover(true, event)} onpointerleave={event => hover(false, event)}
    onfocus={() => { if (supports('focus', true)) requestVisible(true); }}
    onblur={() => { if (supports('focus', false)) requestVisible(false); }} onclick={() => {
      if (visible ? supports('click', false) || supports('contextMenu', false)
        : supports('click', true)) requestVisible(!visible);
      if (supports('click', true) || supports('click', false) || supports('contextMenu', false))
        touched = false;
    }} ontouchstart={() => {
      if (!supports('touch', true) && !supports('touch', false)) return;
      touched = true;
      if (supports('touch', !visible)) requestVisible(!visible);
    }}
    oncontextmenu={event => {
      if (supports('contextMenu', true)) {
        event.preventDefault();
        requestVisible(visible && supports('contextMenu', false) ? false : true);
      }
    }} onkeydown={handleKeydown}>
    {@render value(icon)}
  </button>
  {#if !autoDestroy || rendered}
    <div bind:this={popup} popover="manual" hidden={!shown || !present} role="presentation"
      inert={!visible} aria-hidden={!visible}
      data-tabs-popup-owner={ownerId ?? rootId}
      dir={popupDirection} class={[
        'ant-tabs-dropdown ant-tabs-css-var',
        motionState.className,
        rendered && !present && 'ant-tabs-dropdown-hidden',
        themeClassName,
        `ant-tabs-dropdown-placement-${shown ? actualSide : side}${align === 'left' ? 'Left' : align === 'right' ? 'Right' : ''}`,
        !ownOverlayClass && (rtl ?? config.direction === 'rtl')
          && 'ant-tabs-dropdown-rtl',
        more && Object.hasOwn(more, 'overlayClassName') ? more.overlayClassName : popupClassName
      ]} style={initialStyle}
      onpointerenter={event => hover(true, event)} onpointerleave={event => hover(false, event)}
      onclick={event => more?.onOverlayClick?.(event)}>
      {#if rendered && more && Object.hasOwn(more, 'overlay')}
        {@render more.overlay?.()}
      {:else if rendered && more?.popupRender}
        {@render more.popupRender(menu, { restTabs: items, onClose: () => open = false })}
      {:else if rendered}{@render menu()}{/if}
    </div>
  {/if}
</div>
