import type { ListyGroup, ListyKey, ListyProps, ListyScrollAlign } from './listy.types';
import type { GlobalToken } from './theme-component-token.types';
import { virtualListScrollStep, virtualListSizes, virtualListWindow } from './virtual-list.engine';

/** Source estimate не включает границу; фактические высоты уточняются измерением строк. */
export function listyItemHeight(token: GlobalToken): number {
  const component = { ...token, ...token.Listy };
  return component.fontHeight + (component.itemPaddingBlock ?? component.paddingSM) * 2;
}

export interface ListyItem<T> {
  type: 'item';
  taggedKey: string;
  renderKey: string;
  item: T;
  index: number;
}

export interface ListyHeader<T, K extends ListyKey> {
  type: 'group';
  taggedKey: string;
  renderKey: string;
  groupKey: K;
  items: T[];
  children: ListyItem<T>[];
}

export type ListyRow<T, K extends ListyKey> = ListyItem<T> | ListyHeader<T, K>;
export type ListyHeights = ReadonlyMap<string, number>;

export function listyTag(key: unknown, type: 'item' | 'group') {
  return `${type}:${String(key)}`;
}

export function listyRows<T, K extends ListyKey>(
  items: readonly T[],
  rowKey: ListyProps<T, K>['rowKey'],
  group?: Pick<ListyGroup<T, K>, 'key'>
) {
  const groups = new Map<K, { item: T; index: number; }[]>();
  const rows: ListyRow<T, K>[] = [];
  const occurrences = new Map<string, number>();

  function identity(taggedKey: string) {
    const occurrence = occurrences.get(taggedKey) ?? 0;
    occurrences.set(taggedKey, occurrence + 1);
    // React предупреждает о duplicate keys, но не удаляет записи; Svelte требует уникальность.
    return JSON.stringify([taggedKey, occurrence]);
  }

  function append(item: T, index: number) {
    const key = typeof rowKey === 'function' ? rowKey(item) : item[rowKey];
    const taggedKey = listyTag(key, 'item');
    const row: ListyItem<T> = {
      type: 'item', item, index, taggedKey, renderKey: identity(taggedKey)
    };
    rows.push(row);
    return row;
  }

  if (group) {
    items.forEach((item, index) => {
      const key = group.key(item);
      const segment = groups.get(key);
      if (segment) segment.push({ item, index });
      else groups.set(key, [{ item, index }]);
    });

    for (const [groupKey, segment] of groups) {
      const taggedKey = listyTag(groupKey, 'group');
      const header: ListyHeader<T, K> = {
        type: 'group',
        groupKey,
        items: segment.map(entry => entry.item),
        children: [],
        taggedKey,
        renderKey: identity(taggedKey)
      };
      rows.push(header);
      segment.forEach(entry => header.children.push(append(entry.item, entry.index)));
    }
  } else items.forEach(append);

  return rows;
}

export function listyWindow(
  rows: readonly { taggedKey: string; }[],
  heights: ListyHeights,
  estimate: number,
  height: number | undefined,
  scrollTop: number,
  innerHeight: number
) {
  return virtualListWindow(
    rows, row => row.taggedKey, heights, estimate, height, scrollTop, innerHeight
  );
}

export function listySizes(
  rows: readonly { taggedKey: string; }[],
  heights: ListyHeights,
  estimate: number
) {
  return virtualListSizes(rows, row => row.taggedKey, heights, estimate);
}

export function listySticky<T, K extends ListyKey>(
  headers: readonly ListyHeader<T, K>[],
  sizes: ReadonlyMap<string, { top: number; bottom: number; }>,
  scrollTop: number
) {
  if (!headers.length) return undefined;
  let left = 0;
  let right = headers.length - 1;
  let active = 0;
  while (left <= right) {
    const middle = Math.floor((left + right) / 2);
    if ((sizes.get(headers[middle].taggedKey)?.top ?? 0) <= scrollTop + 1) {
      active = middle;
      left = middle + 1;
    } else right = middle - 1;
  }

  const row = headers[active];
  const current = sizes.get(row.taggedKey);
  const next = headers[active + 1];
  const headerHeight = current ? current.bottom - current.top : 0;
  const top = next
    ? Math.min(0, (sizes.get(next.taggedKey)?.top ?? 0) - headerHeight - scrollTop)
    : 0;
  return { row, top };
}

export function listyScrollStep(
  rows: readonly { taggedKey: string; }[],
  heights: ListyHeights,
  estimate: number,
  index: number,
  align: ListyScrollAlign | undefined,
  offset: number,
  scrollTop: number,
  height: number
) {
  return virtualListScrollStep(
    rows, row => row.taggedKey, heights, estimate, index, align, offset, scrollTop, height
  );
}

export function listyScrollbar(size: number, range: number, offset: number) {
  const thumb = Math.floor(Math.max(size / range * size, 20));
  const top = offset === 0 || range === 0 ? 0 : offset / (range - size) * (size - thumb);
  return { thumb, top };
}

export function listyScrollbarOffset(
  thumbTop: number,
  thumbSize: number,
  size: number,
  range: number
) {
  if (range - size <= 0 || size - thumbSize <= 0) return 0;
  const percentage = Math.min(1, Math.max(0, thumbTop / (size - thumbSize)));
  return Math.ceil(percentage * (range - size));
}
