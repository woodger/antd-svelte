import { Select, type SelectSearchConfig } from 'antd-svelte';
import { render } from 'svelte/server';
import { describe, expect, expectTypeOf, it } from 'vitest';
import reference from '../browser/fixtures/ant-design-select-sort-reference.json';

describe('Select search sorting public package', () => {
  it('pins modern source sorting after synthetic tags and preserves original options', () => {
    expect(reference.reference.version).toBe('6.6.8');
    expect(reference.reference.rcSelectStudyVersion).toBe('1.10.1');
    expect(reference.cases).toHaveLength(21);
    expect(reference.cases.every(entry => entry.ownerOptionsUnchanged)).toBe(true);
    const tags = reference.cases.find(entry => entry.sample.id === 'tags-synthetic')!;

    expect(tags.options.map(option => option.value)).toEqual(['a', 'b', 'g', 'locked', 'turn', 0]);
  });

  it('accepts typed comparator info without reordering native selected fields during SSR', () => {
    expectTypeOf<Parameters<NonNullable<SelectSearchConfig<number>['filterSort']>>[0]>()
      .toEqualTypeOf<{
        value: number;
        label: string;
        disabled?: boolean;
        key?: string | number | null;
      }>();
    expectTypeOf<Parameters<NonNullable<SelectSearchConfig<number>['filterSort']>>[2]>()
      .toEqualTypeOf<{ searchValue: string }>();
    const options = Object.freeze([{ value: 2, label: 'Two' }, { value: 1, label: 'One' }]);
    const body = render(Select<number, 'multiple'>, { props: {
      mode: 'multiple', options, defaultValue: [2, 1], name: 'sorted',
      showSearch: { filterSort: (a, b) => a.value - b.value }
    } }).body;

    expect([...body.matchAll(/type="hidden"[^>]*name="sorted"[^>]*value="([^"]*)"/g)]
      .map(match => match[1])).toEqual(['2', '1']);
    expect(options.map(option => option.value)).toEqual([2, 1]);
    expect(body).not.toContain('filterSort=');
  });
});
