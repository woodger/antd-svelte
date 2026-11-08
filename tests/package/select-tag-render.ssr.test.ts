import { Select, type SelectProps, type SelectTagInfo } from 'antd-svelte';
import { createRawSnippet, type Snippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, expectTypeOf, it } from 'vitest';
import reference from '../browser/fixtures/ant-design-select-tag-render-reference.json';

describe('Select custom tag renderer public package', () => {
  it('pins source normal/rest metadata and disabled open callback observation', () => {
    expect(reference.reference.version).toBe('6.6.8');
    expect(reference.cases).toHaveLength(16);
    const rest = reference.cases.find(entry => entry.sample.id === 'zero-rest')!;
    const disabled = reference.cases.find(entry => entry.sample.id === 'disabled-click')!;

    expect(rest.result.tags).toEqual([{
      disabled: false, closable: false, isMaxTag: true, onCloseType: 'undefined', label: '+ 2 ...'
    }]);
    expect(disabled.result.open).toBe(false);
    expect(disabled.result.events).toEqual([{ type: 'open', open: true }]);
  });

  it('exposes discriminated tag metadata and preserves all selected fields through SSR rendering', () => {
    expectTypeOf<SelectProps<number, 'tags'>['tagRender']>()
      .toEqualTypeOf<Snippet<[SelectTagInfo<number | string>]> | undefined>();
    const tagRender = createRawSnippet<[SelectTagInfo<number>]>(info => ({
      render: () => `<span>Custom ${info().isMaxTag ? 'rest' : info().value}</span>`
    }));
    const body = render(Select<number, 'multiple'>, { props: {
      mode: 'multiple', options: [1, 2].map(value => ({ value, label: `Label ${value}` })),
      defaultValue: [1, 2], tagRender, maxTagCount: 1, name: 'custom'
    } }).body;

    expect(body).toContain('Custom 1');
    expect(body).toContain('Custom rest');
    expect(body).not.toContain('Удалить Label 1');
    expect([...body.matchAll(/type="hidden"[^>]*name="custom"[^>]*value="([^"]*)"/g)]
      .map(match => match[1])).toEqual(['1', '2']);
    expect(body).not.toContain('tagRender=');
  });

  it('does not invoke a tag renderer for single mode', () => {
    const tagRender = createRawSnippet<[SelectTagInfo<string>]>(() => {
      throw new Error('Single must ignore tagRender');
    });
    const body = render(Select<string>, { props: {
      options: [{ value: 'a', label: 'Alpha' }], defaultValue: 'a', tagRender
    } }).body;

    expect(body).toContain('value="Alpha"');
    expect(body).not.toContain('custom-tag');
  });
});
