// Числовая часть Ant Design placements и rc-trigger 3.10.1 useAlign; MIT, LICENSE.rc-trigger.
export type PopupPlacement = 'center' | 'top' | 'bottom' | 'left' | 'right'
  | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'
  | 'leftTop' | 'leftBottom' | 'rightTop' | 'rightBottom';
export interface PopupRect { left: number; top: number; width: number; height: number; }
export type PopupOffset = number | string;
export interface PopupSourceAlign {
  points?: readonly string[];
  offset?: readonly PopupOffset[];
  targetOffset?: readonly PopupOffset[];
  dynamicInset?: boolean;
  autoArrow?: boolean;
  htmlRegion?: 'visible' | 'scroll' | 'visibleFirst';
  /** Исходный legacy alias dynamicInset; остальные private параметры не обрабатываются. */
  _experimental?: { dynamicInset?: boolean; [key: string]: unknown; };
  /** Сохранены в исходном AlignType, но useAlign/useOffsetStyle 3.10.1 их не читают. */
  useCssRight?: boolean;
  useCssBottom?: boolean;
  useCssTransform?: boolean;
  ignoreShake?: boolean;
  overflow?: {
    adjustX?: boolean | number;
    adjustY?: boolean | number;
    shiftX?: boolean | number;
    shiftY?: boolean | number;
  };
}
export interface PopupAlign extends PopupSourceAlign {
  offset?: readonly [number, number];
}
export interface PopupOverflowAdjust { adjustX?: 0 | 1; adjustY?: 0 | 1; }

export interface PopupArea {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface PopupFlipCache {
  bt?: boolean;
  tb?: boolean;
  rl?: boolean;
  lr?: boolean;
}

const points: Record<Exclude<PopupPlacement, 'center'>, readonly [string, string]> = {
  left: ['cr', 'cl'],
  right: ['cl', 'cr'],
  top: ['bc', 'tc'],
  bottom: ['tc', 'bc'],
  topLeft: ['bl', 'tl'],
  leftTop: ['tr', 'tl'],
  topRight: ['br', 'tr'],
  rightTop: ['tl', 'tr'],
  bottomRight: ['tr', 'br'],
  rightBottom: ['bl', 'br'],
  bottomLeft: ['tl', 'bl'],
  leftBottom: ['br', 'bl']
};

export function getPopupPlacements(
  pointAtCenter: boolean,
  arrowWidth = 16,
  offset = 4,
  radius = 6,
  autoAdjustOverflow: boolean | PopupOverflowAdjust = true
) {
  const arrowOffset = radius > 12 ? radius + 2 : 12;
  const half = arrowWidth / 2;
  const map: Record<string, PopupAlign> = {};

  for (const [name, pair] of Object.entries(points)) {
    const corner = name.length > 6;
    let aligned = pair;
    const shift: [number, number] = [0, 0];
    const horizontal = name.startsWith('top') || name.startsWith('bottom');
    if (pointAtCenter && corner) aligned = [pair[0], `${pair[1][0]}c`];
    if (pointAtCenter && corner && !horizontal) aligned = [pair[0], `c${pair[1][1]}`];

    if (name.startsWith('top')) shift[1] = -half - offset;
    if (name.startsWith('bottom')) shift[1] = half + offset;
    if (name.startsWith('left')) shift[0] = -half - offset;
    if (name.startsWith('right')) shift[0] = half + offset;
    if (pointAtCenter && corner) {
      if (name.endsWith('Left')) shift[0] = -arrowOffset - half;
      if (name.endsWith('Right')) shift[0] = arrowOffset + half;
      if (name.endsWith('Top')) shift[1] = -arrowOffset * 2 + half;
      if (name.endsWith('Bottom')) shift[1] = arrowOffset * 2 - half;
    }

    const base = corner ? { adjustX: true, adjustY: true } : horizontal
      ? { shiftX: arrowOffset * 2 + arrowWidth, shiftY: true, adjustY: true }
      : { shiftY: 16 + arrowWidth, shiftX: true, adjustX: true };
    const overflow: NonNullable<PopupAlign['overflow']> = autoAdjustOverflow === false
      ? { adjustX: false, adjustY: false }
      : { ...base, ...(typeof autoAdjustOverflow === 'object' ? autoAdjustOverflow : {}) };
    if (autoAdjustOverflow !== false) {
      if (!overflow.shiftX) overflow.adjustX = true;
      if (!overflow.shiftY) overflow.adjustY = true;
    }
    map[name] = {
      points: aligned,
      offset: shift,
      dynamicInset: true,
      ...(corner ? { autoArrow: false } : {}),
      overflow
    };
  }
  return map;
}

function getPoint(rect: PopupRect, point = '') {
  return {
    x: rect.left + (point[1] === 'l' ? 0 : point[1] === 'r' ? rect.width : rect.width / 2),
    y: rect.top + (point[0] === 't' ? 0 : point[0] === 'b' ? rect.height : rect.height / 2)
  };
}

function reverse(point: string, axis: 0 | 1) {
  const opposites: Record<string, string> = { t: 'b', b: 't', l: 'r', r: 'l' };
  const letters = [...point];
  letters[axis] = opposites[letters[axis]] ?? 'c';
  return letters.join('');
}

interface PopupAlignmentGeometry {
  target: PopupRect;
  popup: PopupRect;
  mirror: { right: number; bottom: number; };
  visible: PopupArea;
  scaleX: number;
  scaleY: number;
  flips?: PopupFlipCache;
}

export function getPopupAlignment(input: PopupAlignmentGeometry & {
  placement: PopupPlacement;
  pointAtCenter: boolean;
  arrowWidth?: number;
  offset?: number;
  radius?: number;
  autoAdjustOverflow?: boolean | PopupOverflowAdjust;
}) {
  const placements = getPopupPlacements(
    input.pointAtCenter,
    input.arrowWidth,
    input.offset,
    input.radius,
    input.autoAdjustOverflow
  );
  const initial: PopupAlign = placements[input.placement] ?? {};
  const position = getPopupPosition({
    ...input,
    placements,
    align: { ...initial, points: initial.points ?? ['cc', 'cc'] }
  });
  return { ...position, align: { ...initial, points: position.align.points } };
}

function getOffset(size: number, value: PopupOffset = 0) {
  return typeof value === 'string' && value.endsWith('%')
    ? size * Number.parseFloat(value) / 100 : Number.parseFloat(String(value));
}

/** Числовой useAlign 3.10.1: offsets, обе области viewport, flip cache, shift и rounding. */
export function getPopupPosition(input: PopupAlignmentGeometry & {
  align: PopupSourceAlign;
  placements: Readonly<Record<string, PopupSourceAlign>>;
  scroll?: PopupArea;
  alignPoint?: boolean;
}) {
  const { popup, scaleX, scaleY, placements } = input;
  const initial = input.align;
  const visibleRegion = input.visible;
  const visibleFirst = initial.htmlRegion === 'visibleFirst';
  const visible = initial.htmlRegion === 'scroll' || visibleFirst
    ? input.scroll ?? visibleRegion : visibleRegion;
  const adjustArea = visibleFirst ? visibleRegion : visible;
  const target = {
    width: input.target.width,
    height: input.target.height,
    left: input.target.left - getOffset(input.target.width, initial.targetOffset?.[0]),
    top: input.target.top - getOffset(input.target.height, initial.targetOffset?.[1])
  };
  const source = initial.points?.[0] ?? '';
  const destination = initial.points?.[1] ?? '';
  let resultPoints: [string, string] = [source.slice(0, 2), destination.slice(0, 2)];
  let offsetX = getOffset(popup.width, initial.offset?.[0]);
  let offsetY = getOffset(popup.height, initial.offset?.[1]);
  const sourcePoint = getPoint(popup, source);
  const targetPoint = getPoint(target, destination);
  let x = targetPoint.x - sourcePoint.x + offsetX;
  let y = targetPoint.y - sourcePoint.y + offsetY;
  const flips = { ...input.flips };

  function area(left: number, top: number, region = visible) {
    const l = Math.max(popup.left + left, region.left);
    const t = Math.max(popup.top + top, region.top);
    const r = Math.min(popup.left + left + popup.width, region.right);
    const b = Math.min(popup.top + top + popup.height, region.bottom);
    return Math.max(0, (r - l) * (b - t));
  }

  const originalArea = area(x, y);
  const originalRecommend = area(x, y, visibleRegion);
  const prefer = (left: number, top: number) => {
    const next = area(left, top);
    return next > originalArea || next === originalArea
      && (!visibleFirst || area(left, top, visibleRegion) >= originalRecommend);
  };
  const sourceTL = getPoint(popup, 'tl');
  const sourceBR = getPoint(popup, 'br');
  const targetTL = getPoint(target, 'tl');
  const targetBR = getPoint(target, 'br');
  const originalX = popup.left + x;
  const originalY = popup.top + y;
  const overflow = initial.overflow ?? {};
  const supports = (value: boolean | number | undefined) =>
    typeof value === 'boolean' ? value : value !== undefined && value >= 0;

  if (supports(overflow.adjustY) && source[0] === 't'
    && (originalY + popup.height > adjustArea.bottom || flips.bt)) {
    const next = source[0] === destination[0]
      ? y - popup.height + target.height : targetTL.y - sourceBR.y - offsetY;
    flips.bt = prefer(x, next);
    if (flips.bt) {
      y = next;
      offsetY = -offsetY;
      resultPoints = [reverse(resultPoints[0], 0), reverse(resultPoints[1], 0)];
    }
  }
  if (supports(overflow.adjustY) && source[0] === 'b'
    && (originalY < adjustArea.top || flips.tb)) {
    const next = source[0] === destination[0]
      ? y + popup.height - target.height : targetBR.y - sourceTL.y - offsetY;
    flips.tb = prefer(x, next);
    if (flips.tb) {
      y = next;
      offsetY = -offsetY;
      resultPoints = [reverse(resultPoints[0], 0), reverse(resultPoints[1], 0)];
    }
  }
  if (supports(overflow.adjustX) && source[1] === 'l'
    && (originalX + popup.width > adjustArea.right || flips.rl)) {
    const next = source[1] === destination[1]
      ? x - popup.width + target.width : targetTL.x - sourceBR.x - offsetX;
    flips.rl = prefer(next, y);
    if (flips.rl) {
      x = next;
      offsetX = -offsetX;
      resultPoints = [reverse(resultPoints[0], 1), reverse(resultPoints[1], 1)];
    }
  }
  if (supports(overflow.adjustX) && source[1] === 'r'
    && (originalX < adjustArea.left || flips.lr)) {
    const next = source[1] === destination[1]
      ? x + popup.width - target.width : targetBR.x - sourceTL.x - offsetX;
    flips.lr = prefer(next, y);
    if (flips.lr) {
      x = next;
      offsetX = -offsetX;
      resultPoints = [reverse(resultPoints[0], 1), reverse(resultPoints[1], 1)];
    }
  }

  const left = popup.left + x;
  const top = popup.top + y;
  const right = left + popup.width;
  const bottom = top + popup.height;
  const shiftX = overflow.shiftX === true ? 0 : overflow.shiftX;
  if (typeof shiftX === 'number') {
    if (left < visibleRegion.left) {
      x -= left - visibleRegion.left - offsetX;
      if (target.left + target.width < visibleRegion.left + shiftX) {
        x += target.left - visibleRegion.left + target.width - shiftX;
      }
    }
    if (right > visibleRegion.right) {
      x -= right - visibleRegion.right - offsetX;
      if (target.left > visibleRegion.right - shiftX) x += target.left - visibleRegion.right + shiftX;
    }
  }
  const shiftY = overflow.shiftY === true ? 0 : overflow.shiftY;
  if (typeof shiftY === 'number') {
    if (top < visibleRegion.top) {
      y -= top - visibleRegion.top - offsetY;
      if (target.top + target.height < visibleRegion.top + shiftY) {
        y += target.top - visibleRegion.top + target.height - shiftY;
      }
    }
    if (bottom > visibleRegion.bottom) {
      y -= bottom - visibleRegion.bottom - offsetY;
      if (target.top > visibleRegion.bottom - shiftY) y += target.top - visibleRegion.bottom + shiftY;
    }
  }

  const popupLeft = popup.left + x;
  const popupTop = popup.top + y;
  const arrowX = ((Math.max(popupLeft, target.left)
    + Math.min(popupLeft + popup.width, target.left + target.width)) / 2 - popupLeft) / scaleX;
  const arrowY = ((Math.max(popupTop, target.top)
    + Math.min(popupTop + popup.height, target.top + target.height)) / 2 - popupTop) / scaleY;
  let rightOffset = input.mirror.right - popup.left - x - popup.width;
  let bottomOffset = input.mirror.bottom - popup.top - y - popup.height;
  if (scaleX === 1) {
    x = Math.floor(x);
    rightOffset = Math.floor(rightOffset);
  }
  if (scaleY === 1) {
    y = Math.floor(y);
    bottomOffset = Math.floor(bottomOffset);
  }

  const align = { ...initial, points: resultPoints };
  const placement = getPopupPlacement(placements, align, input.alignPoint);
  return {
    x: x / scaleX,
    y: y / scaleY,
    right: rightOffset / scaleX,
    bottom: bottomOffset / scaleY,
    arrowX,
    arrowY,
    align,
    placement,
    flips
  };
}

export function getPopupPlacement(
  placements: Readonly<Record<string, PopupSourceAlign>>,
  align: PopupSourceAlign,
  alignPoint = false
) {
  return Object.entries(placements).find(([, item]) =>
    (item.points?.[0] || '') === (align.points?.[0] || '')
      && (alignPoint || (item.points?.[1] || '') === (align.points?.[1] || '')))?.[0];
}

export function getPopupArrowStyle(position: {
  align?: PopupSourceAlign;
  arrowX: number;
  arrowY: number;
} | undefined) {
  const align = position?.align;
  if (!align?.points || align.autoArrow === false) return '';
  const [source, target] = align.points;
  const y = source[0] === target[0] || !['t', 'b'].includes(source[0])
    ? `top:${position!.arrowY}px` : source[0] === 't' ? 'top:0' : 'bottom:0';
  const x = source[1] === target[1] || !['l', 'r'].includes(source[1])
    ? `left:${position!.arrowX}px` : source[1] === 'l' ? 'left:0' : 'right:0';
  return `${x};${y}`;
}
