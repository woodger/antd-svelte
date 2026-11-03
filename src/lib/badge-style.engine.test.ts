import { describe, expect, it } from 'vitest';
import { getBadgeStyleValue } from './badge-style.engine';

describe('Badge semantic CSS values', () => {
  it('uses the last declaration across semantic layers', () => {
    expect(getBadgeStyleValue(['color:red', undefined, 'opacity:.5;color:blue'], 'color'))
      .toBe('blue');
    expect(getBadgeStyleValue(['background:red'], 'color')).toBeUndefined();
  });

  it('keeps quoted and nested separators inside their CSS values', () => {
    expect(getBadgeStyleValue([
      'background:url("data:text/plain;color:red;");color:var(--tone, rgb(1, 2, 3))'
    ], 'color')).toBe('var(--tone, rgb(1, 2, 3))');
    expect(getBadgeStyleValue(['--data:{color:red;};color:green'], 'color')).toBe('green');
  });

  it('ignores comments and escaped quote separators', () => {
    expect(getBadgeStyleValue([
      'content:"escaped\\\";color:red";/*color:orange*/COLOR:/*tone*/ blue'
    ], 'color')).toBe('blue');
  });

  it('respects important priority across CSS string layers', () => {
    expect(getBadgeStyleValue(['color:red !important', 'color:blue'], 'color')).toBe('red');
    expect(getBadgeStyleValue(['color:red !important', 'color:blue !IMPORTANT'], 'color'))
      .toBe('blue');
    expect(getBadgeStyleValue(['color:red ! /*priority*/ important', 'color:blue'], 'color'))
      .toBe('red');
  });

  it('recognizes escaped CSS property names without reading longer names', () => {
    expect(getBadgeStyleValue(['\\63 olor:purple;--color:red'], 'color')).toBe('purple');
    expect(getBadgeStyleValue(['border-color:red'], 'color')).toBeUndefined();
  });

  it('keeps absent and empty declarations from erasing a previous CSS value', () => {
    expect(getBadgeStyleValue(['color:red', 'color:;invalid;color'], 'color')).toBe('red');
    expect(getBadgeStyleValue(['color:red', 'color:!important'], 'color')).toBe('red');
    expect(getBadgeStyleValue([], 'color')).toBeUndefined();
  });
});
