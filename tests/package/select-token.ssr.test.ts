import { Select, type SelectProps, type SelectTokenSeparators } from 'antd-svelte';
import { render } from 'svelte/server';
import { describe, expect, expectTypeOf, it } from 'vitest';
import reference from '../browser/fixtures/ant-design-select-token-separators-reference.json';

describe('Select token separators public package', () => {
  it('pins source disabled selection and deferred IME observations without changing raw evidence', () => {
    expect(reference.reference.version).toBe('6.6.8');
    expect(reference.reference.rcSelectStudyVersion).toBe('1.10.1');
    expect(reference.cases).toHaveLength(24);
    const disabled = reference.cases.find(entry => entry.sample.id === 'multiple-disabled')!;
    const ime = reference.cases.find(entry => entry.sample.id === 'compose-tags')!;

    expect(disabled.result.values).toEqual(['a', 'locked']);
    expect(ime.intermediate?.values).toEqual([]);
    expect(ime.result.values).toEqual(['a', 'b']);
  });

  it('accepts readonly separators and split callbacks without invoking browser input work in SSR', () => {
    expectTypeOf<SelectProps<number, 'tags'>['tokenSeparators']>()
      .toEqualTypeOf<SelectTokenSeparators | undefined>();
    const separators: SelectTokenSeparators = Object.freeze([',', '\n']);
    const defaults = Object.freeze([0, 'retained']);
    const body = render(Select<number, 'tags'>, { props: {
      mode: 'tags', options: [{ value: 0, label: 'Zero' }], defaultValue: defaults,
      tokenSeparators: separators, name: 'tags'
    } }).body;
    const callback: SelectTokenSeparators = () => { throw new Error('SSR must not split input'); };
    const empty = render(Select<string, 'multiple'>, { props: {
      mode: 'multiple', options: [], tokenSeparators: callback
    } }).body;

    expect(body).toContain('Удалить retained');
    expect(body).not.toContain('tokenSeparators');
    expect(empty).toContain('role="combobox"');
    expect(defaults).toEqual([0, 'retained']);
  });
});
