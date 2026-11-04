<script lang="ts">
  import type { Snippet } from 'svelte';
  import { untrack } from 'svelte';
  import { useConfig } from './config-context';
  import { useComponentTheme } from './theme-component.svelte';
  import { connectComponentTheme } from './theme-component.dom';
  import { useDesignTokenContext } from './theme-context.svelte';
  import { connectTooltipDescription } from './tooltip.dom';
  import { isTooltipCorner } from './tooltip.engine';
  import { connectPopup } from './popup.dom';
  import { createPopupContainer } from './popup-container.model.svelte.js';
  import type { TooltipPlacement } from './tooltip.types';

  let {
    title,
    open,
    anchor,
    describe,
    trigger,
    placement = 'top',
    arrow = true,
    autoAdjustOverflow = true,
    getPopupContainer,
    getTooltipContainer,
    onDismiss,
    onHoverChange
  }: {
    title: string | Snippet;
    open: boolean;
    anchor?: Element;
    describe?: Element;
    trigger?: Element;
    placement?: TooltipPlacement;
    arrow?: boolean;
    autoAdjustOverflow?: boolean;
    getPopupContainer?: (trigger: HTMLElement) => HTMLElement | ShadowRoot;
    getTooltipContainer?: (trigger: HTMLElement) => HTMLElement;
    onDismiss: () => void;
    onHoverChange?: (hovered: boolean) => void;
  } = $props();

  const config = useConfig();
  const componentTheme = useComponentTheme('Tooltip');
  const designTokens = useDesignTokenContext();
  const initialThemeStyle = untrack(() => componentTheme.style);
  const generatedId = $props.id();
  const id = `ant-tooltip-${generatedId}`;
  let popup = $state<HTMLSpanElement>();
  let actualPlacement = $state(untrack(() => placement));
  let available = $derived(typeof title === 'function' || Boolean(title.trim()));
  const portal = createPopupContainer(() => ({
    open: open && available,
    reference: anchor,
    getPopupContainer: getPopupContainer || getTooltipContainer || config.getPopupContainer,
    themeStyle: componentTheme.style
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
      gap: () => untrack(() => designTokens.enabled || isTooltipCorner(placement)
        ? (arrow ? designTokens.state.token.sizePopupArrow / 2 : 0)
          + designTokens.state.token.marginXXS : undefined),
      onDismiss: () => onDismiss(),
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
    config.direction === 'rtl' && 'ant-tooltip-rtl'
  ]} style={initialThemeStyle}
  {@attach node => connectComponentTheme(node, componentTheme.style)} {@attach portal}
  onpointerenter={(event) => {
      if (event.pointerType !== 'touch')
        onHoverChange?.(true);
    }} onpointerleave={() => onHoverChange?.(false)}>
  {#if arrow}<span class="ant-tooltip-arrow" aria-hidden="true"></span>{/if}
  <span class="ant-tooltip-container" tabindex="-1">{#if typeof title === 'function'}{@render title()}{:else}{title}{/if}</span>
</span>
