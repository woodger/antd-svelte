import { describe, expect, it } from 'vitest';
import { virtualListScrollStep, virtualListSizes, virtualListWindow } from './virtual-list.engine';
import { treeItemHeight } from './tree-virtual.engine';

describe('virtual list window', () => {
  const rows = Array.from({ length: 8 }, (_, key) => ({ key }));
  const key = (row: { key: number; }) => row.key;

  it.each([undefined, 0])('renders every row without a bounded viewport (%s)', height => {
    expect(virtualListWindow(rows, key, new Map(), 28, height, 200, 224)).toEqual({
      useVirtual: false, virtual: false, start: 0, end: 7,
      offset: undefined, scrollHeight: undefined
    });
  });
  it('honors virtual=false even when horizontal width is provided', () => {
    expect(virtualListWindow(rows, key, new Map(), 28, 112, 0, 224, false, 700))
      .toMatchObject({ useVirtual: false, virtual: false, start: 0, end: 7 });
  });
  it('uses horizontal virtualization for a fitting dataset and keeps the previous boundary row', () => {
    expect(virtualListWindow(rows.slice(0, 3), key, new Map(), 28, 112, 0, 84, true, 700))
      .toEqual({ useVirtual: true, virtual: true, start: 0, end: 2, offset: 0, scrollHeight: 84 });
    expect(virtualListWindow(rows, key, new Map(), 28, 112, 56, 168))
      .toMatchObject({ start: 1, end: 7, offset: 28, scrollHeight: 224 });
  });
  it('recalculates an estimate change with retained measurements and the same row array', () => {
    const items = Object.freeze(Array.from({ length: 64 }, (_, key) => ({ key })));
    const heights = new Map(Array.from({ length: 6 }, (_, key) => [key, 53] as const));

    expect(virtualListWindow(items, key, heights, 28, 112, 0, 212).scrollHeight).toBe(1942);
    expect(virtualListWindow(items, key, heights, 36, 112, 0, 212).scrollHeight).toBe(2406);
  });
  it('retains removed-key measurements when deciding whether to keep virtual mode', () => {
    expect(virtualListWindow(rows.slice(0, 1), key, new Map([[999, 300]]), 28, 112, 0, 28))
      .toMatchObject({ virtual: true, start: 0, end: 0, scrollHeight: 28 });
  });
  it('preserves key identity in size queries and resolves measured offsets for both alignments', () => {
    const heights = new Map([[0, 40], [1, 30], [2, 50]]);
    const sizes = virtualListSizes(rows.slice(0, 3), key, heights, 28);

    expect(sizes.get(0)).toEqual({ top: 0, bottom: 40 });
    expect(sizes.get(2)).toEqual({ top: 70, bottom: 120 });
    expect(virtualListScrollStep(rows, key, heights, 28, 2, 'top', 11, 0, 60))
      .toEqual({ top: 59, unknown: false, align: 'top' });
    expect(virtualListScrollStep(rows, key, heights, 28, 2, 'bottom', 11, 0, 60))
      .toEqual({ top: 71, unknown: false, align: 'bottom' });
  });
});

describe('Tree virtual estimate', () => {
  it('uses paddingXS and component titleHeight with the source zero fallback', () => {
    expect(treeItemHeight({ paddingXS: 8, controlHeightSM: 24 })).toBe(28);
    expect(treeItemHeight({ paddingXS: 8, controlHeightSM: 24, Tree: { titleHeight: 32 } }))
      .toBe(36);
    expect(treeItemHeight({ paddingXS: 4, controlHeightSM: 22, Tree: { titleHeight: 0 } }))
      .toBe(24);
  });
});
