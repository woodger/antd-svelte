// Геометрия @rc-component/progress 1.0.3 (MIT); см. vendor/LICENSE.rc-progress.
// https://github.com/react-component/progress/tree/2f59aea058f27098fd1e73a2cca985faf520e3d2
import type {
  ProgressGapPlacement, ProgressGradient, ProgressSuccess
} from './progress.types';
import { progressSuccessPercent } from './progress-line.engine';

type CircleGapPosition = 'top' | 'bottom' | 'left' | 'right';

const transition = 'stroke-dashoffset .3s ease 0s, stroke-dasharray .3s ease 0s, '
  + 'stroke .3s, stroke-width .06s ease .3s, opacity .3s ease 0s';

export function progressGapPosition(
  type: 'circle' | 'dashboard',
  direction: 'ltr' | 'rtl',
  placement?: ProgressGapPlacement
) {
  const value = placement || (type === 'dashboard' ? 'bottom' : undefined);
  return value === 'start' ? direction === 'rtl' ? 'right' : 'left'
    : value === 'end' ? direction === 'rtl' ? 'left' : 'right' : value;
}

export function progressCircleStyle(
  perimeter: number,
  available: number,
  offset: number,
  percent: number,
  rotation: number,
  gap: number,
  position: CircleGapPosition | undefined,
  color: string | ProgressGradient | undefined,
  cap: 'round' | 'butt' | 'square',
  strokeWidth: number,
  space = 0
) {
  const offsetDegrees = offset / 100 * 360 * ((360 - gap) / 360);
  const positionDegrees = gap === 0 ? 0
    : ({ bottom: 0, top: 180, left: 90, right: -90 } as const)[position!];
  let dashOffset = (100 - percent) / 100 * available;
  if (cap === 'round' && percent !== 100) {
    dashOffset += strokeWidth / 2;
    if (dashOffset >= available) dashOffset = available - 0.01;
  }

  return {
    stroke: typeof color === 'string' ? color : undefined,
    dashArray: `${available}px ${perimeter}`,
    dashOffset: dashOffset + space,
    transform: `rotate(${rotation + offsetDegrees + positionDegrees}deg)`,
    transition
  };
}

export function progressCircleGradient(color: ProgressGradient, gap: number) {
  const colors = (scale: number) => Object.entries(color).map(([key, value]) =>
    `${value} ${Math.floor(Number.parseFloat(key) * scale)}%`).join(', ');

  return {
    conic: `conic-gradient(from ${gap ? `${180 + gap / 2}deg` : '0deg'}, ${colors((360 - gap) / 360)})`,
    linear: `linear-gradient(to ${gap ? 'bottom' : 'top'}, ${colors(1)})`
  };
}

export function progressCircleLayout(options: {
  percent: number;
  success?: ProgressSuccess;
  strokeWidth: number;
  color?: string | ProgressGradient;
  railColor?: string;
  cap: 'round' | 'butt' | 'square';
  steps?: number | { count: number; gap: number; };
  gap: number;
  position?: CircleGapPosition;
}) {
  const { percent, success, strokeWidth, color, railColor, steps, gap, position } = options;
  const radius = 50 - strokeWidth / 2;
  const perimeter = Math.PI * 2 * radius;
  const available = perimeter * ((360 - gap) / 360);
  const rotation = gap > 0 ? 90 + gap / 2 : -90;
  const cap = color && typeof color === 'object' ? 'butt' : options.cap;
  const count = typeof steps === 'object' ? steps.count : steps;
  // Сохраняем RangeError конструктора Array(count) из исходника.
  if (count && (!Number.isInteger(count) || count < 0 || count >= 2 ** 32)) {
    throw new RangeError('Invalid array length');
  }

  const stepGap = typeof steps === 'object' ? steps.gap : 2;
  const successPercent = progressSuccessPercent(success);
  const remainder = Math.max(0, Math.min(100, percent - successPercent));
  const style = (offset: number, value: number, stroke: typeof color, linecap = cap, space = 0) =>
    progressCircleStyle(perimeter, available, offset, value, rotation, gap, position,
      stroke, linecap, strokeWidth, space);
  const rail = style(0, 100, railColor);
  let offset = 0;
  const paths = count
    ? Array.from({ length: count }, (_, index) => {
      const stroke = index <= Math.round(count * (remainder / 100)) - 1 ? color : railColor;
      const path = style(offset, 100 / count, stroke, 'butt', stepGap);
      offset += (available - path.dashOffset + stepGap) * 100 / available;
      return { ...path, color: stroke, percent: 100 / count, step: true, index };
    })
    : (steps ? [remainder] : [successPercent, remainder]).map((value, index) => {
      const stroke = !steps && index === 0 ? success?.strokeColor || '#52C41A' : color;
      const path = style(offset, value, stroke);
      offset += value;
      return { ...path, color: stroke, percent: value, step: false, index };
    }).reverse();

  return { radius, perimeter, cap, rail: count ? undefined : rail, paths };
}
