import { Select } from 'antd-svelte';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import reference from '../browser/fixtures/ant-design-select-max-count-reference.json';

describe('Select maximum selection count public package', () => {
  it('pins source count caps and the controlled query submit bypass without editing raw data', () => {
    expect(reference.reference.version).toBe('6.6.8');
    expect(reference.reference.rcSelectStudyVersion).toBe('1.10.1');
    expect(reference.cases).toHaveLength(24);
    const bypass = reference.cases.filter(entry => ['controlled-query-blur', 'controlled-query-enter']
      .includes(entry.sample.id));

    expect(bypass.map(entry => entry.result.values)).toEqual([['a', 'held'], ['a', 'held']]);
  });

  it('preserves existing over-limit values and readonly defaults in SSR without leaking the prop', () => {
    const defaults = Object.freeze(['a', 'b']);
    const body = render(Select<string, 'tags'>, { props: {
      mode: 'tags', options: [{ value: 'a', label: 'Alpha' }], defaultValue: defaults,
      maxCount: 1, name: 'limited'
    } }).body;

    expect([...body.matchAll(/type="hidden"[^>]*name="limited"[^>]*value="([^"]*)"/g)]
      .map(match => match[1])).toEqual(['a', 'b']);
    expect(defaults).toEqual(['a', 'b']);
    expect(body).not.toContain('maxCount=');
    expect(body).not.toContain('maxcount=');
  });
});
