import {
  Select, type SelectOmittedTag, type SelectProps, type SelectTagPlaceholder
} from 'antd-svelte';
import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, expectTypeOf, it } from 'vitest';
import reference from '../browser/fixtures/ant-design-select-tag-count-reference.json';

describe('Select numeric tag count public package', () => {
  it('pins source omission records and the NaN hidden-list observation', () => {
    expect(reference.reference.version).toBe('6.6.8');
    expect(reference.cases).toHaveLength(19);
    const nan = reference.cases.find(entry => entry.sample.id === 'nan')!;
    const snippet = reference.cases.find(entry => entry.sample.id === 'snippet-placeholder')!;

    expect(nan.tags).toEqual([]);
    expect(snippet.omitted?.map(option => option.key)).toEqual(['locked', 0, 'z']);
  });

  it('keeps every selected native field while rendering a typed omission snippet in SSR', () => {
    expectTypeOf<SelectProps<number, 'tags'>['maxTagPlaceholder']>()
      .toEqualTypeOf<SelectTagPlaceholder<number | string> | undefined>();
    const placeholder = createRawSnippet<[SelectOmittedTag<number>[]]>(omitted => ({
      render: () => `<span>Hidden ${omitted().map(option => option.key).join(',')}</span>`
    }));
    const defaults = Object.freeze([1, 2, 3]);
    const body = render(Select<number, 'multiple'>, { props: {
      mode: 'multiple', options: [1, 2, 3].map(value => ({ value, label: `Label ${value}` })),
      defaultValue: defaults, maxTagCount: 1, maxTagPlaceholder: placeholder, name: 'counted'
    } }).body;

    expect(body).toContain('Hidden 2,3');
    expect([...body.matchAll(/type="hidden"[^>]*name="counted"[^>]*value="([^"]*)"/g)]
      .map(match => match[1])).toEqual(['1', '2', '3']);
    expect(body).not.toContain('Удалить Label 2');
    expect(body).not.toContain('maxTagCount=');
    expect(body).not.toContain('maxTagPlaceholder=');
    expect(defaults).toEqual([1, 2, 3]);
  });
});
