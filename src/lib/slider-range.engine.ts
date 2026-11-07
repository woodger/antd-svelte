// Алгоритмы @rc-component/slider 1.1.1; MIT, см. vendor/LICENSE.rc-slider.
import type { SliderRangeConfig, SliderMarks, SliderMarkContent } from './slider-range.types';
import type { SliderDirection } from './slider.engine';

export interface SliderRangeOptions {
  min: number;
  max: number;
  step: number | null;
  marks: readonly { value: number; label?: SliderMarkContent; style?: string; }[];
  allowCross: boolean;
  pushable: false | number | null;
  disabled: boolean | readonly boolean[];
}

export function sliderHandleDisabled(disabled: SliderRangeOptions['disabled'], index: number) {
  return typeof disabled === 'boolean' ? disabled : disabled[index] ?? false;
}

export function sliderDisabledState(disabled: SliderRangeOptions['disabled'], values: number[]) {
  if (typeof disabled === 'boolean') return [disabled, disabled && values.length > 0] as const;
  return [
    values.length > 0 && values.every((_, index) => sliderHandleDisabled(disabled, index)),
    values.some((_, index) => sliderHandleDisabled(disabled, index))
  ] as const;
}

export function sliderRangeSettings(range: true | SliderRangeConfig) {
  return range === true ? { editable: false, draggableTrack: false, minCount: 0 } : {
    editable: Boolean(range.editable),
    draggableTrack: !range.editable && Boolean(range.draggableTrack),
    minCount: range.minCount || 0,
    maxCount: range.maxCount
  };
}

export function sliderRangeMarks(marks?: SliderMarks) {
  return Object.keys(marks ?? {}).map(key => {
    const mark = marks![key];
    const metadata = mark && typeof mark === 'object' && ('label' in mark || 'style' in mark)
      ? mark : { label: mark as SliderMarkContent };
    return { value: Number(key), ...metadata };
  }).filter(mark => mark.label || typeof mark.label === 'number')
    .sort((a, b) => a.value - b.value);
}

export function sliderDisabledBoundaries(
  values: readonly number[],
  index: number,
  options: SliderRangeOptions
) {
  const gap = typeof options.pushable === 'number' ? options.pushable : 0;
  let minimum = options.min;
  let maximum = options.max;
  for (let previous = index - 1; previous >= 0; previous--) {
    if (sliderHandleDisabled(options.disabled, previous)) {
      minimum = values[previous] + gap;
      break;
    }
  }
  for (let next = index + 1; next < values.length; next++) {
    if (sliderHandleDisabled(options.disabled, next)) {
      maximum = values[next] - gap;
      break;
    }
  }
  return [minimum, maximum] as const;
}

export function sliderClosestHandle(
  values: readonly number[],
  target: number,
  options: SliderRangeOptions
) {
  let closest = -1;
  let distance = options.max - options.min;
  values.forEach((value, index) => {
    if (sliderHandleDisabled(options.disabled, index)) return;
    const [min, max] = sliderDisabledBoundaries(values, index, options);
    const nextDistance = Math.abs(target - value);
    if (min <= target && target <= max && nextDistance <= distance) {
      distance = nextDistance;
      closest = index;
    }
  });
  return closest;
}

export function createSliderRangeOffset(options: SliderRangeOptions) {
  const { min, max, step, marks, allowCross, pushable } = options;
  const clamp = (value: number) => Math.max(min, Math.min(max, value));
  function stepValue(value: number) {
    if (step === null) return null;
    const next = min + Math.round((clamp(value) - min) / step) * step;
    const decimal = (value: number) => (String(value).split('.')[1] || '').length;
    const fixed = Number(next.toFixed(Math.max(decimal(step), decimal(max), decimal(min))));
    return min <= fixed && fixed <= max ? fixed : null;
  }
  function format(value: number) {
    const target = clamp(value);
    const candidates: (number | null)[] = marks.map(mark => mark.value);
    if (step !== null) candidates.push(stepValue(value));
    candidates.push(min, max);
    let closest = candidates[0];
    let distance = max - min;
    for (const candidate of candidates) {
      // Исходник сравнивает null как число 0, в том числе у неполной последней ступени.
      const nextDistance = Math.abs(target - Number(candidate));
      if (nextDistance <= distance) {
        distance = nextDistance;
        closest = candidate;
      }
    }
    return closest as number;
  }
  function offsetValue(
    values: readonly number[],
    offset: number | 'min' | 'max',
    index: number,
    mode: 'unit' | 'dist' = 'unit'
  ): number {
    if (offset === 'min') return min;
    if (offset === 'max') return max;
    const origin = values[index];
    const target = origin + offset;
    const sign = offset > 0 ? 1 : -1;
    const candidates = [
      ...marks.map(mark => mark.value), min, max, stepValue(origin),
      stepValue(mode === 'unit' ? origin + sign * Number(step) : target)
    ].filter((value): value is number => value !== null)
      .filter(value => offset < 0 ? value <= origin : value >= origin)
      .filter(value => mode !== 'unit' || value !== origin);
    const compare = mode === 'unit' ? origin : target;
    let next = candidates[0];
    let distance = Math.abs(next - compare);
    for (const candidate of candidates) {
      const nextDistance = Math.abs(candidate - compare);
      if (nextDistance < distance) {
        next = candidate;
        distance = nextDistance;
      }
    }
    if (next === undefined) return offset < 0 ? min : max;
    if (mode === 'dist' || Math.abs(offset) <= 1) return next;
    const clone = [...values];
    clone[index] = next;
    return offsetValue(clone, offset - sign, index, mode);
  }
  function needsPush(distance: number) {
    return pushable === null && distance === 0
      || typeof pushable === 'number' && distance < pushable;
  }
  function push(values: number[], index: number, direction: -1 | 1) {
    let changed = true;
    while (needsPush(direction === 1
      ? values[index] - values[index - 1] : values[index + 1] - values[index]) && changed) {
      const next = offsetValue(values, direction, index);
      changed = next !== values[index];
      values[index] = next;
    }
    const [minimum, maximum] = sliderDisabledBoundaries(values, index, options);
    values[index] = direction === 1 ? Math.min(values[index], maximum)
      : Math.max(values[index], minimum);
  }
  function offset(
    values: readonly number[],
    change: number | 'min' | 'max',
    index: number,
    mode: 'unit' | 'dist' = 'unit'
  ) {
    const next = values.map(format);
    const origin = next[index];
    const [minimum, maximum] = sliderDisabledBoundaries(next, index, options);
    next[index] = offsetValue(next, change, index, mode);
    next[index] = minimum <= maximum ? Math.max(minimum, Math.min(maximum, next[index])) : origin;
    if (!allowCross) {
      const gap = pushable || 0;
      if (index > 0 && next[index - 1] !== origin) {
        next[index] = Math.max(next[index], next[index - 1] + gap);
      }
      if (index < next.length - 1 && next[index + 1] !== origin) {
        next[index] = Math.min(next[index], next[index + 1] - gap);
      }
    } else if (typeof pushable === 'number' || pushable === null) {
      for (let item = index + 1; item < next.length; item++) {
        if (sliderHandleDisabled(options.disabled, item)) break;
        push(next, item, 1);
      }
      for (let item = index; item > 0; item--) {
        if (sliderHandleDisabled(options.disabled, item - 1)) break;
        push(next, item - 1, -1);
      }
      for (let item = next.length - 1; item > 0; item--) {
        if (sliderHandleDisabled(options.disabled, item)
          || sliderHandleDisabled(options.disabled, item - 1)) continue;
        push(next, item - 1, -1);
      }
      for (let item = 0; item < next.length - 1; item++) {
        if (sliderHandleDisabled(options.disabled, item)
          || sliderHandleDisabled(options.disabled, item + 1)) continue;
        push(next, item + 1, 1);
      }
    }
    return { value: next[index], values: next };
  }
  return { format, offset };
}

export function sliderRangeValues(
  value: readonly number[] | null | undefined,
  options: SliderRangeOptions
) {
  let values = [...(value ?? [])];
  if (value === undefined) values = [options.min, options.min];
  return values.sort((a, b) => a - b).map(createSliderRangeOffset(options).format);
}

export function sliderRangeCache(raw: readonly number[], cache: number[], editable: boolean) {
  const counts = new Map<number, number>();
  for (const value of cache) counts.set(value, (counts.get(value) ?? 0) + 1);
  for (const value of raw) counts.set(value, (counts.get(value) ?? 0) - 1);
  const difference = [...counts.values()].reduce((sum, count) => sum + Math.abs(count), 0);
  return difference <= (editable ? 1 : 0) ? cache : [...raw];
}

export function sliderRangePosition(
  direction: SliderDirection,
  value: number,
  min: number,
  max: number
) {
  const offset = (value - min) / (max - min) * 100;
  if (direction === 'rtl') return `right:${offset}%;transform:translateX(50%)`;
  if (direction === 'btt') return `bottom:${offset}%;transform:translateY(50%)`;
  if (direction === 'ttb') return `top:${offset}%;transform:translateY(-50%)`;
  return `left:${offset}%;transform:translateX(-50%)`;
}

export function sliderRangeKey(key: string, direction: SliderDirection) {
  if (key === 'ArrowLeft') return direction === 'ltr' || direction === 'btt' ? -1 : 1;
  if (key === 'ArrowRight') return direction === 'ltr' || direction === 'btt' ? 1 : -1;
  if (key === 'ArrowUp') return direction === 'ttb' ? -1 : 1;
  if (key === 'ArrowDown') return direction === 'ttb' ? 1 : -1;
  if (key === 'Home') return 'min';
  if (key === 'End') return 'max';
  if (key === 'PageUp') return 2;
  if (key === 'PageDown') return -2;
  return undefined;
}
