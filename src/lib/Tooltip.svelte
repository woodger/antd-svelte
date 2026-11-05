<script lang="ts">
  import NoCompactStyle from './NoCompactStyle.svelte';
  import { onDestroy, untrack } from 'svelte';
  import { useConfig } from './config-context';
  import { getTooltipContent, getTooltipDelay, hasTooltipContent } from './tooltip.engine';
  import type { TooltipProps, TooltipTrigger } from './tooltip.types';
  import TooltipPopup from './TooltipPopup.svelte';

  let {
    open = $bindable<boolean | undefined>(),
    open: providedOpen,
    ...props
  }: TooltipProps = $props();
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
    getTooltipContainer,
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
  let sourceTrigger = $derived(Boolean(config.tooltip) || resolvedTrigger.length === 0
    || supports('click') || supports('contextMenu'));
  const initialDefault = untrack(() => defaultOpen);
  let host = $state<HTMLSpanElement>();
  let anchor = $state<Element>();
  let pending: ReturnType<typeof setTimeout> | undefined;
  let hovered = false;
  let focused = false;
  let popupHovered = false;
  let clicked = false;
  let dismissed = false;
  let active = true;
  let content = $derived(getTooltipContent(title, overlay));
  let available = $derived(hasTooltipContent(content));
  let visible = $derived(available && (open ?? initialDefault));

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
    const ownerValue = open;

    function apply() {
      pending = undefined;

      if (!active
        || !available
        || !target?.isConnected
        || target !== anchor
        || !Object.is(
          open,
          ownerValue
        )
        || next
        && !wanted()
        || next === (open
          ?? initialDefault)) return;

      open = next;
      onOpenChange?.(next);
    }

    if (delay)
      pending = setTimeout(apply, delay);
    else apply();
  }

  function handleEnter(event: PointerEvent) {
    if (event.pointerType === 'touch') return;

    hovered = true;
    dismissed = false;
    if (supports('hover'))
      request(true, getTooltipDelay(enterDelay));
  }

  function handleLeave() {
    hovered = false;
    if (sourceTrigger ? supports('hover') : !wanted())
      request(false, getTooltipDelay(leaveDelay));
  }

  function handleFocus() {
    focused = true;
    dismissed = false;
    if (supports('focus'))
      request(true);
  }

  function handleBlur(event: FocusEvent) {
    if (event.relatedTarget instanceof Node && host?.contains(event.relatedTarget)) return;

    focused = false;
    if (sourceTrigger ? supports('focus') : !wanted())
      request(false);
  }

  function handlePopupHover(next: boolean) {
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
    if (event.defaultPrevented || !supports('click') && !supports('contextMenu')) return;

    if (visible) dismiss();
    else if (supports('click')) showByClick();
  }

  function handleContextMenu(event: MouseEvent) {
    if (!supports('contextMenu')) return;

    event.preventDefault();
    if (visible) dismiss();
    else showByClick();
  }

  function dismiss() {
    dismissed = true;
    clicked = false;
    request(false);
  }
</script>

<style>
  .ant-tooltip-trigger { display: inline-block; max-width: 100%; vertical-align: middle; }
</style>

<span bind:this={host} role="presentation" class={['ant-tooltip-trigger', className]} {style} onpointerenter={handleEnter} onpointerleave={handleLeave} onfocusin={handleFocus} onfocusout={handleBlur} onclick={handleClick} oncontextmenu={handleContextMenu}>{@render children()}</span><NoCompactStyle><TooltipPopup title={content} color={props.color} prefixCls={props.prefixCls} open={visible} {anchor} describe={anchor} trigger={host} {placement} {arrow} {autoAdjustOverflow} {getPopupContainer} {getTooltipContainer}
  semanticProps={{ ...props, open: providedOpen, trigger: resolvedTrigger,
    mouseEnterDelay: enterDelay, mouseLeaveDelay: leaveDelay }}
  onDismiss={dismiss} onHoverChange={handlePopupHover} /></NoCompactStyle>
