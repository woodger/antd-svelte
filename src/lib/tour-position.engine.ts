// Числовая часть Ant Design placements и rc-trigger 3.10.1 useAlign; MIT, LICENSE.rc-trigger.
import type { TourAlign, TourPlacement } from './tour.types';
import type { TourRect } from './tour.engine';

export interface TourArea {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface TourFlipCache {
  bt?: boolean;
  tb?: boolean;
  rl?: boolean;
  lr?: boolean;
}

const points: Record<Exclude<TourPlacement, 'center'>, readonly [string, string]> = {
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

export function getTourPlacements(pointAtCenter: boolean, arrowWidth = 16, offset = 4, radius = 6) {
  const arrowOffset = radius > 12 ? radius + 2 : 12;
  const half = arrowWidth / 2;
  const map: Record<string, TourAlign> = {};

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

    map[name] = {
      points: aligned,
      offset: shift,
      dynamicInset: true,
      ...(corner ? { autoArrow: false } : {}),
      overflow: corner ? { adjustX: true, adjustY: true } : horizontal
        ? { shiftX: arrowOffset * 2 + arrowWidth, shiftY: true, adjustY: true }
        : { shiftY: 16 + arrowWidth, shiftX: true, adjustX: true }
    };
  }
  return map;
}

function getPoint(rect: TourRect, point = '') {
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

/** Сохраняет исходные flip cache, area comparison, shift и округление useAlign. */
export function getTourAlignment(input: {
  target: TourRect;
  popup: TourRect;
  mirror: { right: number; bottom: number; };
  visible: TourArea;
  scaleX: number;
  scaleY: number;
  placement: TourPlacement;
  pointAtCenter: boolean;
  arrowWidth?: number;
  offset?: number;
  radius?: number;
  flips?: TourFlipCache;
}) {
  const { target, popup, visible, scaleX, scaleY } = input;
  const placements = getTourPlacements(
    input.pointAtCenter,
    input.arrowWidth,
    input.offset,
    input.radius
  );
  const initial: TourAlign = placements[input.placement] ?? {};
  const source = initial.points?.[0] ?? 'cc';
  const destination = initial.points?.[1] ?? 'cc';
  let resultPoints: [string, string] = [source, destination];
  let [offsetX, offsetY] = initial.offset ?? [0, 0];
  const sourcePoint = getPoint(popup, source);
  const targetPoint = getPoint(target, destination);
  let x = targetPoint.x - sourcePoint.x + offsetX;
  let y = targetPoint.y - sourcePoint.y + offsetY;
  const flips = { ...input.flips };

  function area(left: number, top: number) {
    const l = Math.max(popup.left + left, visible.left);
    const t = Math.max(popup.top + top, visible.top);
    const r = Math.min(popup.left + left + popup.width, visible.right);
    const b = Math.min(popup.top + top + popup.height, visible.bottom);
    return Math.max(0, (r - l) * (b - t));
  }

  const originalArea = area(x, y);
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
    && (originalY + popup.height > visible.bottom || flips.bt)) {
    const next = source[0] === destination[0]
      ? y - popup.height + target.height : targetTL.y - sourceBR.y - offsetY;
    flips.bt = area(x, next) >= originalArea;
    if (flips.bt) {
      y = next;
      offsetY = -offsetY;
      resultPoints = [reverse(resultPoints[0], 0), reverse(resultPoints[1], 0)];
    }
  }
  if (supports(overflow.adjustY) && source[0] === 'b'
    && (originalY < visible.top || flips.tb)) {
    const next = source[0] === destination[0]
      ? y + popup.height - target.height : targetBR.y - sourceTL.y - offsetY;
    flips.tb = area(x, next) >= originalArea;
    if (flips.tb) {
      y = next;
      offsetY = -offsetY;
      resultPoints = [reverse(resultPoints[0], 0), reverse(resultPoints[1], 0)];
    }
  }
  if (supports(overflow.adjustX) && source[1] === 'l'
    && (originalX + popup.width > visible.right || flips.rl)) {
    const next = source[1] === destination[1]
      ? x - popup.width + target.width : targetTL.x - sourceBR.x - offsetX;
    flips.rl = area(next, y) >= originalArea;
    if (flips.rl) {
      x = next;
      offsetX = -offsetX;
      resultPoints = [reverse(resultPoints[0], 1), reverse(resultPoints[1], 1)];
    }
  }
  if (supports(overflow.adjustX) && source[1] === 'r'
    && (originalX < visible.left || flips.lr)) {
    const next = source[1] === destination[1]
      ? x + popup.width - target.width : targetBR.x - sourceTL.x - offsetX;
    flips.lr = area(next, y) >= originalArea;
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
    if (left < visible.left) {
      x -= left - visible.left - offsetX;
      if (target.left + target.width < visible.left + shiftX) {
        x += target.left - visible.left + target.width - shiftX;
      }
    }
    if (right > visible.right) {
      x -= right - visible.right - offsetX;
      if (target.left > visible.right - shiftX) x += target.left - visible.right + shiftX;
    }
  }
  const shiftY = overflow.shiftY === true ? 0 : overflow.shiftY;
  if (typeof shiftY === 'number') {
    if (top < visible.top) {
      y -= top - visible.top - offsetY;
      if (target.top + target.height < visible.top + shiftY) {
        y += target.top - visible.top + target.height - shiftY;
      }
    }
    if (bottom > visible.bottom) {
      y -= bottom - visible.bottom - offsetY;
      if (target.top > visible.bottom - shiftY) y += target.top - visible.bottom + shiftY;
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
  const placement = Object.entries(placements).find(([, item]) =>
    item.points?.[0] === resultPoints[0] && item.points?.[1] === resultPoints[1])?.[0];
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
