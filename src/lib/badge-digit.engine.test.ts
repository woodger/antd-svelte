import { describe, expect, it } from 'vitest';
import { getBadgeDigitState } from './badge-digit.engine';

describe('Badge digit rolling', () => {
  it.each([
    [3, 5, 10, 20, [3, 4, 5], [0, 1, 2], 'translateY(-200%)'],
    [5, 3, 20, 10, [3, 4, 5], [-2, -1, 0], 'translateY(200%)'],
    [9, 1, 9, 11, [9, 0, 1], [0, 1, 2], 'translateY(-200%)'],
    [1, 9, 11, 9, [9, 0, 1], [-2, -1, 0], 'translateY(200%)']
  ] as const)('rolls %s to %s with the source path', (from, to, previous, count, values, offsets, transform) => {
    const state = getBadgeDigitState(String(to), count, from, previous);

    expect(state.units.map(unit => unit.value)).toEqual(values);
    expect(state.units.map(unit => unit.offset)).toEqual(offsets);
    expect(state.transform).toBe(transform);
  });

  it('puts the target digit at the visible origin for every increasing and decreasing pair', () => {
    for (const direction of [-1, 1]) {
      for (let from = 0; from < 10; from++) {
        for (let to = 0; to < 10; to++) {
          const state = getBadgeDigitState(String(to), direction > 0 ? 20 : 10,
            from, direction > 0 ? 10 : 20);
          const translation = state.transform
            ? Number(state.transform.slice('translateY('.length, -2)) / 100 : 0;
          const visible = state.units.filter(unit => unit.offset + translation === 0);

          expect(visible.map(unit => String(unit.value))).toEqual([String(to)]);
          expect(state.units).toHaveLength(from === to ? 1
            : 1 + (direction > 0 ? (to - from + 10) % 10 : (from - to + 10) % 10));
          expect(state.units.every(unit => Number.isInteger(unit.offset))).toBe(true);
        }
      }
    }
  });

  it('uses absolute count direction and retains the original current-index comparison', () => {
    const ascending = getBadgeDigitState('5', -15, 3, 13);
    const descending = getBadgeDigitState('3', -13, 5, 15);

    expect(ascending.transform).toBe('translateY(-200%)');
    expect(ascending.units.some(unit => unit.current)).toBe(false);
    expect(descending.transform).toBe('translateY(200%)');
    expect(descending.units.filter(unit => unit.current).map(unit => unit.value)).toEqual([5]);
  });

  it('keeps signs and unchanged characters static and recovers from a previous NaN', () => {
    for (const character of ['-', '+', 'x', 'e', 't']) {
      expect(getBadgeDigitState(character, 12, 5, 11)).toMatchObject({
        transform: undefined,
        units: [{ value: character, offset: 0, current: true }]
      });
    }
    expect(getBadgeDigitState('7', 17, 7, 7)).toMatchObject({ transform: undefined });
    expect(getBadgeDigitState('0', 10, NaN, 9)).toMatchObject({
      transform: undefined,
      units: [{ value: '0', offset: 0, current: true }]
    });
  });
});
