<script lang="ts">
  import { untrack } from 'svelte';
  import NoCompactStyle from './NoCompactStyle.svelte';
  import TooltipPopup from './TooltipPopup.svelte';
  import TypographyContent from './TypographyContent.svelte';
  import type { TypographyContent as Content } from './typography.types';
  import type { TooltipProps, TooltipTrigger } from './tooltip.types';

  let { target, title, enabled = true, options = {} }: {
    target?: HTMLElement;
    title?: Content;
    enabled?: boolean;
    options?: Omit<TooltipProps, 'children' | 'title'>;
  } = $props();

  let open = $state(untrack(() => options.defaultOpen ?? false));
  let available = $derived(Boolean(title) || title === 0);
  let visible = $derived(enabled && available && (options.open ?? open));
  let mounted = $state(false);

  $effect(() => {
    if (visible) mounted = true;
  });

  $effect(() => {
    const element = target;
    if (!element) return;
    return untrack(() => connect(element));
  });

  let dismiss = () => {};

  function connect(element: HTMLElement) {
    let hovered = false;
    let focused = false;
    let popupHovered = false;
    let dismissed = false;
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;

    function supports(trigger: TooltipTrigger) {
      const configured = options.trigger ?? 'hover';
      return typeof configured === 'string' ? configured === trigger : configured.includes(trigger);
    }

    function wanted() {
      return !dismissed && (hovered && supports('hover') || focused && supports('focus') || popupHovered);
    }

    function request(next: boolean, delay = 0) {
      clearTimeout(timer);
      const owner = options.open;
      const apply = () => {
        if (!active || !enabled || !available || !element.isConnected || target !== element
          || !Object.is(owner, options.open) || next && !wanted() || next === (options.open ?? open)) return;
        open = next;
        options.onOpenChange?.(next);
      };
      if (delay) timer = setTimeout(apply, Math.max(0, delay) * 1000);
      else apply();
    }

    function handleEnter(event: PointerEvent) {
      if (event.pointerType === 'touch') return;
      hovered = true;
      dismissed = false;
      if (supports('hover')) request(true, options.mouseEnterDelay ?? 0.1);
    }

    function handleLeave() {
      hovered = false;
      if (!wanted()) request(false, options.mouseLeaveDelay ?? 0.1);
    }

    function handleFocus() {
      focused = true;
      dismissed = false;
      if (supports('focus')) request(true);
    }

    function handleBlur(event: FocusEvent) {
      const Node = element.ownerDocument.defaultView?.Node;
      if (Node && event.relatedTarget instanceof Node && element.contains(event.relatedTarget)) return;
      focused = false;
      if (!wanted()) request(false);
    }

    dismiss = () => {
      dismissed = true;
      request(false);
    };
    hoverPopup = value => {
      popupHovered = value;
      if (value) clearTimeout(timer);
      else if (!wanted()) request(false, options.mouseLeaveDelay ?? 0.1);
    };
    element.addEventListener('pointerenter', handleEnter);
    element.addEventListener('pointerleave', handleLeave);
    element.addEventListener('focusin', handleFocus);
    element.addEventListener('focusout', handleBlur);
    return () => {
      active = false;
      clearTimeout(timer);
      element.removeEventListener('pointerenter', handleEnter);
      element.removeEventListener('pointerleave', handleLeave);
      element.removeEventListener('focusin', handleFocus);
      element.removeEventListener('focusout', handleBlur);
    };
  }
  let hoverPopup: (value: boolean) => void = () => {};
</script>

{#snippet content()}<TypographyContent value={title} />{/snippet}
{#if mounted}
  <NoCompactStyle>
    <TooltipPopup title={content} open={visible} anchor={target} describe={target} trigger={target}
      placement={options.placement} arrow={options.arrow} autoAdjustOverflow={options.autoAdjustOverflow}
      getPopupContainer={options.getPopupContainer} getTooltipContainer={options.getTooltipContainer}
      onDismiss={() => dismiss()} onHoverChange={value => hoverPopup(value)} />
  </NoCompactStyle>
{/if}
