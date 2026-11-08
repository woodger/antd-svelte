import { describe, expect, it } from 'vitest';
import reference from '../../tests/browser/fixtures/ant-design-select-tag-text-reference.json';
import { getSelectTagText } from './select-tag-text.engine';

describe('Select and Cascader tag text source boundaries', () => {
  for (const entry of reference.cases) {
    it(`preserves source truncation and complete Unicode pairs for ${entry.sample.id}`, () => {
      const sample = entry.sample;
      const length = sample.length === 'nan' ? Number.NaN
        : sample.length === 'infinity' ? Number.POSITIVE_INFINITY
          : typeof sample.length === 'number' ? sample.length : undefined;
      const expected = sample.id.endsWith('-emoji-split') ? '...'
        : sample.id.endsWith('-middle-pair') ? 'A...' : entry.tags[0].text;

      expect(getSelectTagText(sample.text, length)).toBe(expected);
      expect(entry.tags[0].title).toBe(sample.text);
    });
  }

  it('keeps original strings and only removes a high surrogate when its paired low is omitted', () => {
    expect(getSelectTagText('😀x', 1)).toBe('...');
    expect(getSelectTagText('😀x', 2)).toBe('😀...');
    expect(getSelectTagText('x😀y', 2)).toBe('x...');
    expect(getSelectTagText('x😀y', 3)).toBe('x😀...');
    expect(getSelectTagText('😀', 2)).toBe('😀');
    expect(getSelectTagText('e\u0301clair', 1)).toBe('e...');
    expect(getSelectTagText('original')).toBe('original');
  });
});
