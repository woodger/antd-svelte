import type { BorderBeamColor, BorderBeamProps } from './border-beam.types';

export type BorderBeamBorderWidth = readonly [number, number, number, number];

export interface BorderBeamRuntimeOptions extends Pick<
  BorderBeamProps,
  'color' | 'count' | 'duration' | 'lineWidth' | 'outset' | 'size' | 'style'
> {
  className: string;
  prefix?: string;
  rootPrefix?: string;
  themeStyle?: string;
  themeOrigin?: HTMLElement;
  contextStyle?: string;
}

export function getBorderBeamCount(count?: number) {
  return typeof count === 'number' && Number.isFinite(count) && count >= 1
    ? Math.floor(count)
    : 1;
}

export function getBorderBeamGradient(color?: BorderBeamColor) {
  const items = typeof color === 'string' ? [{ color, percent: 0 }] : color ?? [];
  const last = items[items.length - 1];

  if (!last) return undefined;

  const stops = last.percent === 100 ? items : [...items, { ...last, percent: 100 }];
  const colors = stops.map(item => {
    const percent = Number(((Math.min(Math.max(item.percent, 0), 100) / 100) * 70).toFixed(2));

    return `${item.color} ${percent}%`;
  });

  return `linear-gradient(to left, ${colors.join(', ')}, transparent)`;
}

export function getBorderBeamStyle(
  options: BorderBeamRuntimeOptions,
  borderWidth: BorderBeamBorderWidth,
  index: number
) {
  const { color, duration, lineWidth, outset, size } = options;
  const variablePrefix = `--${(options.rootPrefix ?? 'ant').replace(/\./g, '')}-border-beam-`;
  const gradient = getBorderBeamGradient(color);
  const validDuration = typeof duration === 'number' && !Number.isNaN(duration) && duration > 0;
  const unit = (value: number | string) => typeof value === 'number' ? `${value}px` : value;
  const inset = (value: number | string) => typeof value === 'string'
    ? `calc(-1 * ${value})`
    : `-${value}px`;
  const insetOffset = outset !== undefined && outset !== null
    ? inset(outset)
    : borderWidth.map(inset).join(' ');

  return [
    options.themeStyle,
    options.contextStyle,
    options.style,
    gradient && `${variablePrefix}beam-gradient:${gradient}`,
    validDuration && `${variablePrefix}duration:${duration}s`,
    lineWidth !== undefined && lineWidth !== null && `${variablePrefix}line-width:${unit(lineWidth)}`,
    size !== undefined && size !== null && `${variablePrefix}size:${unit(size)}`,
    index > 0
      && `${variablePrefix}delay:${(-(validDuration ? duration : 6) * index) / getBorderBeamCount(options.count)}s`,
    `${variablePrefix}inset-offset:${insetOffset}`
  ].filter(Boolean).join(';');
}
