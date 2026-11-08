import { describe, expect, it } from 'vitest';
import reference from '../../tests/browser/fixtures/ant-design-select-tags-options-reference.json';
import { resolveSelectedOptions } from './select.engine';
import { getSelectTagOptions } from './select-tags.engine';
import type { SelectOption } from './types';

describe('Select tag option source boundaries', () => {
  it('pins the official renderer and studied dependency without the deprecated tags prop', () => {
    expect(reference.reference.version).toBe('6.6.8');
    expect(reference.reference.revision).toBe('984592267de88fbf9cdaecc96a56629e721c709d');
    expect(reference.reference.rcSelectStudyVersion).toBe('1.10.1');
    expect(reference.cases).toHaveLength(28);
  });

  for (const entry of reference.cases) {
    it(`resolves source tag options for ${entry.sample.id}`, () => {
      const options: readonly SelectOption<string | number>[] = entry.sample.options;
      const selected = resolveSelectedOptions(entry.sample.values,
        new Map(options.map(option => [option.value, option])), new Map());
      const filter = 'filter' in entry.sample ? entry.sample.filter : undefined;
      const predicate = filter === 'none' ? () => false
        : filter === 'label' ? (search: string, option: SelectOption<string | number>) =>
          option.label.includes(search) : filter === false ? false : true;
      const fields = 'optionFilterProp' in entry.sample ? entry.sample.optionFilterProp : undefined;
      const result = getSelectTagOptions<string | number>(
        options, selected, entry.sample.search, predicate, fields
      )
        .map(option => ({ ...option, disabled: Boolean(option.disabled) }));

      if (entry.sample.id === 'whitespace') {
        expect(entry.options).toEqual([{ value: '   ', label: '   ', disabled: false }]);
        expect(result).toEqual([]);
      } else {
        expect(result).toEqual(entry.options);
      }
    });
  }

  it('retains cached selected labels/disabled state and never mutates owner options', () => {
    const options = Object.freeze([{ value: 'a', label: 'Alpha' }]);
    const cached = new Map([
      ['locked', { value: 'locked', label: 'Retained', disabled: true }]
    ]);
    const result = getSelectTagOptions(options, cached, '');

    expect(result).toEqual([options[0], cached.get('locked')]);
    expect(options).toHaveLength(1);
    expect(cached.size).toBe(1);
  });
});
