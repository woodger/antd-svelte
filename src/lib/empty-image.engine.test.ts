import { describe, expect, it } from 'vitest';
import { resolveEmptyImageColors } from './empty-image.engine';

const token = {
  colorBgContainer: '#ffffff',
  colorFill: 'rgba(0,0,0,0.15)',
  colorFillSecondary: 'rgba(0,0,0,0.06)',
  colorFillTertiary: 'rgba(0,0,0,0.04)',
  colorFillQuaternary: 'rgba(0,0,0,0.02)',
  colorTextQuaternary: 'rgba(0,0,0,0.25)'
};

describe('resolveEmptyImageColors', () => {
  it('composites the default illustration against its global container color', () => {
    expect(resolveEmptyImageColors(token, false)).toEqual({
      panel: '#f5f5f5', border: '#bfbfbf', detail: '#d9d9d9', shadow: '#f0f0f0', icon: '#ffffff'
    });
  });

  it('uses the simple illustration palette with opaque SVG fills', () => {
    expect(resolveEmptyImageColors(token, true)).toEqual({
      border: '#d9d9d9', shadow: '#f5f5f5', content: '#fafafa'
    });
  });

  it('preserves unresolved CSS colors and skips composition when the background is a variable', () => {
    const variable = resolveEmptyImageColors({ ...token, colorFill: 'var(--empty-color)' }, true);
    const background = resolveEmptyImageColors({ ...token, colorBgContainer: 'var(--bg)' }, false);

    expect(variable.border).toBe('var(--empty-color)');
    expect(background.detail).toBe(token.colorFill);
    expect(background.shadow).toBe(token.colorFillSecondary);
    expect(background.icon).toBe('var(--bg)');
  });
});
