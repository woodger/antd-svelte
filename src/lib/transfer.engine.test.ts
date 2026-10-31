import { describe, expect, it, vi } from 'vitest';
import {
  transferData, transferKey, transferMove, transferPaginationItems, transferRender,
  transferSelectAll, transferSelection, transferSelectRange
} from './transfer.engine';
import type { TransferItem, TransferKey } from './transfer.types';

const records = Object.freeze([
  Object.freeze({ key: 'a', title: 'Alpha' }),
  Object.freeze({ key: 'b', title: 'Beta' }),
  Object.freeze({ key: 'c', title: 'Charlie' }),
  Object.freeze({ key: 'locked', title: 'Locked', disabled: true }),
  Object.freeze({ key: 0, title: 'Number' }),
  Object.freeze({ key: '0', title: 'String' }),
  Object.freeze({ key: 9n, title: 'Bigint' })
]);

describe('Transfer source data and rendering', () => {
  it('keeps source order, target key order and distinct primitive key types', () => {
    const result = transferData(records, ['missing', '0', 'c', 9n]);

    expect(result.left.map(transferKey)).toEqual(['a', 'b', 'locked', 0]);
    expect(result.right.map(transferKey)).toEqual(['0', 'c', 9n]);
    expect(result.all[0]).toBe(records[0]);
    expect(result.right[1]).toBe(records[2]);
  });

  it('clones rowKey records without changing frozen input or requiring an index signature', () => {
    interface Record { id: number; title: string; }
    const record: Record = Object.freeze({ id: 0, title: 'Zero' });
    const result = transferData([record], [0], item => item.id);

    expect(result.right).toEqual([{ id: 0, key: 0, title: 'Zero' }]);
    expect(result.right[0]).not.toBe(record);
    expect(record).not.toHaveProperty('key');
  });

  it('requires a stable key without coercing invalid records into collisions', () => {
    expect(() => transferKey({ title: 'Missing' })).toThrow(TypeError);
    expect(transferKey({ key: '' })).toBe('');
  });

  it('defaults to blank content and title/key search text, including a numeric zero', () => {
    expect(transferRender(records).map(row => row.renderedEl)).toEqual(records.map(() => null));
    expect(transferRender([{ key: 0 }, { key: 9n }]).map(row => row.renderedText))
      .toEqual(['0', '']);
  });

  it('uses metadata value for search/title and preserves its label separately', () => {
    const result = transferRender(records, item => ({ label: `Row ${item.title}`, value: item.key
      === 'a' ? 'find me' : 'other' }), 'find');

    expect(result).toEqual([{
      item: records[0], renderedEl: 'Row Alpha', renderedText: 'find me'
    }]);
  });

  it('keeps case-sensitive includes and calls render before filtering every record', () => {
    const render = vi.fn((item: TransferItem) => item.title);

    expect(transferRender(records, render, 'alp')).toEqual([]);
    expect(render).toHaveBeenCalledTimes(records.length);
    expect(transferRender(records, render, 'Alp').map(row => row.item.key)).toEqual(['a']);
  });

  it(
    'passes the original row and physical direction to custom filters, skipping empty search',
    () => {
      const filter = vi.fn((_value, item, direction) => item.key === 0 && direction === 'right');
      const result = transferRender(records, undefined, ' ', filter, 'right');

      expect(result.map(row => row.item.key)).toEqual([0]);
      expect(filter).toHaveBeenCalledWith(' ', records[0], 'right');
      filter.mockClear();
      expect(transferRender(records, undefined, '', filter)).toHaveLength(records.length);
      expect(filter).not.toHaveBeenCalled();
    }
  );
});

describe('Transfer selection and moves', () => {
  it(
    'filters stale selections by side without dropping disabled selections or changing order',
    () => {
      expect(transferSelection(['missing', 'locked', 'a', 0, '0'], records.slice(0, 5)))
        .toEqual(['locked', 'a', 0]);
    }
  );

  it('prepends enabled moved keys and preserves unknown target keys and key identity', () => {
    const result = transferMove(['missing', 'c', '0'], ['b', 'locked', 0], records, 'right');

    expect(result).toEqual({
      targetKeys: ['b', 0, 'missing', 'c', '0'], moveKeys: ['b', 0]
    });
  });

  it('removes only moved keys from the target without removing disabled or unknown targets', () => {
    expect(transferMove(['missing', 'locked', '0', 0], ['locked', 0], records, 'left'))
      .toEqual({ targetKeys: ['missing', 'locked', '0'], moveKeys: [0] });
  });

  it('preserves selection order across union, filtered deselection and replace', () => {
    expect(transferSelectAll(['c', 'a'], ['b', 'a', 0], true)).toEqual(['c', 'a', 'b', 0]);
    expect(transferSelectAll(['c', 'a', 'b'], ['a'], false)).toEqual(['c', 'b']);
    expect(transferSelectAll(['c'], [0, 'a'], 'replace')).toEqual([0, 'a']);
  });

  it('selects a partially selected Shift range and removes a completely selected range', () => {
    const keys: TransferKey[] = ['a', 'b', 'c', 0];
    const first = transferSelectRange(['a'], keys, 0, 2);
    const second = transferSelectRange(first.selected, keys, first.anchor, 0);

    expect(first).toEqual({ selected: ['a', 'b', 'c'], anchor: 2 });
    expect(second).toEqual({ selected: [], anchor: null });
  });

  it(
    'retains selected keys outside a reverse range and starts at the clicked row after reset',
    () => {
      expect(transferSelectRange(['outside', 'c'], ['a', 'b', 'c'], 2, 0))
        .toEqual({ selected: ['outside', 'c', 'a', 'b'], anchor: 2 });
      expect(transferSelectRange(['outside'], ['a', 'b', 'c'], null, 1))
        .toEqual({ selected: ['outside', 'b'], anchor: 1 });
    }
  );
});

describe('Transfer rc-pagination page boundaries', () => {
  it('uses the upstream seven-page threshold rather than the existing Pagination threshold', () => {
    expect(transferPaginationItems(1, 7, false)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(transferPaginationItems(1, 8, false)).toEqual([1, 2, 3, 4, 5, 'jump-next', 8]);
  });

  it('keeps both end pages and source jump placement around the current page', () => {
    expect(transferPaginationItems(6, 15, false))
      .toEqual([1, 'jump-prev', 5, 6, 7, 'jump-next', 15]);
    expect(transferPaginationItems(14, 15, false))
      .toEqual([1, 'jump-prev', 11, 12, 13, 14, 15]);
  });

  it('uses one-page buffers and three-page jumps for showLessItems', () => {
    expect(transferPaginationItems(4, 15, true))
      .toEqual([1, 'jump-prev', 3, 4, 5, 'jump-next', 15]);
    expect(transferPaginationItems(1, 6, true)).toEqual([1, 2, 3, 'jump-next', 6]);
  });
});
