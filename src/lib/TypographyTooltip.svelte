<script lang="ts">
  import { untrack } from 'svelte';
  import { useConfig } from './config-context';
  import { getTooltipActions, getTooltipDelay } from './tooltip.engine';
  import NoCompactStyle from './NoCompactStyle.svelte';
  import TooltipPopup from './TooltipPopup.svelte';
  import type { TypographyContent as Content } from './typography.types';
  import type { TooltipContent, TooltipProps, TooltipTrigger } from './tooltip.types';

  let { target, title, enabled = true, options = {} }: {
    target?: HTMLElement;
    title?: Content;
    enabled?: boolean;
    options?: Omit<TooltipProps, 'children' | 'title'>;
  } = $props();

  const config = useConfig();
  let resolvedTitle = $derived(toTooltipContent(title === 0 ? title : options.overlay || title));
  let resolvedTrigger = $derived<TooltipTrigger | readonly TooltipTrigger[]>(
    options.trigger || config.tooltip?.trigger || 'hover'
  );
  let enterDelay = $derived(options.mouseEnterDelay ?? config.tooltip?.mouseEnterDelay ?? 0.1);
  let leaveDelay = $derived(options.mouseLeaveDelay ?? config.tooltip?.mouseLeaveDelay ?? 0.1);
  let actionOverrides = $derived(options.showAction !== undefined || options.hideAction !== undefined);
  let actions = $derived(getTooltipActions(resolvedTrigger, options.showAction, options.hideAction));
  let sourceTouch = $derived(actionOverrides || Boolean(config.tooltip));
  let sourceTrigger = $derived(Boolean(config.tooltip) || resolvedTrigger.length === 0
    || supports('click') || supports('contextMenu') || actionOverrides);
  let open = $state(untrack(() => options.defaultOpen ?? false));
  let available = $derived(Boolean(resolvedTitle) || resolvedTitle === 0);
  let visible = $derived(enabled && available && (options.open ?? open));
  let mounted = $state(false);

  $effect(() => {
    if (visible || options.forceRender && available) mounted = true;
  });

  $effect(() => {
    const element = target;
    if (!element) return;
    return untrack(() => connect(element));
  });

  let dismiss: (reason?: 'escape' | 'outside') => void = () => {};

  // Typography уже поддерживает bigint; в Tooltip сохраняется его текстовое представление.
  function toTooltipContent(value: Content): TooltipContent {
    if (typeof value === 'object' && value !== null) return value.map(toTooltipContent);
    return typeof value === 'bigint' ? String(value) : value;
  }

  function supports(trigger: TooltipTrigger) {
    return typeof resolvedTrigger === 'string'
      ? resolvedTrigger === trigger : resolvedTrigger.includes(trigger);
  }

  function connect(element: HTMLElement) {
    let hovered = false;
    let focused = false;
    let popupHovered = false;
    let clicked = false;
    let dismissed = false;
    let touched = false;
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;

    function inPopup(node: EventTarget | null) {
      const view = element.ownerDocument.defaultView!;
      if (!(node instanceof view.Node)) return false;

      const source = node instanceof view.Element ? node : node.parentElement;
      const popup = source?.closest('[data-ant-tooltip]');
      return Boolean(popup && element.contains(popup));
    }

    function cancelPending() {
      clearTimeout(timer);
      timer = undefined;
    }

    function wanted() {
      return !dismissed && (clicked || hovered && supports('hover')
        || focused && supports('focus') || popupHovered);
    }

    function request(next: boolean, delay = 0) {
      cancelPending();
      const owner = options.open;
      // Удаление overrides не отменяет уже запущенный source action.
      const independentActions = actionOverrides;
      const apply = () => {
        timer = undefined;
        if (!active || !element.isConnected || target !== element) return;
        // Как в rc-trigger, отсутствие усечения скрывает popup, сохраняя raw onOpenChange.
        if (!available || !Object.is(owner, options.open)
          || !independentActions && !actionOverrides && next && !wanted()
          || next === (options.open ?? open)) return;

        open = next;
        options.onOpenChange?.(next);
      };
      if (delay !== 0) timer = setTimeout(apply, delay);
      else apply();
    }

    function handleEnter(event: PointerEvent) {
      if (event.pointerType === 'touch' || sourceTouch && touched) return;
      hovered = true;
      dismissed = false;
      if (actions.show.has('hover')) request(true, getTooltipDelay(enterDelay));
    }

    function handleLeave() {
      if (sourceTouch && touched) return;

      hovered = false;
      if (sourceTrigger ? actions.hide.has('hover') : !wanted())
        request(false, getTooltipDelay(leaveDelay));
    }

    function handleFocus(event: FocusEvent) {
      if (!active || !element.isConnected) return;
      if (sourceTrigger && inPopup(event.target)) return;

      focused = true;
      dismissed = false;
      if (actions.show.has('focus')) request(true, (options.focusDelay ?? 0) * 1000);
    }

    function handleBlur(event: FocusEvent) {
      if (!active || !element.isConnected) return;

      function closeIfOutside() {
        if (!active || !element.isConnected) return;
        if (sourceTrigger && inPopup(event.target)) return;
        const Node = element.ownerDocument.defaultView!.Node;
        if (event.relatedTarget instanceof Node && element.contains(event.relatedTarget)
          && (!sourceTrigger || !inPopup(event.relatedTarget))) return;

        focused = false;
        if (sourceTrigger ? actions.hide.has('focus') : !wanted()) {
          request(false, (options.blurDelay ?? 0) * 1000);
        }
      }
      // Удаление focused DOM может отправить blur до cleanup родительских props.
      if (event.relatedTarget === null) queueMicrotask(closeIfOutside);
      else closeIfOutside();
    }

    dismiss = reason => {
      if (reason === 'outside' && actionOverrides && !actions.hide.has('click')
        && !actions.hide.has('contextMenu') && !actions.hide.has('touch')) return;

      dismissed = true;
      clicked = false;
      request(false);
    };

    function showByClick() {
      dismissed = false;
      clicked = true;
      request(true);
      if (!visible) clicked = false;
    }

    function handleClick(event: MouseEvent) {
      const show = actions.show.has('click');
      const hide = actions.hide.has('click') || actions.hide.has('contextMenu');
      if (inPopup(event.target) || event.defaultPrevented && !actionOverrides || !show && !hide) return;

      if (visible && hide) dismiss();
      else if (!visible && show) showByClick();
      if (sourceTouch) touched = false;
    }

    function handleContextMenu(event: MouseEvent) {
      if (inPopup(event.target) || !actions.show.has('contextMenu') || !available) return;

      event.preventDefault();
      if (visible && actions.hide.has('contextMenu')) dismiss();
      else showByClick();
    }

    function handleTouchStart(event: TouchEvent) {
      if (inPopup(event.target) || !sourceTouch
        || !actions.show.has('touch') && !actions.hide.has('touch')) return;

      touched = true;
      if (visible && actions.hide.has('touch')) dismiss();
      else if (!visible && actions.show.has('touch')) showByClick();
    }

    hoverPopup = value => {
      if (!active || !element.isConnected) return;

      if (actionOverrides) {
        if (value) {
          if (actions.show.has('hover') && visible) request(true, getTooltipDelay(enterDelay));
        } else if (actions.hide.has('hover')) request(false, getTooltipDelay(leaveDelay));
        return;
      }
      if (sourceTrigger && !supports('hover')) return;

      popupHovered = value;
      if (value) cancelPending();
      else if (sourceTrigger ? supports('hover') : !wanted())
        request(false, getTooltipDelay(leaveDelay));
    };
    element.addEventListener('pointerenter', handleEnter);
    element.addEventListener('pointerleave', handleLeave);
    element.addEventListener('focusin', handleFocus);
    element.addEventListener('focusout', handleBlur);
    element.addEventListener('click', handleClick);
    element.addEventListener('contextmenu', handleContextMenu);
    element.addEventListener('touchstart', handleTouchStart);
    return () => {
      active = false;
      cancelPending();
      element.removeEventListener('pointerenter', handleEnter);
      element.removeEventListener('pointerleave', handleLeave);
      element.removeEventListener('focusin', handleFocus);
      element.removeEventListener('focusout', handleBlur);
      element.removeEventListener('click', handleClick);
      element.removeEventListener('contextmenu', handleContextMenu);
      element.removeEventListener('touchstart', handleTouchStart);
    };
  }
  let hoverPopup: (value: boolean) => void = () => {};
</script>

{#if mounted}
  <NoCompactStyle>
    <TooltipPopup title={resolvedTitle} contentAvailable={available}
      open={visible} anchor={target} describe={target} trigger={target}
      color={options.color} prefixCls={options.prefixCls} openClassName={options.openClassName}
      semanticProps={{
        ...options,
        disabled: !enabled,
        title: resolvedTitle,
        trigger: resolvedTrigger,
        mouseEnterDelay: enterDelay,
        mouseLeaveDelay: leaveDelay
      }}
      placement={options.placement} arrow={options.arrow} autoAdjustOverflow={options.autoAdjustOverflow}
      outsideEvents={actionOverrides ? 'mouse' : undefined}
      getPopupContainer={options.getPopupContainer}
      onDismiss={reason => dismiss(reason)} onHoverChange={value => hoverPopup(value)} />
  </NoCompactStyle>
{/if}
