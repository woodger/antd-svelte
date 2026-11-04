<script lang="ts">
  import NoCompactStyle from './NoCompactStyle.svelte';
  import { onDestroy, onMount, untrack } from 'svelte';
  import { useConfig } from './config-context';
  import { useDesignTokenContext } from './theme-context.svelte';
  import { useComponentTheme } from './theme-component.svelte';
  import { getOverlaySemantics } from './overlay-semantic.engine';
  import { createOverlayStyle } from './overlay-style.model.svelte';
  import { getTooltipColor } from './tooltip-color.engine';
  import { connectInlineStyle } from './inline-style.dom';
  import { serializeInlineStyleLayers } from './inline-style.engine';
  import { consumePopconfirmTheme } from './popover-theme-context';
  import { connectPopup, getPopupActiveElement } from './popup.dom';
  import { createPopupContainer } from './popup-container.model.svelte.js';
  import { connectPopoverTrigger, focusPopover } from './popover.dom';
  import {
    getTooltipArrow,
    getTooltipDelay,
    getTooltipPlacementConfig,
    isTooltipCorner
  } from './tooltip.engine';
  import type {
    PopoverContent,
    PopoverProps,
    PopoverSemanticProps,
    PopoverTrigger
  } from './popover.types';

  let {
    open = $bindable<boolean | undefined>(),
    open: providedOpen,
    ...props
  }: PopoverProps = $props();
  let {
    children,
    title,
    content,
    color,
    defaultOpen = false,
    onOpenChange,
    destroyOnHidden,
    destroyTooltipOnHide,
    trigger,
    placement = 'top',
    arrow,
    autoAdjustOverflow = true,
    mouseEnterDelay,
    mouseLeaveDelay,
    getPopupContainer,
    getTooltipContainer,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedby,
    'aria-busy': ariaBusy,
    popupClass,
    rootClassName,
    classNames,
    styles,
    overlayClassName,
    overlayStyle,
    overlayInnerStyle,
    class: className = '',
    style
  } = $derived(props);

  const config = useConfig();
  const designTokens = useDesignTokenContext();
  const tooltipTheme = useComponentTheme('Tooltip');
  const componentTheme = useComponentTheme('Popover');
  const isPopconfirm = consumePopconfirmTheme();
  const confirmTheme = isPopconfirm ? useComponentTheme('Popconfirm') : undefined;
  let resolvedTrigger = $derived<PopoverTrigger | readonly PopoverTrigger[]>(
    trigger || config.popover?.trigger || (config.popover ? 'hover' : ['hover', 'focus'])
  );
  let enterDelay = $derived(mouseEnterDelay ?? config.popover?.mouseEnterDelay ?? 0.1);
  let leaveDelay = $derived(mouseLeaveDelay ?? config.popover?.mouseLeaveDelay ?? 0.1);
  let sourceTrigger = $derived(Boolean(config.popover)
    || isPopconfirm && (Boolean(config.popconfirm) || Array.isArray(trigger))
    || supports('contextMenu'));
  let providedArrow = $derived(
    isPopconfirm ? getTooltipArrow(arrow, config.popconfirm?.arrow) : arrow
  );
  let arrowConfig = $derived(getTooltipArrow(providedArrow, config.popover?.arrow));
  let callbackProps = $derived<PopoverSemanticProps>({
    ...props,
    open: providedOpen,
    placement,
    arrow: providedArrow,
    trigger: resolvedTrigger,
    mouseEnterDelay: enterDelay,
    mouseLeaveDelay: leaveDelay,
    overlayStyle
  });
  let semantics = $derived(getOverlaySemantics(
    config.popover,
    classNames,
    styles,
    callbackProps,
    overlayStyle
  ));
  let popupThemeStyle = $derived(
    [tooltipTheme.style, componentTheme.style, confirmTheme?.style].filter(Boolean).join(';')
      || undefined
  );
  let colorInfo = $derived(getTooltipColor(color, 'ant-popover'));
  let rootLayers = $derived([
    popupThemeStyle, colorInfo.arrowStyle, semantics.styles.root
  ]);
  let rootStyle = $derived(serializeInlineStyleLayers(rootLayers));
  let containerLayers = $derived([
    semantics.styles.container, overlayInnerStyle, colorInfo.overlayStyle
  ]);
  const initialContainerStyle = untrack(() => serializeInlineStyleLayers(containerLayers));
  const initialStyle = untrack(() => rootStyle);
  const popupStyle = createOverlayStyle(() => rootLayers);
  const generatedId = $props.id();
  const id = `ant-popover-${generatedId}`;
  const titleId = `${id}-title`;
  const initialDefault = untrack(() => defaultOpen);
  let host = $state<HTMLSpanElement>();
  let anchor = $state<Element>();
  let popup = $state<HTMLDivElement>();
  let shown = $state(false);
  let actualPlacement = $state(untrack(() => placement));
  let pending: ReturnType<typeof setTimeout> | undefined;
  let hovered = false;
  let focused = false;
  let popupHovered = false;
  let popupFocused = false;
  let clicked = false;
  let dismissed = false;
  let closing = false;
  let focusOnShow = false;
  let resumeFocus: HTMLElement | undefined;
  let active = true;
  let mounted = $state(false);
  let sourcePlacement = $derived(typeof arrow === 'object'
    || Boolean(config.popover) || isPopconfirm && Boolean(config.popconfirm)
    || typeof autoAdjustOverflow === 'object');
  let hasTitle = $derived(hasContent(title));
  let hasBody = $derived(hasContent(content));
  let available = $derived(hasTitle || hasBody);
  let visible = $derived(available && (open ?? initialDefault));
  let destroy = $derived(destroyOnHidden ?? Boolean(destroyTooltipOnHide));
  let renderContent = $derived(!destroy || mounted && visible);
  const portal = createPopupContainer(() => ({
    open: visible,
    reference: anchor,
    getPopupContainer: getPopupContainer || getTooltipContainer || config.getPopupContainer,
    themeStyle: rootStyle
  }));

  function containerStyle(node: HTMLElement) {
    const update = connectInlineStyle(node);
    $effect(() => update(containerLayers));
  }

  function hasContent(value: PopoverContent | null | undefined) {
    return typeof value === 'function'
      || value !== null
      && value !== undefined
      && value !== false
      && Boolean(
        String(value).trim()
      );
  }

  onMount(() => { mounted = true; });

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

  $effect(() => {
    if (anchor && available) return connectPopoverTrigger(anchor, id, shown);
  });

  $effect.pre(() => {
    const source = anchor;
    const surface = popup;

    if (visible) return;

    clicked = false;
    focusOnShow = false;
    // Возвращаем фокус до удаления условного snippet и скрытия поверхности.
    if (surface?.contains(getPopupActiveElement(surface))
      && source instanceof HTMLElement
      && source.isConnected) {
      untrack(() => {
        closing = true;
        source.focus({ preventScroll: true });
        closing = false;
      });
    }
  });

  $effect(() => {
    const surface = popup;
    const source = anchor;

    if (!surface || !source || !visible) return;

    // Положение меняется без повторного hide/show, чтобы сохранить ввод и фокус.
    const disconnect = untrack(() => connectPopup(surface, source, {
      trigger: host,
      get placement() {
        return placement;
      },
      get autoAdjustOverflow() {
        return autoAdjustOverflow;
      },
      get sourcePlacement() {
        return sourcePlacement
          ? getTooltipPlacementConfig(arrowConfig, designTokens.state.token) : undefined;
      },
      maxWidth: '100vw',
      gap: () => untrack(() => designTokens.enabled || isTooltipCorner(placement) || sourcePlacement
        ? (arrowConfig.show ? designTokens.state.token.sizePopupArrow / 2 : 0)
          + designTokens.state.token.marginXXS : undefined),
      preserveFocus: false,
      applyPosition: popupStyle.position,
      onPlacement: (next) => {
        actualPlacement = next;
      },
      onDismiss: dismiss,
      onVisibilityChange: (next) => {
        shown = next;
        if (!next) {
          popupFocused = false;
          popupHovered = false;
        }
        else if (resumeFocus?.isConnected) {
          resumeFocus.focus({ preventScroll: true });
          resumeFocus = undefined;
        }
        else if (focusOnShow) {
          focusOnShow = false;
          focusPopover(surface);
        }
      }
    }));

    return () => {
      resumeFocus = surface.contains(getPopupActiveElement(surface))
        ? getPopupActiveElement(surface) as HTMLElement
        : undefined;

      closing = true;
      disconnect();
      closing = false;
    };
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

  function supports(kind: PopoverTrigger) {
    return typeof resolvedTrigger === 'string'
      ? resolvedTrigger === kind : resolvedTrigger.includes(kind);
  }

  function wanted() {
    return !dismissed
      && (clicked
        || popupHovered
        || popupFocused
        || hovered
        && supports('hover')
        || focused
        && supports(
          'focus'
        ));
  }

  function request(next: boolean, delay = 0) {
    cancelPending();
    const target = anchor;
    const ownerValue = open;

    function apply() {
      pending = undefined;
      if (!active
        || next
        && !available
        || !target?.isConnected
        || target !== anchor
        || !Object.is(
          open,
          ownerValue
        )
        || next
        && !wanted()) return;

      if (next !== (open ?? initialDefault)) {
        open = next;
        onOpenChange?.(next);
      }
      // Отклонённое открытие не должно превращать следующий click в закрытие.
      if (next && !visible) {
        clicked = false;
        focusOnShow = false;
      }
      if (next && visible && shown && focusOnShow && popup) {
        focusOnShow = false;
        focusPopover(popup);
      }
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

  function handleFocus(event: FocusEvent) {
    focused = true;
    if (!active
      || closing
      || !shown
      && event.relatedTarget instanceof Node
      && popup?.contains(
        event.relatedTarget
      )) return;

    dismissed = false;
    if (supports('focus'))
      request(true);
  }

  function handleBlur(event: FocusEvent) {
    if (event.relatedTarget instanceof Node && host?.contains(event.relatedTarget)) return;

    focused = false;
    if (closing
      || event.relatedTarget instanceof Node
      && popup?.contains(event.relatedTarget)) return;

    clicked = false;
    if (sourceTrigger ? supports('focus') : !wanted())
      request(false);
  }

  function handleClick(event: MouseEvent) {
    if (event.defaultPrevented
      || !supports('click') && !supports('contextMenu')
      || anchor?.matches(
        ':disabled, [aria-disabled="true"]'
      )) return;

    if (clicked || visible && (sourceTrigger || !wanted()))
      dismiss('trigger');
    else if (supports('click')) {
      clicked = true;
      dismissed = false;
      focusOnShow = !sourceTrigger;
      request(true);
    }
  }

  function handleContextMenu(event: MouseEvent) {
    if (!supports('contextMenu') || anchor?.matches(':disabled, [aria-disabled="true"]')) return;

    event.preventDefault();
    if (visible) dismiss('trigger');
    else {
      clicked = true;
      dismissed = false;
      request(true);
    }
  }

  function handlePopupHover(next: boolean) {
    if (sourceTrigger && !supports('hover')) return;

    popupHovered = next;
    if (next)
      cancelPending();
    else if (sourceTrigger ? supports('hover') : !wanted())
      request(false, getTooltipDelay(leaveDelay));
  }

  function handlePopupBlur(event: FocusEvent) {
    if (event.relatedTarget instanceof Node && popup?.contains(event.relatedTarget)) return;

    popupFocused = false;
    function closeIfOutside() {
      if (!active
        || !host?.isConnected
        || !popup?.isConnected
        || closing
        || !shown
        || event.relatedTarget instanceof Node
        && host?.contains(
          event.relatedTarget
        )) return;

      if (sourceTrigger && !supports('focus')) return;

      clicked = false;
      if (!wanted())
        request(false);
    }
    // При remove() браузер отправляет blur до отсоединения DOM и cleanup Svelte.
    if (event.relatedTarget === null)
      queueMicrotask(closeIfOutside);
    else closeIfOutside();
  }

  function dismiss(reason: 'escape' | 'outside' | 'trigger') {
    const previous = { clicked, dismissed, focusOnShow };
    clicked = false;
    dismissed = true;
    focusOnShow = false;
    request(false);
    if (visible) {
      ({ clicked, dismissed, focusOnShow } = previous);
      return;
    }
    if (reason === 'escape'
      && popup?.contains(getPopupActiveElement(popup))
      && anchor instanceof HTMLElement) {
      closing = true;
      anchor.focus({ preventScroll: true });
      closing = false;
    }
  }
</script>

<style>
  .ant-popover-trigger { display: inline-block; max-width: 100%; vertical-align: middle; }
  .ant-popover { position: fixed; inset: auto; margin: 0; padding: 0; border: 0; background: transparent; overflow: visible; }
  .ant-popover[hidden], .ant-popover:not(:popover-open) { display: none; }
  .ant-popover-container { box-sizing: border-box; max-height: calc(100dvh - 16px); overflow: auto; overflow-wrap: anywhere; }
  .ant-popover-title { min-width: min(var(--ant-popover-title-min-width), calc(100vw - 48px)); }
  .ant-popover-placement-top > .ant-popover-arrow, .ant-popover-placement-bottom > .ant-popover-arrow { left: var(--arrow-x, 50%); }
  .ant-popover-placement-left > .ant-popover-arrow, .ant-popover-placement-right > .ant-popover-arrow { top: var(--arrow-y, 50%); }
  @media (prefers-reduced-motion: reduce) { .ant-popover, .ant-popover-container { animation: none; transition: none; } }
</style>

<span bind:this={host} role="presentation" class={['ant-popover-trigger', className]} {style} onpointerenter={handleEnter} onpointerleave={handleLeave} onfocusin={handleFocus} onfocusout={handleBlur} onclick={handleClick} oncontextmenu={handleContextMenu}>{@render children()}</span>
<NoCompactStyle>
<div bind:this={popup} {id} role="dialog" popover="manual" hidden tabindex="-1" dir={config.direction} aria-label={ariaLabel} aria-labelledby={!ariaLabel
    ? ariaLabelledby ?? (hasTitle ? titleId : undefined)
    : undefined} aria-describedby={ariaDescribedby} aria-busy={ariaBusy} class={[
        'ant-popover',
        designTokens.enabled && 'ant-popover-css-var',
        designTokens.enabled && designTokens.state.key,
        designTokens.enabled && designTokens.state.hashId,
        popupClass,
        colorInfo.className,
        `ant-popover-placement-${shown ? actualPlacement : placement}`,
        config.direction === 'rtl' && 'ant-popover-rtl',
        rootClassName, overlayClassName, config.popover?.class, semantics.classNames.root
      ]} style={initialStyle}
    {@attach popupStyle.attach} {@attach portal}
    onpointerenter={(event) => {
      if (event.pointerType !== 'touch')
        handlePopupHover(true);
    }} onpointerleave={() => handlePopupHover(false)} onfocusin={() => {
      popupFocused = true;
      cancelPending();
    }} onfocusout={handlePopupBlur}>
  {#if arrowConfig.show}<div class={['ant-popover-arrow', semantics.classNames.arrow]}
    style={semantics.styles.arrow} aria-hidden="true"></div>{/if}
  <div class={['ant-popover-container', semantics.classNames.container]}
    data-ant-overlay-color={colorInfo.overlayStyle.length > 0 || undefined}
    style={initialContainerStyle} {@attach containerStyle}>
    {#if renderContent}
      {#if hasTitle}<div id={titleId} class={['ant-popover-title', semantics.classNames.title]}
        style={semantics.styles.title}>{#if typeof title === 'function'}{@render title()}{:else if typeof title !== 'boolean'}{title}{/if}</div>{/if}
      {#if hasBody}<div class={['ant-popover-content', semantics.classNames.content]}
        style={semantics.styles.content}>{#if typeof content === 'function'}{@render content()}{:else if typeof content !== 'boolean'}{content}{/if}</div>{/if}
    {/if}
  </div>
</div>
</NoCompactStyle>
