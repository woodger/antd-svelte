import { describe, expect, it } from 'vitest';
import reference from '../../tests/browser/fixtures/ant-design-select-token-separators-reference.json';
import { resolveSelectTokenOptions, splitSelectTokens } from './select-token.engine';
import type { SelectOption } from './types';

const options: readonly SelectOption<string | number>[] = [
  { value: 'a', label: 'Alpha' },
  { value: 'locked', label: 'Locked', disabled: true },
  { value: 0, label: 'Zero' }
];

describe('Select token separation source boundaries', () => {
  for (const entry of reference.cases) {
    it(`resolves source separated values for ${entry.sample.id}`, () => {
      const sample = entry.sample;
      const separators = 'separators' in sample ? sample.separators
        : 'splitter' in sample && sample.splitter === 'csv' ? (text: string) => text.split(',')
          : 'splitter' in sample && sample.splitter === 'spaces' ? (text: string) => text.split(/\s+/)
            : 'splitter' in sample && sample.splitter === 'empty' ? () => []
              : (text: string) => [text];
      const words = splitSelectTokens(sample.text, separators);
      const values = new Set<string | number>('values' in sample ? sample.values : []);
      if (words !== null) {
        const multiple = 'mode' in sample && sample.mode === 'multiple';
        const fields = 'optionFilterProp' in sample ? sample.optionFilterProp : undefined;
        for (const option of resolveSelectTokenOptions(options, words, !multiple, fields)) {
          values.add(option.value);
        }
      }
      const corrected = ['multiple-disabled', 'multiple-explicit-value', 'whitespace-token']
        .includes(sample.id);
      const expected = corrected ? entry.result.values.filter(value => value !== 'locked'
        && value !== '   ') : entry.result.values;

      expect([...values]).toEqual(expected);
    });
  }

  it('preserves raw segments and delimiter order without mutating the owner array', () => {
    const separators = Object.freeze([',', '::']);

    expect(splitSelectTokens(' a,::b::', separators)).toEqual([' a', 'b']);
    expect(splitSelectTokens('a,b', ['', ','])).toBeNull();
    expect(splitSelectTokens(',,', [','])).toEqual([]);
    expect(splitSelectTokens('a', [])).toBeNull();
    expect(separators).toEqual([',', '::']);
  });

  it('distinguishes numeric values, raw labels, explicit fields and last duplicate labels', () => {
    const duplicates = [...options, { value: 'last', label: 'Alpha' }];

    expect(resolveSelectTokenOptions(duplicates, ['Alpha', '0'], false))
      .toEqual([{ value: 'last', label: 'Alpha' }]);
    expect(resolveSelectTokenOptions(options, ['0', 'a'], false, ['value']))
      .toEqual([options[0]]);
    expect(resolveSelectTokenOptions(options, ['Zero'], false)).toEqual([options[2]]);
    expect(resolveSelectTokenOptions(options, ['0'], true)).toEqual([{ value: '0', label: '0' }]);
  });

  it('rejects implicit blank tags while accepting explicit whitespace options and padded values', () => {
    const explicit = { value: ' ', label: 'Space' };

    expect(resolveSelectTokenOptions([explicit], [' ', '   ', ' padded '], true))
      .toEqual([explicit, { value: ' padded ', label: ' padded ' }]);
  });

  it('ignores inherited option fields and disabled additions in both modes', () => {
    const inherited = Object.assign(Object.create({ alias: 'Alias' }), options[0]);

    expect(resolveSelectTokenOptions([inherited], ['Alias'], false, 'alias')).toEqual([]);
    expect(resolveSelectTokenOptions(options, ['Locked'], false)).toEqual([]);
    expect(resolveSelectTokenOptions(options, ['locked'], true)).toEqual([]);
  });
});
