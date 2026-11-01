import { describe, expect, it } from 'vitest';
import {
  listyRows,
  listyScrollbar,
  listyScrollbarOffset,
  listyScrollStep,
  listySizes,
  listySticky,
  listyTag,
  listyWindow
} from './listy.engine';

describe('Listy grouping and identity', () => {
  it('groups noncontiguous records in first-seen order and keeps source indexes', () => {
    const items = [
      { id: 'one', group: 0 },
      { id: 'two', group: '' },
      { id: 'three', group: 0 }
    ];

    const rows = listyRows(items, 'id', { key: item => item.group });

    expect(rows.map(row => row.taggedKey)).toEqual([
      'group:0', 'item:one', 'item:three', 'group:', 'item:two'
    ]);
    expect(rows.filter(row => row.type === 'item').map(row => row.index)).toEqual([0, 2, 1]);
    expect(rows[0]).toMatchObject({ items: [items[0], items[2]] });
    expect(rows[1].type === 'item' && rows[1].item).toBe(items[0]);
    expect(items.map(item => item.id)).toEqual(['one', 'two', 'three']);
  });

  it('distinguishes numeric and string group keys while retaining duplicate records', () => {
    const items = [{ id: 0, group: 1 }, { id: 0, group: '1' }];

    const rows = listyRows(items, 'id', { key: item => item.group });

    expect(rows.filter(row => row.type === 'group').map(row => row.groupKey)).toEqual([1, '1']);
    expect(rows.filter(row => row.type === 'item')).toHaveLength(2);
    expect(new Set(rows.map(row => row.renderKey)).size).toBe(4);
  });

  it('keeps zero, empty, bigint and delimiter keys without an index fallback', () => {
    const rows = listyRows([0, '', 9n, 'group:a:"b'], item => item);

    expect(rows.map(row => row.taggedKey)).toEqual([
      'item:0', 'item:', 'item:9', 'item:group:a:"b'
    ]);
    expect(listyTag('item:a', 'group')).toBe('group:item:a');
    expect(listyRows([{ id: undefined }], 'id')[0].taggedKey).toBe('item:undefined');
  });
});

describe('Listy virtual window', () => {
  const rows = Array.from({ length: 20 }, (_, index) => ({ taggedKey: `item:${index}` }));

  it('renders the estimated viewport and one overscan row before measurements', () => {
    const range = listyWindow(rows, new Map(), 46, 200, 0, 0);

    expect(range).toEqual({
      useVirtual: true, virtual: true, start: 0, end: 5, offset: 0, scrollHeight: 920
    });
  });

  it('includes the preceding row exactly at a bottom boundary', () => {
    expect(listyWindow(rows, new Map(), 46, 200, 46, 0)).toMatchObject({ start: 0, offset: 0 });
    expect(listyWindow(rows, new Map(), 46, 200, 47, 0)).toMatchObject({ start: 1, offset: 46 });
  });

  it('uses measured variable heights and preserves zero-height entries', () => {
    const heights = new Map([['item:0', 0], ['item:1', 90], ['item:2', 12]]);

    const range = listyWindow(rows, heights, 46, 100, 91, 0);
    const sizes = listySizes(rows, heights, 46);

    expect(range).toMatchObject({ start: 2, offset: 90, end: 5, scrollHeight: 884 });
    expect(sizes.get('item:0')).toEqual({ top: 0, bottom: 0 });
    expect(sizes.get('item:2')).toEqual({ top: 90, bottom: 102 });
  });

  it.each([undefined, 0])('renders every row without a truthy height (%s)', height => {
    expect(listyWindow(rows, new Map(), 46, height, 500, 920)).toEqual({
      useVirtual: false, virtual: false, start: 0, end: 19,
      offset: undefined, scrollHeight: undefined
    });
  });

  it('uses the inner height for a fitting dataset', () => {
    expect(listyWindow(rows.slice(0, 2), new Map(), 46, 200, 0, 94)).toEqual({
      useVirtual: true, virtual: false, start: 0, end: 1, offset: undefined, scrollHeight: 94
    });
  });

  it('keeps virtual mode when retained measurements exceed a reduced dataset', () => {
    const heights = new Map([['removed', 1000]]);

    expect(listyWindow(rows.slice(0, 1), heights, 46, 200, 900, 47)).toEqual({
      useVirtual: true, virtual: true, start: 0, end: 0, offset: 0, scrollHeight: 46
    });
    expect(listyWindow([], heights, 46, 200, 900, 0)).toMatchObject({
      virtual: true, start: 0, end: -1, scrollHeight: 0
    });
  });

  it('clamps overscan at the final row', () => {
    expect(listyWindow(rows, new Map(), 46, 200, 850, 0)).toMatchObject({
      start: 18, end: 19, offset: 828
    });
  });
});

describe('Listy scroll alignment', () => {
  const rows = [0, 1, 2, 3].map(index => ({ taggedKey: `item:${index}` }));
  const heights = new Map([['item:0', 38], ['item:1', 47], ['item:2', 70], ['item:3', 47]]);

  it('aligns a measured item below a sticky header or above the bottom offset', () => {
    expect(listyScrollStep(rows, heights, 46, 2, 'top', 38, 0, 100)).toEqual({
      top: 47, unknown: false, align: 'top'
    });
    expect(listyScrollStep(rows, heights, 46, 2, 'bottom', 10, 0, 100)).toEqual({
      top: 65, unknown: false, align: 'bottom'
    });
  });

  it('resolves auto only when the target lies outside the viewport', () => {
    expect(listyScrollStep(rows, heights, 46, 0, 'auto', 0, 50, 100)).toEqual({
      unknown: false, align: 'top'
    });
    expect(listyScrollStep(rows, heights, 46, 2, undefined, 0, 0, 100)).toEqual({
      unknown: false, align: 'bottom'
    });
    expect(listyScrollStep(rows, heights, 46, 1, 'auto', 0, 0, 100)).toEqual({
      unknown: false, align: 'auto'
    });
  });

  it('requests another measurement for an unmeasured target with zero top offset', () => {
    expect(listyScrollStep(rows, new Map(), 46, 2, 'top', 0, 0, 100)).toEqual({
      top: 92, unknown: true, align: 'top'
    });
  });

  it('waits for missing keys without deriving a position from an empty prefix', () => {
    expect(listyScrollStep(rows, heights, 46, -1, 'top', 0, 100, 100)).toEqual({
      unknown: true, align: 'top'
    });
    expect(listyScrollStep(rows, heights, 46, -1, 'bottom', 10, 100, 100)).toEqual({
      unknown: true, align: 'bottom'
    });
  });
});

describe('Listy sticky groups', () => {
  const rows = listyRows([
    { id: 1, group: 'first' }, { id: 2, group: 0 }, { id: 3, group: '' }
  ], 'id', { key: item => item.group });
  const headers = rows.filter(row => row.type === 'group');
  const sizes = listySizes(rows, new Map(), 40);

  it('uses header positions with one-pixel tolerance rather than the visible row index', () => {
    expect(listySticky(headers, sizes, 78.9)?.row.groupKey).toBe('first');
    expect(listySticky(headers, sizes, 79)?.row.groupKey).toBe(0);
  });

  it('pushes a header out for a following zero or empty group key', () => {
    expect(listySticky(headers, sizes, 60)).toMatchObject({
      row: { groupKey: 'first' }, top: -20
    });
    expect(listySticky(headers, sizes, 140)).toMatchObject({ row: { groupKey: 0 }, top: -20 });
    expect(listySticky(headers, sizes, 180)).toMatchObject({ row: { groupKey: '' }, top: 0 });
    expect(listySticky([], sizes, 0)).toBeUndefined();
  });
});

describe('Listy scrollbar geometry', () => {
  it('uses the source minimum thumb and proportional position', () => {
    expect(listyScrollbar(200, 1000, 400)).toEqual({ thumb: 40, top: 80 });
    expect(listyScrollbar(200, 10000, 0)).toEqual({ thumb: 20, top: 0 });
    expect(listyScrollbar(10, 1000, 0)).toEqual({ thumb: 20, top: 0 });
  });

  it('centers track clicks, rounds upward and clamps both ends', () => {
    expect(listyScrollbarOffset(81, 40, 200, 1000)).toBe(405);
    expect(listyScrollbarOffset(-100, 40, 200, 1000)).toBe(0);
    expect(listyScrollbarOffset(1000, 40, 200, 1000)).toBe(800);
    expect(listyScrollbarOffset(1, 20, 10, 1000)).toBe(0);
  });
});
