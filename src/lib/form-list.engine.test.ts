import { describe, expect, it } from 'vitest';
import { changeFormList, syncFormListKeys } from './form-list.engine';

describe('FormList operations', () => {
  it('moves values and stable keys together without mutating the input', () => {
    const values = [{ name: 'Anna' }, { name: 'Bob' }, { name: 'Cora' }];
    const state = { keys: [0, 2, 1], nextKey: 3 };
    const moved = changeFormList(values, state, { type: 'move', from: 2, to: 0 });

    expect(moved).toEqual({
      values: [{ name: 'Cora' }, { name: 'Anna' }, { name: 'Bob' }],
      state: { keys: [1, 0, 2], nextKey: 3 }
    });
    expect(values.map((item) => item.name)).toEqual(['Anna', 'Bob', 'Cora']);
    expect(state.keys).toEqual([0, 2, 1]);
  });

  it('inserts a fresh key and removes each selected index once', () => {
    const values = ['Anna', 'Bob'];
    const initial = { keys: [0, 1], nextKey: 2 };
    const inserted = changeFormList(values, initial, { type: 'add', value: 'Cora', index: 1 })!;

    expect(inserted).toEqual({
      values: ['Anna', 'Cora', 'Bob'], state: { keys: [0, 2, 1], nextKey: 3 }
    });
    expect(changeFormList(inserted.values, inserted.state, { type: 'remove', index: [0, 0, 99] }))
      .toEqual({ values: ['Cora', 'Bob'], state: { keys: [2, 1], nextKey: 3 } });
  });

  it('keeps index keys on external replacement and allocates missing keys monotonically', () => {
    const initial = syncFormListKeys({ keys: [], nextKey: 0 }, ['Anna', 'Bob']);
    const shrunk = syncFormListKeys(initial, ['Anna']);
    const grown = syncFormListKeys(shrunk, ['Anna', 'Bob', 'Cora']);

    expect(shrunk).toBe(initial);
    expect(grown).toEqual({ keys: [0, 1, 2], nextKey: 3 });
    expect(initial.keys).toEqual([0, 1]);
  });

  it('allocates keys only for existing sparse positions and keeps them when gaps become rows', () => {
    const values: unknown[] = [];
    values[2] = 'Sparse row';
    const initial = syncFormListKeys({ keys: [], nextKey: 0 }, values);

    expect(initial.keys[2]).toBe(0);
    expect(initial.nextKey).toBe(1);
    expect(Object.hasOwn(initial.keys, 0)).toBe(false);
    expect(Object.hasOwn(initial.keys, 1)).toBe(false);

    const appended = changeFormList(values, initial, { type: 'add', value: 'Hana' })!;
    const complete = syncFormListKeys(appended.state, appended.values);

    expect(appended.values).toEqual([undefined, undefined, 'Sparse row', 'Hana']);
    expect(complete).toEqual({ keys: [2, 3, 0, 1], nextKey: 4 });
  });

  it.each([undefined, -1, 99, Number.NaN])('appends for insert index %s', (index) => {
    expect(changeFormList(['Anna'], { keys: [7], nextKey: 8 }, {
      type: 'add', value: 'Bob', index
    })).toEqual({ values: ['Anna', 'Bob'], state: { keys: [7, 8], nextKey: 9 } });
  });

  it.each([[0, 0], [-1, 0], [0, 2], [0.5, 1], [0, Number.NaN]])(
    'ignores invalid movement %s -> %s without losing a row',
    (from, to) => {
      const values = ['Anna', 'Bob'];

      expect(changeFormList(values, { keys: [0, 1], nextKey: 2 }, { type: 'move', from, to }))
        .toBeUndefined();
      expect(values).toEqual(['Anna', 'Bob']);
    }
  );

  it('adds an undefined row without coercion and ignores an empty removal', () => {
    expect(changeFormList([], { keys: [], nextKey: 0 }, { type: 'add' })).toEqual({
      values: [undefined], state: { keys: [0], nextKey: 1 }
    });
    expect(changeFormList(['Anna'], { keys: [0], nextKey: 1 }, { type: 'remove', index: [] }))
      .toBeUndefined();
  });
});
