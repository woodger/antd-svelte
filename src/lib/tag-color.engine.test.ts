import { describe, expect, it } from 'vitest';
import { getTagColor } from './tag-color.engine';

describe('Tag color and variant resolution', () => {
  it('keeps an absent color until solid supplies default', () => {
    expect(getTagColor({})).toMatchObject({ color: undefined, variant: 'filled', style: [] });
    expect(getTagColor({ variant: 'solid' }))
      .toMatchObject({ color: 'default', variant: 'solid', internal: true, style: [] });
  });

  it('prioritizes local variant then inverse then bordered=false then context', () => {
    expect(getTagColor({ color: 'blue-inverse', variant: 'outlined' }, 'filled').variant)
      .toBe('outlined');
    expect(getTagColor({ color: 'blue-inverse', bordered: false }, 'outlined').variant)
      .toBe('solid');
    expect(getTagColor({ bordered: false }, 'solid').variant).toBe('filled');
    expect(getTagColor({ bordered: true }, 'outlined').variant).toBe('outlined');
  });

  it('recognizes every preset inverse without generating inline colors', () => {
    for (const color of [
      'blue', 'purple', 'cyan', 'green', 'magenta', 'pink', 'red', 'orange',
      'yellow', 'volcano', 'geekblue', 'lime', 'gold'
    ]) {
      expect(getTagColor({ color: `${color}-inverse` })).toEqual({
        color, variant: 'solid', internal: true, style: []
      });
    }
  });

  it('uses source HSL lightness and keeps the original CSS foreground', () => {
    expect(getTagColor({ color: '#2db7f5', variant: 'outlined' }).style).toEqual([
      ['background-color', '#e7f6fe'],
      ['color', '#2db7f5'],
      ['border-color', '#2db7f5']
    ]);
    expect(getTagColor({ color: 'var(--tone)' }).style).toEqual([
      ['background-color', '#f2f2f2'], ['color', 'var(--tone)']
    ]);
  });

  it('retains alpha when calculating a filled background', () => {
    expect(getTagColor({ color: 'rgba(100,20,30,.4)' }).style).toEqual([
      ['background-color', '#fbeaec66'], ['color', 'rgba(100,20,30,.4)']
    ]);
  });

  it('only sets the original background color for a custom solid tag', () => {
    expect(getTagColor({ color: '#2db7f5', variant: 'solid' }).style)
      .toEqual([['background-color', '#2db7f5']]);
  });
});
