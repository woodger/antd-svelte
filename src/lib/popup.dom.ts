import {
  getTooltipPosition,
  type TooltipPosition,
  type TooltipRect,
  type TooltipSourcePlacement
} from './tooltip.engine';
import type { PopupFlipCache, PopupSourceAlign } from './popup-position.engine';
import type { AdjustOverflow, TooltipPlacement } from './tooltip.types';

const openPopups = new WeakMap<Document, HTMLElement[]>();

/** Cleanup остаётся вызываемой функцией; forceAlign использует тот же контроллер позиции. */
export interface PopupConnection {
  (): void;
  forceAlign: () => void;
}

export function getPopupActiveElement(element: Element) {
  const root = element.getRootNode() as Document | ShadowRoot;
  return root.activeElement ?? element.ownerDocument.activeElement;
}

export function connectPopup(popup: HTMLElement, anchor: Element, options: {
  trigger?: Element;
  placement: TooltipPlacement;
  autoAdjustOverflow: boolean | AdjustOverflow;
  sourcePlacement?: TooltipSourcePlacement;
  sourceAlign?: PopupSourceAlign;
  builtinPlacements?: Readonly<Record<string, PopupSourceAlign>>;
  onAlign?: (position: TooltipPosition) => void;
  onPlacement: (placement: TooltipPlacement) => void;
  onDismiss: (reason: 'escape' | 'outside') => void;
  outsideEvents?: 'pointer' | 'mouse';
  onKeydown?: (event: KeyboardEvent) => void;
  preserveFocus?: boolean;
  maxWidth?: string | false;
  align?: 'left' | 'right' | 'top' | 'bottom';
  matchAnchorWidth?: boolean;
  anchorWidthVariable?: string;
  gap?: number | (() => number | undefined);
  allowZeroSize?: boolean | (() => boolean);
  allowOffscreenAnchor?: boolean;
  getPosition?: (anchor: DOMRect, popup: DOMRect, viewport: TooltipRect) => TooltipPosition;
  applyPosition?: (position: TooltipPosition) => void;
  onVisibilityChange?: (visible: boolean) => void;
}): PopupConnection {
  const document = anchor.ownerDocument;
  const view = document.defaultView!;
  let frame = 0;
  let shown = false;
  let disposed = false;
  let alignRequest = 0;
  let lastPosition = '';
  let lastAlignment = '';
  let flips: PopupFlipCache | undefined;

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

  function update(manual = false) {
    if (disposed) return;

    const rect = anchor.getBoundingClientRect();
    const visual = view.visualViewport;
    const viewport = {
      x: visual?.offsetLeft ?? 0,
      y: visual?.offsetTop ?? 0,
      width: visual?.width ?? view.innerWidth,
      height: visual?.height ?? view.innerHeight
    };
    const modal = getPopupActiveElement(popup)?.closest('dialog:modal')
      ?? document.querySelector('dialog:modal');
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
      && (!modal || modal.contains(anchor) || popup.contains(modal));

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
    const { matchAnchorWidth, anchorWidthVariable } = options;
    if (matchAnchorWidth || anchorWidthVariable) {
      const width = `${Math.min(rect.width, Math.max(0, viewport.width - 16))}px`;
      if (matchAnchorWidth) popup.style.minWidth = width;
      if (anchorWidthVariable && popup.style.getPropertyValue(anchorWidthVariable) !== width)
        popup.style.setProperty(anchorWidthVariable, width);
    }
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
      typeof options.gap === 'function' ? options.gap() : options.gap,
      {
        flips,
        source: options.sourcePlacement,
        align: options.sourceAlign,
        builtinPlacements: options.builtinPlacements,
        scrollRegion: {
          x: -document.documentElement.scrollLeft,
          y: -document.documentElement.scrollTop,
          width: Math.max(document.documentElement.scrollWidth, bounds.width),
          height: Math.max(document.documentElement.scrollHeight, bounds.height)
        }
      }
    );
    flips = position.flips;
    if (disposed) return;
    const signature = `${position
      .left}:${position
        .top}:${position
          .arrowX}:${position
            .arrowY}:${position
              .placement}:${JSON.stringify(position.sourceAlign)}:${position.alignedPlacement}`;

    const onAlign = options.onAlign;
    if (onAlign) {
      const geometry = `${signature}:${rect.x}:${rect.y}:${rect.width}:${rect.height}:${bounds.width}:${bounds.height}`;
      if (manual || geometry !== lastAlignment) {
        onAlign(position);
        lastAlignment = geometry;
      }
    }
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

  function forceAlign() {
    const request = ++alignRequest;
    Promise.resolve().then(() => {
      if (request === alignRequest) update(true);
    });
  }

  function handleKeydown(event: KeyboardEvent) {
    const dialog = getPopupActiveElement(popup)?.closest('dialog[open]');
    // Вложенный native dialog получает свои keys раньше содержащего его popup.
    if (dialog && popup.contains(dialog) && !dialog.contains(anchor)) return;

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

  function handleOutside(event: MouseEvent | PointerEvent) {
    const target = event.composedPath()[0] ?? event.target;
    const popupRoot = popup.getRootNode();
    const trigger = options.trigger ?? anchor;
    const triggerRoot = trigger.getRootNode();

    if (shown
      && !popup.inert
      && !anchor.closest('[inert]')
      && target instanceof Node
      && !popup.contains(target)
      && !('host' in popupRoot && popupRoot.host === target)
      && !trigger.contains(target)
      && !('host' in triggerRoot && triggerRoot.host === target))
      options.onDismiss('outside');
  }

  function handlePointerdown(event: PointerEvent) {
    if (options.outsideEvents !== 'mouse') handleOutside(event);
  }

  function handleMousedown(event: MouseEvent) {
    if (options.outsideEvents === 'mouse') handleOutside(event);
  }

  function preserveFocus(event: PointerEvent) {
    event.preventDefault();
  }

  // Пока поверхность открыта, отслеживаем и перемещение anchor без resize (включая бегунок).
  tick();
  document.addEventListener('keydown', handleKeydown);
  document.addEventListener('pointerdown', handlePointerdown, true);
  view.addEventListener('mousedown', handleMousedown, true);
  view.addEventListener('contextmenu', handleMousedown, true);
  if (options.preserveFocus !== false)
    popup.addEventListener('pointerdown', preserveFocus);

  return Object.assign(() => {
    disposed = true;
    view.cancelAnimationFrame(frame);
    document.removeEventListener('keydown', handleKeydown);
    document.removeEventListener('pointerdown', handlePointerdown, true);
    view.removeEventListener('mousedown', handleMousedown, true);
    view.removeEventListener('contextmenu', handleMousedown, true);
    popup.removeEventListener('pointerdown', preserveFocus);
    hide();
  }, { forceAlign });
}
