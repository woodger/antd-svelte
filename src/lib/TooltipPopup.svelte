<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import RenderContent from './RenderContent.svelte';
  import { useConfig } from './config-context';
  import { useComponentTheme } from './theme-component.svelte';
  import { getOverlaySemantics } from './overlay-semantic.engine';
  import { createOverlayStyle } from './overlay-style.model.svelte';
  import { getPopupArrowStyle, getPopupPlacement, getPopupPlacements } from './popup-position.engine';
  import type { TooltipPosition } from './tooltip.engine';
  import { getTooltipColor } from './tooltip-color.engine';
  import { getOverlayPrefixCss } from './overlay-prefix.engine';
  import prefixTemplate from './vendor/tooltip-prefix.css.js';
  import ThemeScopeStyle from './ThemeScopeStyle.svelte';
  import { connectInlineStyle } from './inline-style.dom';
  import { serializeInlineStyleLayers } from './inline-style.engine';
  import { useDesignTokenContext } from './theme-context.svelte';
  import { connectTooltipDescription, connectTooltipOpenClass } from './tooltip.dom';
  import {
    getTooltipArrow,
    getTooltipPlacementConfig,
    hasTooltipContent,
    isTooltipCorner
  } from './tooltip.engine';
  import { connectPopup } from './popup.dom';
  import { createPopupContainer } from './popup-container.model.svelte.js';
  import type {
    AdjustOverflow,
    TooltipArrow,
    TooltipColor,
    TooltipContent,
    TooltipPlacement,
    TooltipProps,
    TooltipSemanticProps
  } from './tooltip.types';

  let {
    title,
    contentAvailable,
    color,
    prefixCls,
    openClassName,
    destroyOnHidden,
    destroyTooltipOnHide,
    fresh,
    open,
    anchor,
    describe,
    trigger,
    placement = 'top',
    align,
    builtinPlacements,
    onPopupAlign,
    arrow,
    autoAdjustOverflow = true,
    getPopupContainer,
    getTooltipContainer,
    semanticProps,
    ownerClassName,
    onDismiss,
    onHoverChange
  }: {
    title: TooltipContent;
    contentAvailable?: boolean;
    color?: TooltipColor;
    prefixCls?: string;
    openClassName?: string;
    destroyOnHidden?: boolean;
    destroyTooltipOnHide?: TooltipProps['destroyTooltipOnHide'];
    fresh?: boolean;
    open: boolean;
    anchor?: Element;
    describe?: Element;
    trigger?: Element;
    placement?: TooltipPlacement;
    align?: TooltipProps['align'];
    builtinPlacements?: TooltipProps['builtinPlacements'];
    onPopupAlign?: TooltipProps['onPopupAlign'];
    arrow?: TooltipArrow;
    autoAdjustOverflow?: boolean | AdjustOverflow;
    getPopupContainer?: (trigger: HTMLElement) => HTMLElement | ShadowRoot;
    getTooltipContainer?: (trigger: HTMLElement) => HTMLElement;
    semanticProps?: Omit<TooltipProps, 'children'>;
    ownerClassName?: string;
    onDismiss: () => void;
    onHoverChange?: (hovered: boolean) => void;
  } = $props();

  const config = useConfig();
  let prefix = $derived(prefixCls || 'ant-tooltip');
  let prefixCss = $derived(getOverlayPrefixCss('tooltip', prefix, prefixTemplate));
  let resolvedOpenClassName = $derived(openClassName || semanticProps?.openClassName || `${prefix}-open`);
  const componentTheme = useComponentTheme('Tooltip');
  const designTokens = useDesignTokenContext();
  const generatedId = $props.id();
  const id = `ant-tooltip-${generatedId}`;
  let popup = $state<HTMLSpanElement>();
  let realign: (() => void) | undefined;
  let actualPlacement = $state(untrack(() => placement));
  let actualPosition = $state.raw<TooltipPosition>();
  let resolvedAlign = $derived(align ?? semanticProps?.align);
  let configuredPlacements = $derived(builtinPlacements ?? semanticProps?.builtinPlacements);
  let alignCallback = $derived(onPopupAlign ?? semanticProps?.onPopupAlign);
  let customPosition = $derived(Boolean(resolvedAlign || configuredPlacements || alignCallback));
  let arrowConfig = $derived(getTooltipArrow(arrow, config.tooltip?.arrow));
  let sourcePlacement = $derived(Boolean(config.tooltip) || typeof arrow === 'object'
    || typeof autoAdjustOverflow === 'object' || customPosition);
  let destroy = $derived(destroyOnHidden ?? semanticProps?.destroyOnHidden
    ?? Boolean(destroyTooltipOnHide ?? semanticProps?.destroyTooltipOnHide));
  let localClassNames = $derived(ownerClassName
    ? { root: ownerClassName } : semanticProps?.classNames);
  let callbackProps = $derived.by<TooltipSemanticProps>(() => {
    const source = getTooltipPlacementConfig(arrowConfig, designTokens.state.token);
    const placements = getPopupPlacements(
      source.pointAtCenter ?? false,
      source.arrowWidth,
      source.offset,
      source.radius,
      autoAdjustOverflow
    );
    for (const align of Object.values(placements)) align.htmlRegion = 'visibleFirst';
    return {
      ...(semanticProps ?? { title, open, placement, arrow, color, prefixCls, openClassName,
        destroyOnHidden, destroyTooltipOnHide, align, builtinPlacements, onPopupAlign }),
      ...(ownerClassName ? { classNames: localClassNames } : {}),
      trigger: semanticProps?.trigger || config.tooltip?.trigger
        || (config.tooltip ? 'hover' : ['hover', 'focus']),
      mouseEnterDelay: semanticProps?.mouseEnterDelay ?? config.tooltip?.mouseEnterDelay ?? 0.1,
      mouseLeaveDelay: semanticProps?.mouseLeaveDelay ?? config.tooltip?.mouseLeaveDelay ?? 0.1,
      getPopupContainer: getPopupContainer || getTooltipContainer || config.getPopupContainer,
      destroyOnHidden: destroy,
      builtinPlacements: configuredPlacements || placements
    };
  });
  let classPlacement = $derived.by(() => {
    if (!customPosition) return open ? actualPlacement : placement;
    return actualPosition?.sourceAlign
      ? getPopupPlacement(callbackProps.builtinPlacements, actualPosition.sourceAlign) : undefined;
  });
  let arrowPositionStyle = $derived(customPosition && actualPosition ? getPopupArrowStyle({
    align: actualPosition.sourceAlign,
    arrowX: actualPosition.arrowX,
    arrowY: actualPosition.arrowY
  }) : '');
  let semantics = $derived(getOverlaySemantics(
    config.tooltip,
    localClassNames,
    semanticProps?.styles,
    callbackProps,
    semanticProps?.overlayStyle
  ));
  let colorInfo = $derived(getTooltipColor(color, prefix));
  let rootLayers = $derived([
    componentTheme.style, colorInfo.arrowStyle, semantics.styles.root
  ]);
  let rootStyle = $derived(serializeInlineStyleLayers(rootLayers));
  let containerLayers = $derived([
    semantics.styles.container, semanticProps?.overlayInnerStyle, colorInfo.overlayStyle
  ]);
  let refresh = $derived(fresh ?? semanticProps?.fresh ?? false);
  let payload = $derived({
    title,
    layers: containerLayers,
    classes: [`${prefix}-container`, semantics.classNames.container],
    customColor: colorInfo.overlayStyle.length > 0
  });
  let cached = $state.raw(untrack(() => ({ ...payload, title: captureContent(title) })));
  let rendered = $derived(open || refresh ? payload : cached);
  const initialContainerStyle = untrack(() => serializeInlineStyleLayers(rendered.layers));
  const initialStyle = untrack(() => rootStyle);
  const popupStyle = createOverlayStyle(() => rootLayers);
  let available = $derived(contentAvailable ?? hasTooltipContent(title));
  let mounted = $state(false);
  let renderContent = $derived(!destroy || mounted && open && available);
  const portal = createPopupContainer(() => ({
    open: open && available,
    reference: anchor,
    getPopupContainer: getPopupContainer || getTooltipContainer || config.getPopupContainer,
    themeStyle: rootStyle
  }));

  onMount(() => { mounted = true; });

  $effect.pre(() => {
    if (open || refresh) cached = { ...payload, title: captureContent(title) };
  });

  // Снимок массива не удерживает reactive proxy; внутреннее состояние Snippet остаётся Svelte-owned.
  function captureContent(value: TooltipContent): TooltipContent {
    return Array.isArray(value) ? value.map(captureContent) : value;
  }

  function containerStyle(node: HTMLElement) {
    const update = connectInlineStyle(node);
    $effect(() => update(rendered.layers));
  }

  export function getPopupElement() {
    return popup;
  }

  export function forceAlign() {
    untrack(() => {
      if (open && available) realign?.();
    });
  }

  $effect(() => {
    if (describe && available) return connectTooltipDescription(describe, id);
  });

  $effect(() => {
    if (anchor && open && available) return connectTooltipOpenClass(anchor, resolvedOpenClassName);
  });

  $effect(() => {
    const surface = popup;
    const reference = anchor;
    const source = trigger;

    if (!surface || !reference || !open || !available) return;

    const connection = untrack(() => connectPopup(surface, reference, {
      trigger: source,
      get placement() { return placement; },
      get autoAdjustOverflow() { return autoAdjustOverflow; },
      get sourcePlacement() {
        return sourcePlacement
          ? getTooltipPlacementConfig(arrowConfig, designTokens.state.token) : undefined;
      },
      get sourceAlign() { return customPosition ? resolvedAlign ?? {} : undefined; },
      get builtinPlacements() { return configuredPlacements; },
      get onAlign() {
        return customPosition ? (position: TooltipPosition) => {
          actualPosition = position;
          alignCallback?.(surface, position.sourceAlign ?? {});
        } : undefined;
      },
      onVisibilityChange: shown => {
        if (shown && customPosition) queueMicrotask(() => {
          if (open && available) realign?.();
        });
      },
      gap: () => untrack(() => designTokens.enabled || isTooltipCorner(placement) || sourcePlacement
        ? (arrowConfig.show ? designTokens.state.token.sizePopupArrow / 2 : 0)
          + designTokens.state.token.marginXXS : undefined),
      onDismiss: () => onDismiss(),
      applyPosition: popupStyle.position,
      onPlacement: (next) => {
        actualPlacement = next;
      }
    }));
    realign = connection.forceAlign;

    return () => {
      realign = undefined;
      connection();
    };
  });
</script>

<style>
  [data-ant-tooltip] { position: fixed; inset: auto; margin: 0; padding: 0; border: 0; background: transparent; overflow: visible; }
  [data-ant-tooltip][hidden], [data-ant-tooltip]:not(:popover-open) { display: none; }
  [data-ant-tooltip-container] { display: block; max-height: calc(100dvh - 16px); overflow: auto; overflow-wrap: anywhere; }
  [data-ant-placement="top"] > [data-ant-tooltip-arrow], [data-ant-placement="bottom"] > [data-ant-tooltip-arrow] { left: var(--arrow-x, 50%); }
  [data-ant-placement="left"] > [data-ant-tooltip-arrow], [data-ant-placement="right"] > [data-ant-tooltip-arrow] { top: var(--arrow-y, 50%); }
  /* Без getter source portal изолирует private contrast родительского popup. */
  :global([data-ant-overlay-color]) [data-ant-tooltip][data-ant-tooltip-inline] { --ant-tooltip-overlay-color: initial; }
  @media (prefers-reduced-motion: reduce) { [data-ant-tooltip], [data-ant-tooltip-container] { animation: none; transition: none; } }
</style>

{#if prefixCss}<ThemeScopeStyle css={prefixCss} scope={`tooltip-prefix:${prefix}`} />{/if}<span bind:this={popup} {id} role="tooltip" popover="manual" hidden dir={config.direction}
  data-ant-tooltip="" data-ant-placement={classPlacement}
  data-ant-tooltip-inline={!callbackProps.getPopupContainer || undefined} class={[
    prefix,
    'ant-tooltip-css-var',
    componentTheme.className,
    colorInfo.className,
    classPlacement && `${prefix}-placement-${classPlacement}`,
    config.direction === 'rtl' && `${prefix}-rtl`,
    semanticProps?.overlayClassName, semanticProps?.rootClassName,
    config.tooltip?.class, semantics.classNames.root
  ]} style={initialStyle}
  {@attach popupStyle.attach} {@attach portal}
  onpointerenter={(event) => {
      if (event.pointerType !== 'touch')
        onHoverChange?.(true);
    }} onpointerleave={() => onHoverChange?.(false)}>
  {#if arrowConfig.show}<span data-ant-tooltip-arrow="" class={[`${prefix}-arrow`, semantics.classNames.arrow]}
    style={arrowPositionStyle
      ? `${arrowPositionStyle};${semantics.styles.arrow ?? ''}` : semantics.styles.arrow}
    aria-hidden="true"></span>{/if}
  <span data-ant-tooltip-container="" class={rendered.classes}
    data-ant-overlay-color={rendered.customColor || undefined}
    style={initialContainerStyle} {@attach containerStyle}
    tabindex="-1">{#if renderContent}<RenderContent value={rendered.title} />{/if}</span>
</span>
