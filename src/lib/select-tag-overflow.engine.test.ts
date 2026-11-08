import { describe, expect, it } from 'vitest';
import reference from '../../tests/browser/fixtures/ant-design-select-tag-count-reference.json';
import { getResponsiveTagCount, getSelectTagOverflow } from './select-tag-overflow.engine';
import type { SelectOption } from './types';

describe('Select numeric tag count source boundaries', () => {
  for (const entry of reference.cases.filter(entry => entry.sample.count !== 'responsive')) {
    it(`retains source visible tag order for ${entry.sample.id}`, () => {
      const sample = entry.sample;
      const tags = sample.values.map(value => sample.options.find(option => option.value === value)!);
      const count = sample.count === 'nan' ? Number.NaN
        : sample.count === 'infinity' ? Number.POSITIVE_INFINITY
          : typeof sample.count === 'number' ? sample.count : undefined;
      const result = getSelectTagOverflow<string | number>(tags, count);
      const expected = sample.id === 'nan' ? sample.options.map(option => option.label)
        : entry.tags.filter(tag => sample.options.some(option => option.label === tag.title))
          .map(tag => tag.title);

      expect(result.visible.map(tag => tag.label)).toEqual(expected);
      if ('omitted' in entry) {
        expect(JSON.parse(JSON.stringify(result.omitted))).toEqual(entry.omitted);
      }
    });
  }

  it('preserves frozen owner values and keeps numeric/string keys in fresh omitted records', () => {
    const options: readonly SelectOption<string | number>[] = Object.freeze([
      Object.freeze({ value: 0, label: 'Number' }),
      Object.freeze({ value: '0', label: 'String', disabled: true })
    ]);
    const result = getSelectTagOverflow(options, 0);

    expect(result.visible).toEqual([]);
    expect(result.omitted).toEqual([
      { value: 0, key: 0, label: 'Number', disabled: undefined },
      { value: '0', key: '0', label: 'String', disabled: true }
    ]);
    result.omitted[0].label = 'Owner override';
    expect(options[0].label).toBe('Number');
    expect(getSelectTagOverflow(options).visible).toBe(options);
    expect(getSelectTagOverflow(options, Number.NaN).visible).toBe(options);
  });

  it('fits every tag before reserving rest and otherwise finds the largest fitting prefix', () => {
    expect(getResponsiveTagCount([50, 60, 40], 150, 1000)).toBe(3);
    expect(getResponsiveTagCount([50, 60, 40], 140, 20)).toBe(2);
    expect(getResponsiveTagCount([50, 60, 40], 100, 20)).toBe(1);
    expect(getResponsiveTagCount([50], 49, 20)).toBe(0);
    expect(getResponsiveTagCount([], 0, 20)).toBe(0);
  });
});
