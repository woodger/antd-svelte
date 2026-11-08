import { Select, type SelectProps } from 'antd-svelte';
import { render } from 'svelte/server';
import { describe, expect, expectTypeOf, it } from 'vitest';
import reference from '../browser/fixtures/ant-design-select-tags-interaction-reference.json';

describe('Select tags public package', () => {
  it('pins source submit, duplicate, controlled query and numeric/string interactions', () => {
    expect(reference.reference.version).toBe('6.6.8');
    expect(reference.reference.rcSelectStudyVersion).toBe('1.10.1');
    expect(reference.cases).toHaveLength(24);
    const numeric = reference.cases.find(entry => entry.sample.id === 'numeric-enter')!;

    expect(numeric.result.values).toEqual([0, '0']);
  });

  it('renders primitive tags and one native field per selected value before hydration', () => {
    expectTypeOf<SelectProps<number, 'tags'>['value']>()
      .toEqualTypeOf<(number | string)[] | undefined>();
    expectTypeOf<NonNullable<SelectProps<number, 'tags'>['onValueChange']>>()
      .parameter(0).toEqualTypeOf<(number | string)[]>();
    expectTypeOf<SelectProps<number, 'multiple'>['value']>()
      .toEqualTypeOf<number[] | undefined>();
    expectTypeOf<SelectProps<number>['value']>().toEqualTypeOf<number | undefined>();

    const defaults = Object.freeze([0, '0', 'free', 'free']);
    const body = render(Select<number, 'tags'>, { props: {
      mode: 'tags', options: [{ value: 0, label: 'Zero' }], defaultValue: defaults,
      name: 'tags', 'aria-label': 'Tags'
    } }).body;

    expect(body).toContain('ant-select-multiple');
    expect(body).toContain('Удалить Zero');
    expect(body).toContain('Удалить free');
    expect([...body.matchAll(/type="hidden"[^>]*name="tags"[^>]*value="([^"]*)"/g)]
      .map(match => match[1])).toEqual(['0', '0', 'free']);
    expect(defaults).toEqual([0, '0', 'free', 'free']);
    expect(body).not.toContain('mode="tags"');
  });
});
