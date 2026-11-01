import { createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';
import {
  listGridColumn,
  listHasContent,
  listMixedText,
  listPageData,
  listPagination,
  listPaginationDefaults,
  listRows
} from './list.engine';

describe('List pagination', () => {
  it('reads truthy defaults and keeps source fallbacks for zero values', () => {
    expect(listPaginationDefaults({ defaultCurrent: 2, defaultPageSize: 3 }))
      .toEqual({ current: 2, pageSize: 3 });
    expect(listPaginationDefaults({ defaultCurrent: 0, defaultPageSize: 0 }))
      .toEqual({ current: 1, pageSize: 10 });
    expect(listPaginationDefaults(null)).toEqual({ current: 1, pageSize: 10 });
  });

  it('ignores undefined overrides while preserving local paging state', () => {
    const state = listPagination(11, {
      current: undefined,
      pageSize: undefined,
      total: undefined,
      position: undefined,
      align: undefined
    }, 2, 3);

    expect(state).toEqual({ total: 11, current: 2, pageSize: 3, position: 'bottom' });
  });

  it('gives controlled props priority and clamps only the upper page boundary', () => {
    expect(listPagination(11, { current: 8, pageSize: 3, total: 10 }, 2, 5))
      .toMatchObject({ current: 4, pageSize: 3, total: 10 });
    expect(listPagination(11, { current: 0, pageSize: 3 }, 2, 5).current).toBe(0);
    expect(listPagination(0, true, 2, 10).current).toBe(0);
  });

  it('slices frozen local data without changing the source', () => {
    const source = Object.freeze(['A', 'B', 'C', 'D']);
    const page = listPagination(source.length, { pageSize: 3, current: 2 }, 1, 10);

    expect(listPageData(source, page, true)).toEqual(['D']);
    expect(source).toEqual(['A', 'B', 'C', 'D']);
  });

  it('retains a server page when the configured offset exceeds the supplied data', () => {
    const page = listPagination(2, { current: 4, pageSize: 10, total: 100 }, 1, 10);

    expect(listPageData(['Server A', 'Server B'], page, true))
      .toEqual(['Server A', 'Server B']);
  });

  it('returns all records with pagination off and preserves source negative splice offsets', () => {
    const page = listPagination(4, { current: 0, pageSize: 2 }, 1, 10);

    expect(listPageData([0, 1, 2, 3], page, false)).toEqual([0, 1, 2, 3]);
    expect(listPageData([0, 1, 2, 3], page, true)).toEqual([2, 3]);
  });
});

describe('listGridColumn', () => {
  it('uses the largest active breakpoint rather than the nearest configured one', () => {
    const grid = { column: 2, sm: 4, md: 6 };

    expect(listGridColumn(grid, { sm: true, md: true, xl: true })).toBe(2);
    expect(listGridColumn(grid, { sm: true, md: true })).toBe(6);
  });

  it('uses the base column during SSR and for falsy responsive values', () => {
    expect(listGridColumn({ column: 3, xs: 1 }, {})).toBe(3);
    expect(listGridColumn({ column: 3, xl: 0 }, { xl: true })).toBe(3);
    expect(listGridColumn({ xs: 1 }, {})).toBeUndefined();
    expect(listGridColumn({ xxxl: 8 }, { xxxl: true, xxl: true })).toBe(8);
  });
});

describe('List content', () => {
  it('preserves zero and true presence while removing source empty values', () => {
    expect([0, true, []].map(listHasContent)).toEqual([true, true, true]);
    expect([false, '', null, undefined].map(listHasContent)).toEqual([false, false, false, false]);
  });

  it('detects mixed strings without treating numeric children or booleans as text', () => {
    const child = createRawSnippet(() => ({ render: () => '<span>child</span>' }));

    expect(listMixedText(['I am ', [child, ' text']])).toBe(true);
    expect(listMixedText(['', child])).toBe(true);
    expect(listMixedText([0, child])).toBe(false);
    expect(listMixedText([false, null, 'Only text'])).toBe(false);
    expect(listMixedText(child)).toBe(false);
  });
});

describe('listRows', () => {
  it('preserves zero and empty keys across reordering', () => {
    const source = [{ key: 0 }, { key: '' }, { key: 2n }];
    const original = listRows(source);
    const reversed = listRows([...source].reverse());

    expect(reversed.map(row => row.key)).toEqual(original.map(row => row.key).reverse());
    expect(new Set(original.map(row => row.key)).size).toBe(3);
  });

  it('accepts a key field, function and primitive data with page-local fallback indices', () => {
    const source = [{ id: 0 }, { id: '' }];
    const fields = listRows(source, 'id');
    const callbacks = listRows([...source].reverse(), item => item.id);

    expect(callbacks.map(row => row.key)).toEqual(fields.map(row => row.key).reverse());
    expect(listRows(['A', 'B']).map(row => row.key))
      .toEqual(listRows(['Other A', 'Other B']).map(row => row.key));
  });

  it('retains duplicate source records without a fatal Svelte duplicate-key error', () => {
    const rows = listRows([{ key: 0 }, { key: '0' }, { key: 0 }]);

    expect(rows).toHaveLength(3);
    expect(new Set(rows.map(row => row.key)).size).toBe(3);
  });
});
