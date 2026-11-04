import { getPopupPlacements, getPopupPosition, type PopupFlipCache } from './popup-position.engine';
import type { TooltipPlacement } from './tooltip.types';

export interface TooltipRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TooltipPosition {
  left: number;
  top: number;
  arrowX: number;
  arrowY: number;
  placement: TooltipPlacement;
  /** История rc-trigger flips для следующего расчёта в том же открытии. */
  flips?: PopupFlipCache;
}

interface TooltipPositionContext {
  flips?: Readonly<PopupFlipCache>;
  scrollRegion?: TooltipRect;
}

type TooltipCornerPlacement = Exclude<TooltipPlacement, 'top' | 'bottom' | 'left' | 'right'>;

export function isTooltipCorner(placement: TooltipPlacement): placement is TooltipCornerPlacement {
  return placement.length > 6;
}

function getCornerPosition(
  anchor: TooltipRect,
  popup: { width: number; height: number },
  viewport: TooltipRect,
  placement: TooltipCornerPlacement,
  autoAdjustOverflow: boolean,
  gap: number,
  context: TooltipPositionContext = {}
): TooltipPosition {
  // Для corners без pointAtCenter важна сумма half-arrow + offset.
  const placements = getPopupPlacements(false, 0, gap, 6, autoAdjustOverflow);
  const right = viewport.x + viewport.width;
  const bottom = viewport.y + viewport.height;
  // Измерение useAlign в (0, 0) расширяет scroll region до размеров popup.
  const region = context.scrollRegion ?? {
    ...viewport,
    width: Math.max(viewport.width, popup.width),
    height: Math.max(viewport.height, popup.height)
  };
  const result = getPopupPosition({
    target: { left: anchor.x, top: anchor.y, width: anchor.width, height: anchor.height },
    popup: { left: 0, top: 0, width: popup.width, height: popup.height },
    mirror: { right, bottom },
    visible: { left: viewport.x, top: viewport.y, right, bottom },
    scroll: {
      left: region.x,
      top: region.y,
      right: region.x + region.width,
      bottom: region.y + region.height
    },
    placements,
    align: { ...placements[placement], htmlRegion: 'visibleFirst' },
    scaleX: 1,
    scaleY: 1,
    flips: context.flips
  });
  const point = result.align.points[0];

  return {
    left: point[1] === 'r' ? right - result.right - popup.width : result.x,
    top: point[0] === 'b' ? bottom - result.bottom - popup.height : result.y,
    placement: result.placement as TooltipPlacement,
    arrowX: result.arrowX,
    arrowY: result.arrowY,
    flips: result.flips
  };
}

export function getTooltipDelay(seconds: number | undefined, fallback = 0.1): number {
  return Math.min(
    2_147_483_647,
    Math.max(0, typeof seconds === 'number' && Number.isFinite(seconds) ? seconds : fallback) * 1000
  );
}

export function getTooltipPosition(
  anchor: TooltipRect,
  popup: { width: number; height: number; },
  viewport: TooltipRect,
  placement: TooltipPlacement,
  autoAdjustOverflow = true,
  align?: 'left' | 'right' | 'top' | 'bottom',
  gap = 8,
  context?: TooltipPositionContext
): TooltipPosition {
  if (isTooltipCorner(placement)) {
    return getCornerPosition(anchor, popup, viewport, placement, autoAdjustOverflow, gap, context);
  }

  const padding = 8;
  const opposite = {
    top: 'bottom',
    bottom: 'top',
    left: 'right',
    right: 'left'
  } as const;
  const space = {
    top: anchor.y - viewport.y - gap - padding,
    bottom: viewport.y + viewport.height - anchor.y - anchor.height - gap - padding,
    left: anchor.x - viewport.x - gap - padding,
    right: viewport.x + viewport.width - anchor.x - anchor.width - gap - padding
  };
  const required = placement === 'top' || placement === 'bottom' ? popup.height : popup.width;

  if (autoAdjustOverflow
    && space[placement] < required
    && space[opposite[placement]] > space[placement])
    placement = opposite[placement];

  const centerX = anchor.x + anchor.width / 2;
  const centerY = anchor.y + anchor.height / 2;
  let left = placement === 'left'
    ? anchor.x - popup.width - gap
    : placement === 'right' ? anchor.x + anchor.width + gap : centerX - popup.width / 2;
  let top = placement === 'top'
    ? anchor.y - popup.height - gap
    : placement === 'bottom' ? anchor.y + anchor.height + gap : centerY - popup.height / 2;

  if ((placement === 'top' || placement === 'bottom') && (align === 'left' || align === 'right'))
    left = align === 'left' ? anchor.x : anchor.x + anchor.width - popup.width;
  if ((placement === 'left' || placement === 'right') && (align === 'top' || align === 'bottom'))
    top = align === 'top' ? anchor.y : anchor.y + anchor.height - popup.height;

  if (autoAdjustOverflow) {
    left = Math.max(
      viewport.x + padding,
      Math.min(left, viewport.x + viewport.width - padding - popup.width)
    );
    top = Math.max(
      viewport.y + padding,
      Math.min(top, viewport.y + viewport.height - padding - popup.height)
    );
  }

  const insetX = Math.min(16, popup.width / 2);
  const insetY = Math.min(16, popup.height / 2);

  return {
    left,
    top,
    placement,
    arrowX: Math.max(insetX, Math.min(centerX - left, popup.width - insetX)),
    arrowY: Math.max(insetY, Math.min(centerY - top, popup.height - insetY))
  };
}
