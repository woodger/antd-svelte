import { describe, expect, it } from 'vitest';
import {
  getCheckboxGroupOptions,
  getCheckboxGroupValue,
  toggleCheckboxGroupChildren
} from './checkbox-group.engine';
import type { CheckboxGroupOption, CheckboxGroupValue } from './checkbox-group.types';

describe('getCheckboxGroupOptions', () => {
  it('ignores nullish entries and values from untyped callers while keeping numeric zero', () => {
    const invalid = [
      { value: null, label: 'Null' },
      { value: undefined, label: 'Undefined' }
    ] as unknown as CheckboxGroupOption<number>[];

    expect(getCheckboxGroupOptions([null, undefined, ...invalid, 0]))
      .toEqual([{ value: 0, label: '0' }]);
  });

  it('normalizes primitive options while preserving typed values and disabled choices', () => {
    const locked = { value: 'locked', label: 'Locked', disabled: true };
    const options = Object.freeze([0, false, 'zero', locked]);

    expect(getCheckboxGroupOptions<CheckboxGroupValue>(options)).toEqual([
      { value: 0, label: '0' },
      { value: false, label: 'false' },
      { value: 'zero', label: 'zero' },
      locked
    ]);
    expect(options).toEqual([0, false, 'zero', locked]);
  });

  it('keeps the first duplicate without conflating zero or false with strings', () => {
    const result = getCheckboxGroupOptions<CheckboxGroupValue>(
      [0, '0', false, 'false', { value: 0, label: 'Duplicate zero' }, false]
    );

    expect(result.map((option) => option.value)).toEqual([0, '0', false, 'false']);
    expect(result[0].label).toBe('0');
  });
});

describe('toggleCheckboxGroupChildren', () => {
  it('keeps selected insertion order instead of sorting children by their DOM registration', () => {
    expect(toggleCheckboxGroupChildren([2], 1, [1, 2]))
      .toEqual({ value: [2, 1], callbackValue: [2, 1] });
    expect(toggleCheckboxGroupChildren([2, 1], 2, [1, 2]))
      .toEqual({ value: [1], callbackValue: [1] });
  });

  it('retains removed values in the raw state while filtering only the callback', () => {
    const owner = Object.freeze([1]);

    expect(toggleCheckboxGroupChildren(owner, 2, [2]))
      .toEqual({ value: [1, 2], callbackValue: [2] });
    expect(owner).toEqual([1]);
    expect(toggleCheckboxGroupChildren([1], 1, [])).toEqual({ value: [], callbackValue: [] });
  });

  it('uses source array membership for duplicate values and preserves distinct primitive types', () => {
    expect(toggleCheckboxGroupChildren([1, 1], 1, [1]))
      .toEqual({ value: [1], callbackValue: [1] });
    expect(toggleCheckboxGroupChildren<CheckboxGroupValue>([0, false], '0', [0, false, '0']))
      .toEqual({ value: [0, false, '0'], callbackValue: [0, false, '0'] });
  });
});

describe('getCheckboxGroupValue', () => {
  const options: CheckboxGroupOption<number>[] = [
    { value: 0, label: 'Zero' },
    { value: 1, label: 'Locked', disabled: true },
    { value: 2, label: 'Two' }
  ];

  it('returns current choices in option order and retains selected disabled values', () => {
    expect(getCheckboxGroupValue(options, [2, 99, 1, 0, 2])).toEqual([0, 1, 2]);
    expect(getCheckboxGroupValue([], [0])).toEqual([]);
  });

  it('does not mutate or alias readonly owner values', () => {
    const value = Object.freeze([2, 0, 2]);
    const result = getCheckboxGroupValue(options, value);
    result.push(1);

    expect(value).toEqual([2, 0, 2]);
    expect(result).toEqual([0, 2, 1]);
  });
});
