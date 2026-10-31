export interface PaginationState {
  total: number;
  current: number;
  pageSize: number;
  pageCount: number;
  range: [number, number];
}

export type PaginationItem = number | 'jump-prev' | 'jump-next';

function normalizeInteger(value: number, fallback: number, minimum: number): number {
  return Number.isFinite(value)
    ? Math.min(Number.MAX_SAFE_INTEGER, Math.max(minimum, Math.floor(value)))
    : fallback;
}

export function getPaginationState(total: number, current = 1, pageSize = 10): PaginationState {
  const normalizedTotal = normalizeInteger(total, 0, 0);
  const normalizedSize = normalizeInteger(pageSize, 10, 1);
  const pageCount = Math.max(1, Math.ceil(normalizedTotal / normalizedSize));
  const page = Math.min(pageCount, normalizeInteger(current, 1, 1));

  return {
    total: normalizedTotal,
    current: page,
    pageSize: normalizedSize,
    pageCount,
    range: normalizedTotal
      ? [(page - 1) * normalizedSize + 1, Math.min(normalizedTotal, page * normalizedSize)]
      : [0, 0]
  };
}

/** rc-pagination 1.4.0, MIT (vendor/LICENSE.rc-pagination); исходные буферы и jump boundaries. */
export function getPaginationItems(
  { current, pageCount }: Pick<PaginationState, 'current' | 'pageCount'>,
  showLessItems = false,
  showPrevNextJumpers = true
): PaginationItem[] {
  const buffer = showLessItems ? 1 : 2;
  if (pageCount <= 3 + buffer * 2) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  let start = Math.max(1, current - buffer);
  let end = Math.min(pageCount, current + buffer);

  if (current - 1 <= buffer) end = 1 + buffer * 2;
  if (pageCount - current <= buffer) start = pageCount - buffer * 2;

  const previous = showPrevNextJumpers && current - 1 >= buffer * 2 && current !== 3;
  const next = showPrevNextJumpers && pageCount - current >= buffer * 2
    && current !== pageCount - 2;
  if (!showLessItems && previous && end !== pageCount) start += 1;
  if (!showLessItems && next && start !== 1) end -= 1;
  const items: PaginationItem[] = [];

  if (start !== 1) items.push(1);
  if (previous) items.push('jump-prev');
  for (let page = start; page <= end; page++) {
    items.push(page);
  }
  if (next) items.push('jump-next');
  if (end !== pageCount) items.push(pageCount);

  return items;
}

export function getPageSizeOptions(options: readonly number[], currentSize: number): number[] {
  const valid = options.filter((size) => Number.isSafeInteger(size) && size > 0);

  return [...new Set([...valid, currentSize])].sort((left, right) => left - right);
}
