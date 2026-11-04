<script lang="ts">
  import type { Snippet } from 'svelte';
  import { onMount, untrack } from 'svelte';
  import { useConfig } from './config-context';
  import { useComponentTheme } from './theme-component.svelte';
  import { getOverlaySemantics } from './overlay-semantic.engine';
  import { createOverlayStyle } from './overlay-style.model.svelte';
  import { getPopupPlacements } from './popup-position.engine';
  import { getTooltipColor } from './tooltip-color.engine';
  import { getOverlayPrefixCss } from './overlay-prefix.engine';
  import prefixTemplate from './vendor/tooltip-prefix.css.js';
  import ThemeScopeStyle from './ThemeScopeStyle.svelte';
  import { connectInlineStyle } from './inline-style.dom';
  import { serializeInlineStyleLayers } from './inline-style.engine';
  import { useDesignTokenContext } from './theme-context.svelte';
  import { connectTooltipDescription, connectTooltipOpenClass } from './tooltip.dom';
  import { getTooltipArrow, getTooltipPlacementConfig, isTooltipCorner } from './tooltip.engine';
  import { connectPopup } from './popup.dom';
  import { createPopupContainer } from './popup-container.model.svelte.js';
  import type {
    AdjustOverflow,
    TooltipArrow,
    TooltipColor,
    TooltipPlacement,
    TooltipProps,
    TooltipSemanticProps
  } from './tooltip.types';

  let {
    title,
    color,
    prefixCls,
    openClassName,
    destroyOnHidden,
    destroyTooltipOnHide,
    open,
    anchor,
    describe,
    trigger,
    placement = 'top',
    arrow,
    autoAdjustOverflow = true,
    getPopupContainer,
    getTooltipContainer,
    semanticProps,
    onDismiss,
    onHoverChange
  }: {
    title: string | Snippet;
    color?: TooltipColor;
    prefixCls?: string;
    openClassName?: string;
    destroyOnHidden?: boolean;
    destroyTooltipOnHide?: TooltipProps['destroyTooltipOnHide'];
    open: boolean;
    anchor?: Element;
    describe?: Element;
    trigger?: Element;
    placement?: TooltipPlacement;
    arrow?: TooltipArrow;
    autoAdjustOverflow?: boolean | AdjustOverflow;
    getPopupContainer?: (trigger: HTMLElement) => HTMLElement | ShadowRoot;
    getTooltipContainer?: (trigger: HTMLElement) => HTMLElement;
    semanticProps?: Omit<TooltipProps, 'children'>;
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
  let actualPlacement = $state(untrack(() => placement));
  let arrowConfig = $derived(getTooltipArrow(arrow, config.tooltip?.arrow));
  let sourcePlacement = $derived(Boolean(config.tooltip) || typeof arrow === 'object'
    || typeof autoAdjustOverflow === 'object');
  let destroy = $derived(destroyOnHidden ?? semanticProps?.destroyOnHidden
    ?? Boolean(destroyTooltipOnHide ?? semanticProps?.destroyTooltipOnHide));
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
        destroyOnHidden, destroyTooltipOnHide }),
      trigger: semanticProps?.trigger || config.tooltip?.trigger
        || (config.tooltip ? 'hover' : ['hover', 'focus']),
      mouseEnterDelay: semanticProps?.mouseEnterDelay ?? config.tooltip?.mouseEnterDelay ?? 0.1,
      mouseLeaveDelay: semanticProps?.mouseLeaveDelay ?? config.tooltip?.mouseLeaveDelay ?? 0.1,
      getPopupContainer: getPopupContainer || getTooltipContainer || config.getPopupContainer,
      destroyOnHidden: destroy,
      builtinPlacements: placements
    };
  });
  let semantics = $derived(getOverlaySemantics(
    config.tooltip,
    semanticProps?.classNames,
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
  const initialContainerStyle = untrack(() => serializeInlineStyleLayers(containerLayers));
  const initialStyle = untrack(() => rootStyle);
  const popupStyle = createOverlayStyle(() => rootLayers);
  let available = $derived(typeof title === 'function' || Boolean(title.trim()));
  let mounted = $state(false);
  let renderContent = $derived(!destroy || mounted && open && available);
  const portal = createPopupContainer(() => ({
    open: open && available,
    reference: anchor,
    getPopupContainer: getPopupContainer || getTooltipContainer || config.getPopupContainer,
    themeStyle: rootStyle
  }));

  onMount(() => { mounted = true; });

  function containerStyle(node: HTMLElement) {
    const update = connectInlineStyle(node);
    $effect(() => update(containerLayers));
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

    return untrack(() => connectPopup(surface, reference, {
      trigger: source,
      get placement() { return placement; },
      get autoAdjustOverflow() { return autoAdjustOverflow; },
      get sourcePlacement() {
        return sourcePlacement
          ? getTooltipPlacementConfig(arrowConfig, designTokens.state.token) : undefined;
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
  data-ant-tooltip="" data-ant-placement={open ? actualPlacement : placement}
  data-ant-tooltip-inline={!callbackProps.getPopupContainer || undefined} class={[
    prefix,
    'ant-tooltip-css-var',
    componentTheme.className,
    colorInfo.className,
    `${prefix}-placement-${open ? actualPlacement : placement}`,
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
    style={semantics.styles.arrow} aria-hidden="true"></span>{/if}
  <span data-ant-tooltip-container="" class={[`${prefix}-container`, semantics.classNames.container]}
    data-ant-overlay-color={colorInfo.overlayStyle.length > 0 || undefined}
    style={initialContainerStyle} {@attach containerStyle}
    tabindex="-1">{#if renderContent}{#if typeof title === 'function'}{@render title()}{:else}{title}{/if}{/if}</span>
</span>
