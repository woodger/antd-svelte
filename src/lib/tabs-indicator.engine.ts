import type { TabsIndicator } from './tabs.types';

export interface TabsIndicatorOffset {
  width: number;
  height: number;
  left: number;
  right: number;
  top: number;
}

export interface TabsIndicatorStyle {
  width?: number;
  height?: number;
  left?: number;
  right?: number;
  top?: number;
  transform?: string;
}

/** Формулы useIndicator из @rc-component/tabs 1.13.0, включая end transform в RTL. */
export function getTabsIndicatorStyle(
  offset: TabsIndicatorOffset | undefined,
  vertical: boolean,
  rtl: boolean,
  indicator: TabsIndicator = {}
): TabsIndicatorStyle {
  if (!offset) return {};

  const origin = vertical ? offset.height : offset.width;
  const size = typeof indicator.size === 'function' ? indicator.size(origin)
    : typeof indicator.size === 'number' ? indicator.size : origin;
  const align = indicator.align ?? 'center';
  const style: TabsIndicatorStyle = vertical ? { height: size } : { width: size };
  const edge = vertical ? 'top' : rtl ? 'right' : 'left';
  if (align === 'start') style[edge] = offset[edge];
  if (align === 'center') {
    style[edge] = offset[edge] + origin / 2;
    style.transform = vertical ? 'translateY(-50%)'
      : rtl ? 'translateX(50%)' : 'translateX(-50%)';
  }
  if (align === 'end') {
    style[edge] = offset[edge] + origin;
    style.transform = vertical ? 'translateY(-100%)' : 'translateX(-100%)';
  }
  return style;
}

/** Исходное сравнение округляет только числа; малые колебания не перезапускают transition. */
export function isTabsIndicatorStyleEqual(
  previous: TabsIndicatorStyle | undefined,
  next: TabsIndicatorStyle
): boolean {
  return Boolean(previous) && Object.entries(next).every(([key, value]) => {
    const before = previous![key as keyof TabsIndicatorStyle];
    return typeof value === 'number' && typeof before === 'number'
      ? Math.round(value) === Math.round(before) : value === before;
  });
}
