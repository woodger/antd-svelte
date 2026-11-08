import { Select, type SelectOption, type SelectProps } from 'antd-svelte';
import { render } from 'svelte/server';
import { describe, expect, expectTypeOf, it } from 'vitest';

describe('Select omitted options public package', () => {
  it('renders single numeric defaults exactly like an explicit empty options array', () => {
    expectTypeOf<SelectProps<number>['options']>()
      .toEqualTypeOf<readonly SelectOption<number>[] | undefined>();
    const componentProps = { id: 'omitted', defaultValue: 0, name: 'single' };
    const omitted = render(Select<number>, { props: componentProps }).body;
    const empty = render(Select<number>, { props: { ...componentProps, options: [] } }).body;

    expect(omitted).toBe(empty);
    expect(omitted).toContain('value="0"');
  });

  it('preserves readonly multiple defaults without requiring an options prop', () => {
    const defaults = Object.freeze([1, 2]);
    const body = render(Select<number, 'multiple'>, { props: {
      mode: 'multiple', defaultValue: defaults, name: 'multiple'
    } }).body;

    expect(body).toContain('Удалить 1');
    expect(body).toContain('Удалить 2');
    expect([...body.matchAll(/type="hidden"[^>]*name="multiple"[^>]*value="([^"]*)"/g)]
      .map(match => match[1])).toEqual(['1', '2']);
    expect(defaults).toEqual([1, 2]);
  });

  it('renders missing primitive tags exactly like empty options without mutating selected keys', () => {
    const defaults = Object.freeze([0, '0', 'free']);
    const componentProps: SelectProps<number, 'tags'> = {
      mode: 'tags', id: 'omitted-tags', defaultValue: defaults, name: 'tags'
    };
    const omitted = render(Select<number, 'tags'>, { props: componentProps }).body;
    const empty = render(Select<number, 'tags'>, { props: { ...componentProps, options: [] } }).body;

    expect(omitted).toBe(empty);
    expect(omitted).toContain('Удалить free');
    expect(defaults).toEqual([0, '0', 'free']);
  });
});
