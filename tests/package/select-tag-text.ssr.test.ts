import { Cascader, Select } from 'antd-svelte';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import reference from '../browser/fixtures/ant-design-select-tag-text-reference.json';

describe('Select and Cascader tag text public package', () => {
  it('pins source truncation of surrogate pairs without rewriting raw observations', () => {
    expect(reference.reference.version).toBe('6.6.8');
    expect(reference.cases).toHaveLength(32);
    const broken = reference.cases.filter(entry => entry.sample.id.endsWith('-emoji-split'));

    expect(broken.map(entry => entry.tags[0].text)).toEqual(['\uD83D...', '\uD83D...']);
    expect(broken.map(entry => entry.tags[0].title)).toEqual(['😀tag', '😀tag']);
  });

  it('truncates Select labels without changing titles, remove names or native field values', () => {
    const body = render(Select<string, 'multiple'>, { props: {
      mode: 'multiple', options: [{ value: 'a', label: '😀tag' }],
      defaultValue: Object.freeze(['a']), maxTagTextLength: 1, name: 'tag-text'
    } }).body;

    expect(body).toMatch(/ant-select-selection-item-content[^>]*>\s*\.\.\./);
    expect(body).toContain('title="😀tag"');
    expect(body).toContain('Удалить 😀tag');
    expect(body).toMatch(/type="hidden"[^>]*name="tag-text"[^>]*value="a"/);
    expect(body).not.toContain('\uD83D...');
    expect(body).not.toContain('maxTagTextLength=');
  });

  it('uses the same Unicode boundary for existing Cascader text without serializing paths', () => {
    const body = render(Cascader, { props: {
      multiple: true, options: [{ value: 'a', label: '😀tag' }],
      defaultValue: [['a']], maxTagTextLength: 1
    } }).body;

    expect(body).toMatch(/ant-select-selection-item-content[^>]*>.*?\.\.\./s);
    expect(body).toContain('title="😀tag"');
    expect(body).not.toContain('\uD83D...');
    expect(body).not.toContain('type="hidden"');
  });
});
