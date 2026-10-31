import type {
  SplitterClassSlots,
  SplitterIconVisibility,
  SplitterPanelProps,
  SplitterSize
} from './splitter.types';

export interface SplitterPanel extends Omit<SplitterPanelProps, 'collapsible'> {
  collapsible: {
    start?: boolean;
    end?: boolean;
    showCollapsibleIcon: SplitterIconVisibility;
  };
}

export interface SplitterResizable {
  resizable: boolean;
  startCollapsible: boolean;
  endCollapsible: boolean;
  showStartCollapsibleIcon: SplitterIconVisibility;
  showEndCollapsibleIcon: SplitterIconVisibility;
}

export interface SplitterMovingIndex {
  index: number;
  confirmed: boolean;
}

export function normalizeSplitterPanels(items: readonly SplitterPanelProps[]) {
  return items.map<SplitterPanel>(item => ({
    ...item,
    collapsible: typeof item.collapsible === 'object' && item.collapsible !== null
      ? {
        ...item.collapsible,
        showCollapsibleIcon: item.collapsible.showCollapsibleIcon === undefined
          ? 'auto' : item.collapsible.showCollapsibleIcon
      }
      : {
        start: Boolean(item.collapsible),
        end: Boolean(item.collapsible),
        showCollapsibleIcon: 'auto'
      }
  }));
}

function fitSplitterPercentages(sizes: number[], minimums: number[], maximums: number[]) {
  const mins = sizes.map((size, index) => size === 0 ? 0 : minimums[index] ?? 0);
  const maxs = sizes.map((size, index) => size === 0 ? 0 : maximums[index] ?? 1);
  const invalid = mins.some((min, index) => min > maxs[index]);
  const totalMin = mins.reduce((sum, value) => sum + value, 0);
  const totalMax = maxs.reduce((sum, value) => sum + value, 0);

  if (invalid || totalMin > 1 || totalMax < 1) return sizes;

  const result = sizes.map((size, index) => Math.min(maxs[index], Math.max(mins[index], size)));
  const total = result.reduce((sum, value) => sum + value, 0);

  if (total === 1) return result;

  const spaces = result.map((size, index) => total < 1 ? maxs[index] - size : size - mins[index]);
  const space = spaces.reduce((sum, value) => sum + value, 0);

  return result.map((size, index) => size + (1 - total) * (spaces[index] / space));
}

export function autoSplitterPercentages(
  sizes: (number | undefined)[],
  minimums: number[],
  maximums: number[]
) {
  let total = 0;
  const empty: number[] = [];

  sizes.forEach((size, index) => {
    if (size === undefined)
      empty.push(index);
    else
      total += size;
  });

  const rest = 1 - total;

  if (sizes.length && !empty.length && total !== 1) {
    if (total === 0) return sizes.map(() => 1 / sizes.length);

    const scale = 1 / total;

    return fitSplitterPercentages(sizes.map(size => size! * scale), minimums, maximums);
  }

  if (rest < 0) {
    const scale = 1 / total;

    return sizes.map(size => size === undefined ? 0 : size * scale);
  }

  let sumMin = 0;
  let sumMax = 0;
  let limitMin = 0;
  let limitMax = 1;

  for (const index of empty) {
    const min = minimums[index] || 0;
    const max = maximums[index] || 1;
    sumMin += min;
    sumMax += max;
    limitMin = Math.max(limitMin, min);
    limitMax = Math.min(limitMax, max);
  }

  if (sumMin > 1 && sumMax < 1)
    return sizes.map(size => size === undefined ? 1 / empty.length : size);

  const average = rest / empty.length;

  if (limitMin <= average && average <= limitMax)
    return sizes.map(size => size === undefined ? average : size);

  const result = [...sizes] as number[];
  let remain = rest - sumMin;

  for (const index of empty) {
    const min = minimums[index] || 0;
    const max = maximums[index] || 1;
    const add = Math.min(max - min, remain);
    result[index] = min + add;
    remain -= add;
  }

  return result;
}

export function getSplitterPercentage(value: string) {
  return Number(value.slice(0, -1)) / 100;
}

const isPercentage = (value: SplitterSize | undefined): value is string =>
  typeof value === 'string' && value.endsWith('%');

export function getSplitterSizes(
  items: readonly SplitterPanelProps[],
  inner: (SplitterSize | undefined)[],
  containerSize?: number
) {
  const container = containerSize || 0;
  const controlled = items.some(item => item.size !== undefined && item.size !== null);
  const sizes = controlled ? items.map(item => item.size) : inner;
  const minimums = items.map(item => isPercentage(item.min)
    ? getSplitterPercentage(item.min) : Number(item.min || 0) / container);
  const maximums = items.map(item => isPercentage(item.max)
    ? getSplitterPercentage(item.max) : Number(item.max || container) / container);
  const percentages: (number | undefined)[] = [];

  for (let index = 0; index < items.length; index++) {
    const value = sizes[index];

    if (isPercentage(value)) {
      percentages[index] = getSplitterPercentage(value);
    } else if (value || value === 0) {
      const number = Number(value);

      if (!Number.isNaN(number))
        percentages[index] = number / container;
    } else {
      percentages[index] = undefined;
    }
  }

  const filled = autoSplitterPercentages(percentages, minimums, maximums);
  const pixels = filled.map(size => size * container);

  return {
    panels: containerSize ? pixels : sizes,
    pixels,
    percentages: filled,
    minimums,
    maximums
  };
}

function getVisibility(
  previous: { collapsible: boolean; mode: SplitterIconVisibility; },
  next: { collapsible: boolean; mode: SplitterIconVisibility; }
): SplitterIconVisibility {
  if (previous.collapsible && next.collapsible) {
    if (previous.mode === true || next.mode === true) return true;
    if (previous.mode === 'auto' || next.mode === 'auto') return 'auto';

    return false;
  }

  if (previous.collapsible) return previous.mode;
  if (next.collapsible) return next.mode;

  return false;
}

export function getSplitterResizable(items: SplitterPanel[], pixels: number[], reverse: boolean) {
  return items.slice(0, -1).map<SplitterResizable>((previous, index) => {
    const next = items[index + 1];
    const previousSize = pixels[index];
    const nextSize = pixels[index + 1];
    const previousEnd = Boolean(previous.collapsible.end) && previousSize > 0;
    const nextExpand = Boolean(next.collapsible.start) && nextSize === 0 && previousSize > 0;
    const nextStart = Boolean(next.collapsible.start) && nextSize > 0;
    const previousExpand = Boolean(previous.collapsible.end) && previousSize === 0 && nextSize > 0;
    const startVisibility = getVisibility(
      { collapsible: previousEnd, mode: previous.collapsible.showCollapsibleIcon },
      { collapsible: nextExpand, mode: next.collapsible.showCollapsibleIcon }
    );
    const endVisibility = getVisibility(
      { collapsible: nextStart, mode: next.collapsible.showCollapsibleIcon },
      { collapsible: previousExpand, mode: previous.collapsible.showCollapsibleIcon }
    );

    return {
      resizable: (previous.resizable ?? true) && (next.resizable ?? true)
        && (previousSize !== 0 || !previous.min) && (nextSize !== 0 || !next.min),
      startCollapsible: reverse ? nextStart || previousExpand : previousEnd || nextExpand,
      endCollapsible: reverse ? previousEnd || nextExpand : nextStart || previousExpand,
      showStartCollapsibleIcon: reverse ? endVisibility : startVisibility,
      showEndCollapsibleIcon: reverse ? startVisibility : endVisibility
    };
  });
}

function getLimit(value: SplitterSize | undefined, fallback: number, container: number) {
  return typeof value === 'string' ? getSplitterPercentage(value) * container : value ?? fallback;
}

export function resizeSplitterPanels(
  items: SplitterPanel[],
  infos: SplitterResizable[],
  cache: number[],
  moving: SplitterMovingIndex | null,
  index: number,
  offset: number,
  container: number
) {
  let confirmed: number | undefined;

  if ((!moving || !moving.confirmed) && offset !== 0) {
    if (offset > 0) {
      confirmed = index;
    } else {
      for (let candidate = index; candidate >= 0; candidate--) {
        if (cache[candidate] > 0 && infos[candidate].resizable) {
          confirmed = candidate;
          break;
        }
      }
    }
  }

  const start = confirmed ?? moving?.index ?? index;
  const end = start + 1;
  const sizes = [...cache];
  const startMin = getLimit(items[start].min, 0, container);
  const endMin = getLimit(items[end].min, 0, container);
  const startMax = getLimit(items[start].max, container, container);
  const endMax = getLimit(items[end].max, container, container);
  let delta = offset;

  if (sizes[start] + delta < startMin) delta = startMin - sizes[start];
  if (sizes[end] - delta < endMin) delta = sizes[end] - endMin;
  if (sizes[start] + delta > startMax) delta = startMax - sizes[start];
  if (sizes[end] - delta > endMax) delta = sizes[end] - endMax;

  sizes[start] += delta;
  sizes[end] -= delta;

  return {
    sizes,
    moving: confirmed === undefined ? moving : { index: confirmed, confirmed: true }
  };
}

export function collapseSplitterPanels(
  items: SplitterPanel[],
  current: number[],
  cache: number[],
  index: number,
  type: 'start' | 'end',
  reverse: boolean,
  container: number
) {
  const adjusted = reverse ? type === 'start' ? 'end' : 'start' : type;
  const start = adjusted === 'start' ? index : index + 1;
  const target = adjusted === 'start' ? index + 1 : index;
  const sizes = [...current];
  const nextCache = [...cache];
  const startSize = sizes[start];
  const targetSize = sizes[target];

  if (startSize !== 0 && targetSize !== 0) {
    sizes[start] = 0;
    sizes[target] += startSize;
    nextCache[index] = startSize;
  } else {
    const total = startSize + targetSize;
    const startMin = getLimit(items[start].min, 0, container);
    const startMax = getLimit(items[start].max, container, container);
    const targetMin = getLimit(items[target].min, 0, container);
    const targetMax = getLimit(items[target].max, container, container);
    const limitStart = Math.max(startMin, total - targetMax);
    const limitEnd = Math.min(startMax, total - targetMin);
    const half = targetMin || (limitEnd - limitStart) / 2;
    const cachedTarget = cache[index];
    const cachedCurrent = total - cachedTarget;
    const useCache = cachedTarget && cachedTarget <= targetMax && cachedTarget >= targetMin
      && cachedCurrent <= startMax && cachedCurrent >= startMin;

    if (useCache) {
      sizes[target] = cachedTarget;
      sizes[start] = cachedCurrent;
    } else {
      sizes[start] -= half;
      sizes[target] += half;
    }
  }

  return { sizes, cache: nextCache };
}

export function getSplitterAria(sizes: ReturnType<typeof getSplitterSizes>, index: number) {
  const stacks: number[] = [];
  let total = 0;

  for (const size of sizes.percentages) {
    total += size;
    stacks.push(total);
  }

  const previous = Number.isFinite(stacks[index - 1]) ? stacks[index - 1] : 0;
  const next = Number.isFinite(stacks[index + 1]) ? stacks[index + 1] : 1;

  return {
    now: stacks[index] * 100,
    min: Math.max(previous + sizes.minimums[index], next - sizes.maximums[index + 1]) * 100,
    max: Math.min(previous + sizes.maximums[index], next - sizes.minimums[index + 1]) * 100
  };
}

export function getSplitterPreviewOffset(
  container: number,
  now: number,
  min: number,
  max: number,
  offset: number
) {
  const current = container * now / 100;

  return Math.max(
    Math.max(0, container * min / 100),
    Math.min(Math.min(container, container * max / 100), current + offset)
  ) - current;
}

export function splitterAriaNumber(value: number) {
  return Number.isFinite(value) ? Math.round(value) : 0;
}

export function splitterPanelHidden(size: SplitterSize | undefined) {
  return size === 0 || typeof size === 'string' && Number.parseFloat(size) === 0;
}

export function splitterDraggerClasses(value: SplitterClassSlots['dragger']) {
  return typeof value === 'string' ? { default: value } : value ?? {};
}
