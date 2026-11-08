import { describe, expect, it } from 'vitest';
import reference from '../../tests/browser/fixtures/ant-design-select-max-count-reference.json';
import { getSelectLimitOptions, isSelectCountReached } from './select.engine';
import { resolveSelectTokenOptions, splitSelectTokens } from './select-token.engine';
import type { SelectOption } from './types';

describe('Select maximum count source boundaries', () => {
  const options: readonly SelectOption<string | number>[] = [
    { value: 'a', label: 'Alpha' },
    { value: 'locked', label: 'Locked', disabled: true },
    { value: 0, label: 'Zero' }
  ];

  for (const entry of reference.cases.filter(entry => entry.result.open
    && !entry.sample.id.startsWith('controlled-query'))) {
    it(`retains source option eligibility for ${entry.sample.id}`, () => {
      const limit = entry.sample.limit === 'nan' ? Number.NaN
        : entry.sample.limit === 'infinity' ? Number.POSITIVE_INFINITY
          : entry.sample.limit as number;
      const selected = new Set(entry.result.values);
      const filled = [...options];
      for (const value of entry.result.values) {
        if (!filled.some(option => option.value === value)) {
          filled.push({ value, label: String(value) });
        }
      }

      expect(getSelectLimitOptions(filled, selected, limit).map(option => ({
        ...option, disabled: Boolean(option.disabled)
      }))).toEqual(entry.result.options);
    });
  }

  for (const entry of reference.cases.filter(entry => entry.sample.id.endsWith('-cap'))) {
    it(`caps raw separated input before deduplication for ${entry.sample.id}`, () => {
      const sample = entry.sample;
      const limit = sample.limit as number;
      const values = new Set<string | number>('values' in sample ? sample.values : []);
      const separators = 'separators' in sample ? sample.separators
        : (text: string) => text.split(',');
      const words = splitSelectTokens('text' in sample ? sample.text ?? '' : '',
        separators, limit - values.size);
      const additions = resolveSelectTokenOptions(options, words ?? [],
        !('mode' in sample && sample.mode === 'multiple'));
      for (const option of additions) values.add(option.value);

      expect([...values]).toEqual(entry.result.values);
    });
  }

  it('blocks only new enabled options and preserves original selected/disabled references', () => {
    const owned = Object.freeze(options.map(option => Object.freeze(option)));
    const selected = new Set<string | number>(['a']);
    const limited = getSelectLimitOptions(owned, selected, 1);

    expect(limited[0]).toBe(owned[0]);
    expect(limited[1]).toBe(owned[1]);
    expect(limited[2]).toEqual({ value: 0, label: 'Zero', disabled: true });
    expect(owned[2].disabled).toBeUndefined();
    expect(getSelectLimitOptions(owned, selected, 2)).toBe(owned);
    expect(getSelectLimitOptions(owned, selected)).toBe(owned);
    expect(getSelectLimitOptions(owned, selected, Number.NaN)).toBe(owned);
  });

  it('preserves source zero/negative/infinite and fractional numeric boundaries', () => {
    expect(isSelectCountReached(0, 0)).toBe(true);
    expect(isSelectCountReached(0, -1)).toBe(true);
    expect(isSelectCountReached(1, 1.5)).toBe(false);
    expect(isSelectCountReached(2, 1.5)).toBe(true);
    expect(isSelectCountReached(3, Number.POSITIVE_INFINITY)).toBe(false);
    expect(isSelectCountReached(3, Number.NaN)).toBe(false);
    expect(splitSelectTokens('a,a,b', [','], 2)).toEqual(['a', 'a']);
    expect(splitSelectTokens('a,b,c', text => text.split(','), 2)).toEqual(['a', 'b']);
  });
});
