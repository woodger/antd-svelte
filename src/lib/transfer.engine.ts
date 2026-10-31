import type {
  TransferContent, TransferDirection, TransferKey, TransferRenderedItem, TransferRenderResult
} from './transfer.types';

export function transferKey(record: object): TransferKey {
  if ('key' in record && ['string', 'number', 'bigint'].includes(typeof record.key)) {
    return record.key as TransferKey;
  }

  throw new TypeError('Transfer records require a string, number or bigint key, or rowKey.');
}

export function transferDisabled(record: object): boolean {
  return 'disabled' in record && Boolean(record.disabled);
}

export function transferData<RecordType extends object>(
  dataSource: readonly RecordType[],
  targetKeys: readonly TransferKey[],
  rowKey?: (record: RecordType) => TransferKey
): { all: RecordType[]; left: RecordType[]; right: RecordType[]; } {
  const all = dataSource.map(record => rowKey ? { ...record, key: rowKey(record) } : record);
  const targets = new Map(targetKeys.map((key, index) => [key, index]));
  const left: RecordType[] = [];
  const right: (RecordType | undefined)[] = Array.from({ length: targetKeys.length });

  for (const record of all) {
    const index = targets.get(transferKey(record));

    if (index === undefined) left.push(record);
    else right[index] = record;
  }

  return { all, left, right: right.filter((record): record is RecordType => record !== undefined) };
}

export function transferSelection(
  selectedKeys: readonly TransferKey[],
  records: readonly object[]
): TransferKey[] {
  const keys = new Set(records.map(transferKey));
  return selectedKeys.filter(key => keys.has(key));
}

export function transferRender<RecordType extends object>(
  records: readonly RecordType[],
  render?: (record: RecordType) => TransferRenderResult<RecordType>,
  search = '',
  filterOption?: (value: string, record: RecordType, direction: TransferDirection) => boolean,
  direction: TransferDirection = 'left'
): TransferRenderedItem<RecordType>[] {
  const result: TransferRenderedItem<RecordType>[] = [];

  for (const item of records) {
    const rendered = render?.(item) ?? null;
    let renderedEl: TransferContent<[RecordType]>;
    let renderedText: string;

    if (typeof rendered === 'object' && rendered !== null) {
      renderedEl = rendered.label;
      renderedText = rendered.value;
    } else {
      renderedEl = rendered;
      const text = [rendered, 'title' in item ? item.title : undefined, transferKey(item)]
        .find(value => typeof value === 'string' || typeof value === 'number');
      renderedText = text === undefined ? '' : String(text);
    }

    if (!search || (filterOption
      ? filterOption(search, item, direction)
      : renderedText.includes(search))) {
      result.push({ item, renderedEl, renderedText });
    }
  }

  return result;
}

export function transferMove(
  targetKeys: readonly TransferKey[],
  selectedKeys: readonly TransferKey[],
  records: readonly object[],
  direction: TransferDirection
): { targetKeys: TransferKey[]; moveKeys: TransferKey[]; } {
  const disabled = new Map(records.map(item => [transferKey(item), transferDisabled(item)]));
  const moveKeys = selectedKeys.filter(key => !disabled.get(key));
  const moved = new Set(moveKeys);

  return {
    targetKeys: direction === 'right'
      ? [...moveKeys, ...targetKeys]
      : targetKeys.filter(key => !moved.has(key)),
    moveKeys
  };
}

export function transferSelectAll(
  selected: readonly TransferKey[],
  keys: readonly TransferKey[],
  checked: boolean | 'replace'
): TransferKey[] {
  if (checked === 'replace') return [...keys];
  if (checked) return [...new Set([...selected, ...keys])];

  const removed = new Set(keys);
  return selected.filter(key => !removed.has(key));
}

/** Диапазон меняет действие на удаление, только если выделены все его enabled строки. */
export function transferSelectRange(
  selected: readonly TransferKey[],
  keys: readonly TransferKey[],
  previous: number | null,
  current: number
): { selected: TransferKey[]; anchor: number | null; } {
  const start = Math.min(previous ?? current, current);
  const end = Math.max(previous ?? current, current);
  const range = keys.slice(start, end + 1);
  const next = new Set(selected);
  const add = range.some(key => !next.has(key));

  for (const key of range) {
    if (add) next.add(key);
    else next.delete(key);
  }

  return { selected: [...next], anchor: add ? end : null };
}

/** rc-pagination 1.4.0, MIT (vendor/LICENSE.rc-pagination); границы showLessItems сохранены. */
export function transferPaginationItems(
  current: number,
  count: number,
  less: boolean
): (number | 'jump-prev' | 'jump-next')[] {
  const buffer = less ? 1 : 2;
  if (count <= 3 + buffer * 2) return Array.from({ length: count }, (_, index) => index + 1);

  let left = Math.max(1, current - buffer);
  let right = Math.min(current + buffer, count);

  if (current - 1 <= buffer) right = 1 + buffer * 2;
  if (count - current <= buffer) left = count - buffer * 2;

  const previous = current - 1 >= buffer * 2 && current !== 3;
  const next = count - current >= buffer * 2 && current !== count - 2;

  if (!less && previous && right !== count) left += 1;
  if (!less && next && left !== 1) right -= 1;

  const result: (number | 'jump-prev' | 'jump-next')[] = [];
  if (left !== 1) result.push(1);
  if (previous) result.push('jump-prev');
  for (let page = left; page <= right; page++) result.push(page);
  if (next) result.push('jump-next');
  if (right !== count) result.push(count);

  return result;
}
