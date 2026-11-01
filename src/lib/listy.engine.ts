import type { ListyGroup, ListyKey, ListyProps, ListyScrollAlign } from './listy.types';

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
  const useVirtual = Boolean(height && estimate);
  // rc-virtual-list сохраняет измерения удалённых ключей до unmount списка.
  const cachedHeight = [...heights.values()].reduce((sum, value) => sum + value, 0);
  const virtual = useVirtual && Math.max(estimate * rows.length, cachedHeight) > (height ?? 0);

  if (!useVirtual || !virtual) {
    return {
      useVirtual,
      virtual,
      start: 0,
      end: rows.length - 1,
      offset: undefined,
      scrollHeight: useVirtual ? innerHeight : undefined
    };
  }

  let total = 0;
  let start: number | undefined;
  let end: number | undefined;
  let offset: number | undefined;
  rows.forEach((row, index) => {
    const next = total + (heights.get(row.taggedKey) ?? estimate);
    if (next >= scrollTop && start === undefined) {
      start = index;
      offset = total;
    }
    if (next > scrollTop + (height ?? 0) && end === undefined) end = index;
    total = next;
  });

  if (start === undefined) {
    start = 0;
    offset = 0;
    end = Math.ceil((height ?? 0) / estimate);
  }
  if (end === undefined) end = rows.length - 1;

  return {
    useVirtual,
    virtual,
    start,
    end: Math.min(end + 1, rows.length - 1),
    offset,
    scrollHeight: total
  };
}

export function listySizes(
  rows: readonly { taggedKey: string; }[],
  heights: ListyHeights,
  estimate: number
) {
  const sizes = new Map<string, { top: number; bottom: number; }>();
  let top = 0;
  for (const row of rows) {
    const bottom = top + (heights.get(row.taggedKey) ?? estimate);
    sizes.set(row.taggedKey, { top, bottom });
    top = bottom;
  }
  return sizes;
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
  if (index < 0) return { unknown: true, align };
  const target = Math.min(rows.length - 1, index);
  let itemTop = 0;
  let itemBottom = 0;
  for (let cursor = 0; cursor <= target; cursor++) {
    itemTop = itemBottom;
    itemBottom += heights.get(rows[cursor].taggedKey) ?? estimate;
  }

  let remaining = align === 'top' ? offset : height - offset;
  let unknown = false;
  for (let cursor = target; cursor >= 0; cursor--) {
    const measured = heights.get(rows[cursor].taggedKey);
    if (measured === undefined) { unknown = true; break; }
    remaining -= measured;
    if (remaining <= 0) break;
  }

  if (align === 'top') return { top: itemTop - offset, unknown, align };
  if (align === 'bottom') return { top: itemBottom - height + offset, unknown, align };
  if (itemTop < scrollTop) return { unknown, align: 'top' as const };
  if (itemBottom > scrollTop + height) return { unknown, align: 'bottom' as const };
  return { unknown, align };
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
