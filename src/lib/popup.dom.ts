import { getTooltipPosition, type TooltipPosition, type TooltipRect } from './tooltip.engine';
import type { TooltipPlacement } from './tooltip.types';

const openPopups = new WeakMap<Document, HTMLElement[]>();

export function connectPopup(popup: HTMLElement, anchor: Element, options: {
  trigger?: Element;
  placement: TooltipPlacement;
  autoAdjustOverflow: boolean;
  onPlacement: (placement: TooltipPlacement) => void;
  onDismiss: (reason: 'escape' | 'outside') => void;
  onKeydown?: (event: KeyboardEvent) => void;
  preserveFocus?: boolean;
  maxWidth?: string | false;
  align?: 'left' | 'right' | 'top' | 'bottom';
  matchAnchorWidth?: boolean;
  gap?: number | (() => number | undefined);
  allowZeroSize?: boolean | (() => boolean);
  allowOffscreenAnchor?: boolean;
  getPosition?: (anchor: DOMRect, popup: DOMRect, viewport: TooltipRect) => TooltipPosition;
  applyPosition?: (position: TooltipPosition) => void;
  onVisibilityChange?: (visible: boolean) => void;
}): () => void {
  const document = anchor.ownerDocument;
  const view = document.defaultView!;
  let frame = 0;
  let shown = false;
  let disposed = false;
  let lastPosition = '';

  function hide() {
    const stack = openPopups.get(document);
    const index = stack?.indexOf(popup) ?? -1;

    if (index !== -1)
      stack!.splice(index, 1);
    if (shown)
      options.onVisibilityChange?.(false);
    if (popup.matches(':popover-open'))
      popup.hidePopover();
    popup.hidden = true;
    shown = false;
  }

  function update() {
    if (disposed) return;

    const rect = anchor.getBoundingClientRect();
    const visual = view.visualViewport;
    const viewport = {
      x: visual?.offsetLeft ?? 0,
      y: visual?.offsetTop ?? 0,
      width: visual?.width ?? view.innerWidth,
      height: visual?.height ?? view.innerHeight
    };
    const modal = document.querySelector('dialog:modal');
    const zeroAllowed = typeof options.allowZeroSize === 'function'
      ? options.allowZeroSize() : options.allowZeroSize;
    const horizontalVisible = zeroAllowed && rect.width === 0
      ? rect.left >= viewport.x && rect.left <= viewport.x + viewport.width
      : rect.right > viewport.x && rect.left < viewport.x + viewport.width;
    const verticalVisible = zeroAllowed && rect.height === 0
      ? rect.top >= viewport.y && rect.top <= viewport.y + viewport.height
      : rect.bottom > viewport.y && rect.top < viewport.y + viewport.height;
    const visible = anchor.isConnected
      && !anchor.closest('[inert]')
      && anchor.getClientRects().length
      && (zeroAllowed || rect.width && rect.height)
      && (options.allowOffscreenAnchor || horizontalVisible && verticalVisible)
      && (!modal || modal.contains(anchor));

    if (!visible) {
      hide();
      return;
    }

    if (options.maxWidth !== false) {
      popup.style.maxWidth = `min(${options.maxWidth
        ?? 'var(--ant-tooltip-max-width)'}, ${Math.max(
          0,
          viewport.width - 16
        )}px)`;
    }
    if (options.matchAnchorWidth)
      popup.style.minWidth = `${Math.min(rect.width, Math.max(0, viewport.width - 16))}px`;
    popup.hidden = false;

    if (!popup.matches(':popover-open')) {
      popup.showPopover();
      const stack = openPopups.get(document) ?? [];

      stack.push(popup);
      openPopups.set(document, stack);
    }

    const bounds = popup.getBoundingClientRect();
    const position = options.getPosition?.(rect, bounds, viewport) ?? getTooltipPosition(
      rect,
      bounds,
      viewport,
      options.placement,
      options.autoAdjustOverflow,
      options.align,
      typeof options.gap === 'function' ? options.gap() : options.gap
    );
    if (disposed) return;
    const signature = `${position
      .left}:${position
        .top}:${position
          .arrowX}:${position
            .arrowY}:${position
              .placement}`;

    options.applyPosition?.(position);
    if (signature !== lastPosition) {
      if (!options.applyPosition) {
        popup.style.left = `${position.left}px`;
        popup.style.top = `${position.top}px`;
        popup.style.setProperty('--arrow-x', `${position.arrowX}px`);
        popup.style.setProperty('--arrow-y', `${position.arrowY}px`);
      }
      options.onPlacement(position.placement);
      lastPosition = signature;
    }
    const wasShown = shown;
    shown = true;
    if (!wasShown)
      options.onVisibilityChange?.(true);
  }

  function tick() {
    update();
    if (!disposed)
      frame = view.requestAnimationFrame(tick);
  }

  function handleKeydown(event: KeyboardEvent) {
    const current = shown && !anchor.closest('[inert]')
      && openPopups.get(document)?.findLast(element => !element.inert) === popup;
    if (current && !event.defaultPrevented && event.key !== 'Escape')
      options.onKeydown?.(event);
    if (shown
      && !anchor.closest('[inert]')
      && openPopups.get(document)?.findLast(element => !element.inert) === popup
      && event.key === 'Escape'
      && !event.defaultPrevented) {
      event.preventDefault();
      event.stopPropagation();
      options.onDismiss('escape');
    }
  }

  function handlePointerdown(event: PointerEvent) {
    const target = event.target;

    if (shown
      && !popup.inert
      && !anchor.closest('[inert]')
      && target instanceof Node
      && !popup.contains(target)
      && !(options.trigger ?? anchor).contains(
        target
      ))
      options.onDismiss('outside');
  }

  function preserveFocus(event: PointerEvent) {
    event.preventDefault();
  }

  // Пока поверхность открыта, отслеживаем и перемещение anchor без resize (включая бегунок).
  tick();
  document.addEventListener('keydown', handleKeydown);
  document.addEventListener('pointerdown', handlePointerdown, true);
  if (options.preserveFocus !== false)
    popup.addEventListener('pointerdown', preserveFocus);

  return () => {
    disposed = true;
    view.cancelAnimationFrame(frame);
    document.removeEventListener('keydown', handleKeydown);
    document.removeEventListener('pointerdown', handlePointerdown, true);
    popup.removeEventListener('pointerdown', preserveFocus);
    hide();
  };
}
