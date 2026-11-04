<script lang="ts">
  import type { Snippet } from 'svelte';
  import { untrack } from 'svelte';
  import { useConfig } from './config-context';
  import { useComponentTheme } from './theme-component.svelte';
  import { getOverlaySemantics } from './overlay-semantic.engine';
  import { createOverlayStyle } from './overlay-style.model.svelte';
  import { getPopupPlacements } from './popup-position.engine';
  import { useDesignTokenContext } from './theme-context.svelte';
  import { connectTooltipDescription } from './tooltip.dom';
  import { getTooltipArrow, getTooltipPlacementConfig, isTooltipCorner } from './tooltip.engine';
  import { connectPopup } from './popup.dom';
  import { createPopupContainer } from './popup-container.model.svelte.js';
  import type {
    AdjustOverflow,
    TooltipArrow,
    TooltipPlacement,
    TooltipProps,
    TooltipSemanticProps
  } from './tooltip.types';

  let {
    title,
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
  const componentTheme = useComponentTheme('Tooltip');
  const designTokens = useDesignTokenContext();
  const generatedId = $props.id();
  const id = `ant-tooltip-${generatedId}`;
  let popup = $state<HTMLSpanElement>();
  let actualPlacement = $state(untrack(() => placement));
  let arrowConfig = $derived(getTooltipArrow(arrow, config.tooltip?.arrow));
  let sourcePlacement = $derived(Boolean(config.tooltip) || typeof arrow === 'object'
    || typeof autoAdjustOverflow === 'object');
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
      ...(semanticProps ?? { title, open, placement, arrow }),
      trigger: semanticProps?.trigger || config.tooltip?.trigger
        || (config.tooltip ? 'hover' : ['hover', 'focus']),
      mouseEnterDelay: semanticProps?.mouseEnterDelay ?? config.tooltip?.mouseEnterDelay ?? 0.1,
      mouseLeaveDelay: semanticProps?.mouseLeaveDelay ?? config.tooltip?.mouseLeaveDelay ?? 0.1,
      getPopupContainer: getPopupContainer || getTooltipContainer || config.getPopupContainer,
      destroyOnHidden: false,
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
  let rootStyle = $derived([componentTheme.style, semantics.styles.root].filter(Boolean).join(';')
    || undefined);
  const initialStyle = untrack(() => rootStyle);
  const popupStyle = createOverlayStyle(() => rootStyle);
  let available = $derived(typeof title === 'function' || Boolean(title.trim()));
  const portal = createPopupContainer(() => ({
    open: open && available,
    reference: anchor,
    getPopupContainer: getPopupContainer || getTooltipContainer || config.getPopupContainer,
    themeStyle: rootStyle
  }));

  $effect(() => {
    if (describe && available) return connectTooltipDescription(describe, id);
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
  .ant-tooltip { position: fixed; inset: auto; margin: 0; padding: 0; border: 0; background: transparent; overflow: visible; }
  .ant-tooltip[hidden], .ant-tooltip:not(:popover-open) { display: none; }
  .ant-tooltip-container { display: block; max-height: calc(100dvh - 16px); overflow: auto; overflow-wrap: anywhere; }
  .ant-tooltip-placement-top > .ant-tooltip-arrow, .ant-tooltip-placement-bottom > .ant-tooltip-arrow { left: var(--arrow-x, 50%); }
  .ant-tooltip-placement-left > .ant-tooltip-arrow, .ant-tooltip-placement-right > .ant-tooltip-arrow { top: var(--arrow-y, 50%); }
  @media (prefers-reduced-motion: reduce) { .ant-tooltip, .ant-tooltip-container { animation: none; transition: none; } }
</style>

<span bind:this={popup} {id} role="tooltip" popover="manual" hidden dir={config.direction} class={[
    'ant-tooltip',
    'ant-tooltip-css-var',
    componentTheme.className,
    `ant-tooltip-placement-${open ? actualPlacement : placement}`,
    config.direction === 'rtl' && 'ant-tooltip-rtl',
    semanticProps?.overlayClassName, semanticProps?.rootClassName,
    config.tooltip?.class, semantics.classNames.root
  ]} style={initialStyle}
  {@attach popupStyle.attach} {@attach portal}
  onpointerenter={(event) => {
      if (event.pointerType !== 'touch')
        onHoverChange?.(true);
    }} onpointerleave={() => onHoverChange?.(false)}>
  {#if arrowConfig.show}<span class={['ant-tooltip-arrow', semantics.classNames.arrow]}
    style={semantics.styles.arrow} aria-hidden="true"></span>{/if}
  <span class={['ant-tooltip-container', semantics.classNames.container]}
    style={[semantics.styles.container, semanticProps?.overlayInnerStyle].filter(Boolean).join(';') || undefined}
    tabindex="-1">{#if typeof title === 'function'}{@render title()}{:else}{title}{/if}</span>
</span>
