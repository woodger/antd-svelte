<script lang="ts">
  import NoCompactStyle from './NoCompactStyle.svelte';
  import { onDestroy, onMount, untrack } from 'svelte';
  import { useConfig } from './config-context';
  import {
    getTooltipActions,
    getTooltipContent,
    getTooltipDelay,
    hasTooltipContent
  } from './tooltip.engine';
  import type { TooltipProps, TooltipRef, TooltipTrigger } from './tooltip.types';
  import TooltipPopup from './TooltipPopup.svelte';

  let {
    ref = $bindable<TooltipRef | undefined>(),
    open = $bindable<boolean | undefined>(),
    open: providedOpen,
    ...props
  }: TooltipProps & { ref?: TooltipRef } = $props();
  let {
    title,
    overlay,
    children,
    defaultOpen = false,
    onOpenChange,
    placement = 'top',
    arrow,
    autoAdjustOverflow = true,
    trigger,
    mouseEnterDelay,
    mouseLeaveDelay,
    getPopupContainer,
    class: className = '',
    style
  } = $derived(props);

  const config = useConfig();
  // Source config использует hover; без него сохраняется прежний native hover/focus.
  let resolvedTrigger = $derived<TooltipTrigger | readonly TooltipTrigger[]>(
    trigger || config.tooltip?.trigger || (config.tooltip ? 'hover' : ['hover', 'focus'])
  );
  let enterDelay = $derived(mouseEnterDelay ?? config.tooltip?.mouseEnterDelay ?? 0.1);
  let leaveDelay = $derived(mouseLeaveDelay ?? config.tooltip?.mouseLeaveDelay ?? 0.1);
  let actionOverrides = $derived(props.showAction !== undefined || props.hideAction !== undefined);
  let actions = $derived(getTooltipActions(resolvedTrigger, props.showAction, props.hideAction));
  let sourceTouch = $derived(actionOverrides || Boolean(config.tooltip));
  let sourceTrigger = $derived(Boolean(config.tooltip) || resolvedTrigger.length === 0
    || supports('click') || supports('contextMenu') || actionOverrides);
  const initialDefault = untrack(() => defaultOpen);
  // Отдельный raw state переживает обновление spread props без входного open.
  let uncontrolledOpen = $state(initialDefault);
  let rawOpen = $derived(providedOpen === undefined ? uncontrolledOpen : open ?? initialDefault);
  let host = $state<HTMLSpanElement>();
  let anchor = $state<Element>();
  let popupController = $state<{
    getPopupElement: () => HTMLSpanElement | undefined;
    forceAlign: () => void;
  }>();
  let pending: ReturnType<typeof setTimeout> | undefined;
  let hovered = false;
  let focused = false;
  let popupHovered = false;
  let clicked = false;
  let dismissed = false;
  let touched = false;
  let active = true;
  let content = $derived(getTooltipContent(title, overlay));
  let available = $derived(hasTooltipContent(content));
  let visible = $derived(!props.disabled && available && rawOpen);

  onMount(() => {
    ref = {
      get nativeElement() { return anchor; },
      get popupElement() { return popupController?.getPopupElement(); },
      forceAlign: () => untrack(() => popupController?.forceAlign())
    };

    return () => { ref = undefined; };
  });

  $effect(() => {
    const element = host;

    if (!element) return;

    function update() {
      anchor = element!.firstElementChild ?? element;
    }

    update();
    const observer = new MutationObserver(update);
    observer.observe(element, { childList: true });

    return () => observer.disconnect();
  });

  onDestroy(() => {
    active = false;
    cancelPending();
  });

  function cancelPending() {
    if (pending !== undefined)
      clearTimeout(pending);
    pending = undefined;
  }

  function supports(kind: TooltipTrigger) {
    return typeof resolvedTrigger === 'string'
      ? resolvedTrigger === kind : resolvedTrigger.includes(kind);
  }

  function wanted() {
    return !dismissed
      && (clicked
        || hovered
        && supports('hover')
        || focused
        && supports('focus')
        || popupHovered);
  }

  function request(next: boolean, delay = 0) {
    cancelPending();
    const target = anchor;
    const ownerValue = providedOpen;
    // Удаление overrides не отменяет уже запущенный source action.
    const independentActions = actionOverrides;

    function apply() {
      pending = undefined;

      if (!active
        || !available
        || !target?.isConnected
        || target !== anchor
        || !Object.is(
          providedOpen,
          ownerValue
        )
        || !independentActions && !actionOverrides && next
        && !wanted()
        || next === rawOpen) return;

      uncontrolledOpen = next;
      open = next;
      onOpenChange?.(next);
    }

    if (delay !== 0)
      pending = setTimeout(apply, delay);
    else apply();
  }

  function handleEnter(event: PointerEvent) {
    if (event.pointerType === 'touch' || sourceTouch && touched) return;

    hovered = true;
    dismissed = false;
    if (actions.show.has('hover'))
      request(true, getTooltipDelay(enterDelay));
  }

  function handleLeave() {
    if (sourceTouch && touched) return;

    hovered = false;
    if (sourceTrigger ? actions.hide.has('hover') : !wanted())
      request(false, getTooltipDelay(leaveDelay));
  }

  function handleFocus() {
    focused = true;
    dismissed = false;
    if (actions.show.has('focus'))
      request(true, (props.focusDelay ?? 0) * 1000);
  }

  function handleBlur(event: FocusEvent) {
    const target = anchor;
    function closeIfOutside() {
      if (!active || !target?.isConnected || target !== anchor) return;
      if (event.relatedTarget instanceof Node && host?.contains(event.relatedTarget)) return;

      focused = false;
      if (sourceTrigger ? actions.hide.has('focus') : !wanted()) {
        request(false, (props.blurDelay ?? 0) * 1000);
      }
    }
    // Native blur без relatedTarget также приходит во время удаления focused DOM.
    if (event.relatedTarget === null) queueMicrotask(closeIfOutside);
    else closeIfOutside();
  }

  function handlePopupHover(next: boolean) {
    if (actionOverrides) {
      if (next) {
        if (actions.show.has('hover') && visible) request(true, getTooltipDelay(enterDelay));
      } else if (actions.hide.has('hover')) request(false, getTooltipDelay(leaveDelay));
      return;
    }
    if (sourceTrigger && !supports('hover')) return;

    popupHovered = next;
    if (next)
      cancelPending();
    else if (sourceTrigger ? supports('hover') : !wanted())
      request(false, getTooltipDelay(leaveDelay));
  }

  function showByClick() {
    if (anchor?.matches(':disabled, [aria-disabled="true"]')) return;

    dismissed = false;
    clicked = true;
    request(true);
    if (!visible) clicked = false;
  }

  function handleClick(event: MouseEvent) {
    const show = actions.show.has('click');
    const hide = actions.hide.has('click') || actions.hide.has('contextMenu');
    if (event.defaultPrevented && !actionOverrides || !show && !hide) return;

    if (visible && hide) dismiss();
    else if (!visible && show) showByClick();
    if (sourceTouch) touched = false;
  }

  function handleContextMenu(event: MouseEvent) {
    if (!actions.show.has('contextMenu')) return;

    event.preventDefault();
    if (visible && actions.hide.has('contextMenu')) dismiss();
    else showByClick();
  }

  function handleTouchStart() {
    if (!sourceTouch || !actions.show.has('touch') && !actions.hide.has('touch')) return;

    touched = true;
    if (visible && actions.hide.has('touch')) dismiss();
    else if (!visible && actions.show.has('touch')) showByClick();
  }

  function dismiss(reason?: 'escape' | 'outside') {
    if (reason === 'outside' && actionOverrides && !actions.hide.has('click')
      && !actions.hide.has('contextMenu') && !actions.hide.has('touch')) return;

    dismissed = true;
    clicked = false;
    request(false);
  }
</script>

<style>
  .ant-tooltip-trigger { display: inline-block; max-width: 100%; vertical-align: middle; }
</style>

<span bind:this={host} role="presentation" class={['ant-tooltip-trigger', className]} {style} onpointerenter={handleEnter} onpointerleave={handleLeave} onfocusin={handleFocus} onfocusout={handleBlur} onclick={handleClick} oncontextmenu={handleContextMenu} ontouchstart={handleTouchStart}>{@render children()}</span><NoCompactStyle><TooltipPopup bind:this={popupController} title={content} color={props.color} prefixCls={props.prefixCls} open={visible} {anchor} describe={anchor} trigger={host} {placement} {arrow} {autoAdjustOverflow} {getPopupContainer}
  outsideEvents={actionOverrides ? 'mouse' : undefined}
  semanticProps={{ ...props, open: providedOpen, trigger: resolvedTrigger,
    mouseEnterDelay: enterDelay, mouseLeaveDelay: leaveDelay }}
  onDismiss={dismiss} onHoverChange={handlePopupHover} /></NoCompactStyle>
