import { gridBreakpoints } from './grid.engine';
import type { GridScreenMap } from './grid.types';
import type { PaginationConfig, PaginationPosition } from './pagination.types';
import type { ListContent, ListGridType, ListKey } from './list.types';

export interface ListPaginationState extends PaginationConfig {
  current: number;
  pageSize: number;
  total: number;
  position: PaginationPosition;
}

export function listPaginationDefaults(pagination: PaginationConfig | boolean | null | undefined) {
  const props = pagination && typeof pagination === 'object' ? pagination : {};
  return { current: props.defaultCurrent || 1, pageSize: props.defaultPageSize || 10 };
}

export function listPagination(
  length: number,
  pagination: PaginationConfig | boolean | null | undefined,
  current: number,
  pageSize: number
): ListPaginationState {
  const overrides = pagination && typeof pagination === 'object'
    ? Object.fromEntries(Object.entries(pagination).filter(([, value]) => value !== undefined))
    : {};
  const props: ListPaginationState = {
    position: 'bottom',
    total: length,
    current,
    pageSize,
    ...overrides
  };
  return { ...props, current: Math.min(props.current, Math.ceil(props.total / props.pageSize)) };
}

/** Серверная порция вне локального offset сохраняется целиком, как в List 6.6.8. */
export function listPageData<T>(
  source: readonly T[],
  pagination: ListPaginationState,
  enabled: boolean
): T[] {
  const data = [...source];
  const offset = (pagination.current - 1) * pagination.pageSize;
  return enabled && data.length > offset ? data.splice(offset, pagination.pageSize) : data;
}

export function listGridColumn(grid: ListGridType, screens: GridScreenMap): number | undefined {
  const breakpoint = gridBreakpoints.find(key => screens[key]);
  return breakpoint && grid[breakpoint] ? grid[breakpoint] : grid.column;
}

export function listHasContent(value: ListContent): boolean {
  return value !== null && value !== undefined && value !== false && value !== '';
}

function contentChildren(value: ListContent): ListContent[] {
  if (Array.isArray(value)) return value.flatMap(contentChildren);
  if (value === null || value === undefined || typeof value === 'boolean') return [];
  return [value];
}

export function listMixedText(value: ListContent): boolean {
  const children = contentChildren(value);
  return children.length > 1 && children.some(child => typeof child === 'string');
}

function rowKey<T>(item: T, index: number, selector?: keyof T | ((item: T) => ListKey)): string {
  let key: unknown;
  if (typeof selector === 'function') key = selector(item);
  else if (selector) key = item[selector];
  else {
    if (item === null || item === undefined) throw new TypeError('List item requires a key source');
    if ((typeof item === 'object' || typeof item === 'function') && 'key' in item) key = item.key;
  }
  return String(key ?? `list-item-${index}`);
}

export function listRows<T>(source: readonly T[], selector?: keyof T | ((item: T) => ListKey)) {
  const occurrences = new Map<string, number>();
  return source.map((item, index) => {
    const key = rowKey(item, index, selector);
    const occurrence = occurrences.get(key) ?? 0;
    occurrences.set(key, occurrence + 1);
    // React сохраняет записи с повторными ключами; keyed each Svelte иначе бросает ошибку.
    return { item, index, key: JSON.stringify([key, occurrence]) };
  });
}
