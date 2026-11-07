import { FastColor } from './fast-color.engine';
import type { ProgressGradient, ProgressLineSize, ProgressSuccess } from './progress.types';

/** Source validProgress для нового success segment; legacy percent нормализуется отдельно. */
export function progressSuccessPercent(success: ProgressSuccess | undefined) {
  const value = success?.percent;
  return !value || value < 0 ? 0 : value > 100 ? 100 : value;
}

/** Source sortGradient: допускает numeric prefixes, игнорирует нечисловые ключи. */
export function progressGradient(color: ProgressGradient, rtl: boolean) {
  const { from = '#1677FF', to = '#1677FF', direction = rtl ? 'to left' : 'to right',
    ...stops } = color;
  const sorted = Object.entries(stops).map(([key, value]) => ({
    key: Number.parseFloat(key.replace(/%/g, '')),
    value
  })).filter(stop => !Number.isNaN(stop.key)).sort((a, b) => a.key - b.key);
  const colors = Object.keys(stops).length
    ? sorted.map(stop => `${stop.value} ${stop.key}%`).join(', ')
    : `${from}, ${to}`;

  return `linear-gradient(${direction}, ${colors})`;
}

export function isProgressColorBright(color: string | string[] | ProgressGradient | undefined) {
  const first = Array.isArray(color) ? color[0] : color;
  if (!first) return false;
  const value = new FastColor(typeof first === 'string' ? first : Object.values(first)[0]);

  return (value.r * 299 + value.g * 587 + value.b * 114) / 1000 >= 128;
}

/** Source Steps/getSize: unit dimensions, count и rounding не заменяются line defaults. */
export function progressLineSteps(
  count: number,
  percent: number,
  size: ProgressLineSize | undefined,
  rounding: (value: number) => number = Math.round
) {
  let width: number | string = size === 'small' ? 2 : 14;
  let height = 8;
  if (typeof size === 'number') {
    width = size;
    height = size;
  } else if (size && typeof size === 'object') {
    const pair = Array.isArray(size) ? size : [size.width, size.height];
    width = pair[0] ?? 14;
    height = Number(pair[1] ?? 8);
  }
  const current = rounding(count * percent / 100);
  // Source multiplies и делит width на count, включая coercion CSS strings в NaN.
  const unitWidth = Number(width) * count / count;
  const items: boolean[] = Array.from({ length: count });
  for (let index = 0; index < count; index++) items[index] = index <= current - 1;

  return { width: unitWidth, height, items };
}
