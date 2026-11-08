import { Select, type SelectFlattenOption, type SelectProps } from 'antd-svelte';
import { createRawSnippet, type Snippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import reference from '../browser/fixtures/ant-design-select-option-render-reference.json';

describe('Select optionRender public package', () => {
  it('pins flat source metadata, typed keys and maxCount raw data identity', () => {
    expect(reference.reference.version).toBe('6.6.8');
    expect(reference.reference.rcSelectStudyVersion).toBe('1.10.1');
    expect(reference.cases).toHaveLength(16);
    const baseline = reference.cases.find(entry => entry.sample.id === 'single')!;
    const cap = reference.cases.find(entry => entry.sample.id === 'multiple-cap')!;

    expect(baseline.metadata.map(option => option.key)).toEqual([0, '', 'a', 'b', 'g']);
    expect(baseline.metadata.every(option => option.owner && option.groupOption === false))
      .toBe(true);
    expect(cap.rendered[0].disabled).toBe(true);
    expect(cap.metadata[0].rawDisabled).toBe(null);
    expect(reference.cases.every(entry => entry.ownerOptionsUnchanged)).toBe(true);
  });

  it('publishes typed scalar or tags renderer values with raw extra fields', () => {
    expectTypeOf<SelectProps<number>['optionRender']>()
      .toEqualTypeOf<Snippet<[SelectFlattenOption<number>, { index: number }]> | undefined>();
    expectTypeOf<SelectProps<number, 'tags'>['optionRender']>()
      .toEqualTypeOf<Snippet<[
        SelectFlattenOption<number | string>, { index: number }
      ]> | undefined>();
    expectTypeOf<SelectFlattenOption<number>['data']['desc']>().toEqualTypeOf<unknown>();
    const options: SelectProps<number>['options'] = [{ value: 0, key: '', label: 'Zero' }];

    expect(options[0].key).toBe('');
  });

  it('keeps closed SSR rendering lazy and preserves single labels and native values', () => {
    const callback = vi.fn(() => ({ render: () => '<strong>Custom option</strong>' }));
    const optionRender = createRawSnippet<[SelectFlattenOption<string>, { index: number }]>(callback);
    const body = render(Select<string>, { props: {
      options: [{ value: 'a', label: 'Alpha' }], defaultValue: 'a', name: 'choice', optionRender
    } }).body;

    expect(callback).not.toHaveBeenCalled();
    expect(body).toContain('value="Alpha"');
    expect(body).toMatch(/type="hidden"[^>]*name="choice"[^>]*value="a"/);
    expect(body).not.toContain('Custom option');
    expect(body).not.toContain('optionRender=');
  });
});
