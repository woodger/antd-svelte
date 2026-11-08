import { Select, type SelectProps } from 'antd-svelte';
import { render } from 'svelte/server';
import { describe, expect, expectTypeOf, it } from 'vitest';
import reference from '../browser/fixtures/ant-design-select-responsive-tags-reference.json';

describe('Select responsive tag count public package', () => {
  it('pins source all-fit long-summary observations with independent width measurements', () => {
    expect(reference.reference.version).toBe('6.6.8');
    expect(reference.reference.rcOverflowStudyVersion).toBe('1.0.0');
    expect(reference.cases).toHaveLength(15);
    for (const id of ['long-rest-400', 'snippet-rest-400']) {
      const entry = reference.cases.find(entry => entry.sample.id === id)!;
      expect(entry.metrics.tagWidths.reduce((sum, width) => sum + width, entry.metrics.input))
        .toBeLessThan(entry.metrics.available);
      expect(entry.tags).toHaveLength(1);
    }
  });

  it('renders every selected value before browser measurements without touching ResizeObserver', () => {
    expectTypeOf<SelectProps<string, 'multiple'>['maxTagCount']>()
      .toEqualTypeOf<number | 'responsive' | undefined>();
    const body = render(Select<string, 'multiple'>, { props: {
      mode: 'multiple', options: [{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }],
      defaultValue: ['a', 'b'], maxTagCount: 'responsive', name: 'responsive'
    } }).body;

    expect(body).toContain('ant-select-responsive-tags');
    expect(body).toContain('Удалить Alpha');
    expect(body).toContain('Удалить Beta');
    expect(body).toContain('data-select-rest');
    expect([...body.matchAll(/type="hidden"[^>]*name="responsive"[^>]*value="([^"]*)"/g)]
      .map(match => match[1])).toEqual(['a', 'b']);
    expect(body).not.toContain('maxTagCount=');
  });
});
