import { describe, expect, it } from 'vitest';
import { getWaveColor, isValidWaveColor } from './wave.engine';

describe('Wave colors from Ant Design 6.6.8', () => {
  it('ignores source white and transparent spellings without normalizing other colors', () => {
    for (const color of ['', '#fff', '#ffffff', 'rgb(255, 255, 255)', 'rgba(255, 255, 255, 1)',
      'transparent', 'canvastext', 'rgba(1, 2, 3, 0)', '#fff0', '#FFF0', '#12345600', null, 0]) {
      expect(isValidWaveColor(color), String(color)).toBe(false);
    }
    for (const color of ['red', '#FFF', '#000', '#000f', '#00000080', 'rgba(0, 0, 0, 0.5)',
      'hsl(0, 0%, 0%)']) {
      expect(isValidWaveColor(color), color).toBe(true);
    }
  });

  it('uses the requested source before border top, border and background', () => {
    const style = { color: 'purple', borderTopColor: 'red', borderColor: 'blue',
      backgroundColor: 'green' };

    expect(getWaveColor(style)).toBe('red');
    expect(getWaveColor(style, 'color')).toBe('purple');
    expect(getWaveColor(style, 'backgroundColor')).toBe('green');
    expect(getWaveColor(style, 'borderColor')).toBe('blue');
    expect(getWaveColor({ ...style, borderTopColor: '#fff' })).toBe('blue');
    expect(getWaveColor({ ...style, borderTopColor: '#fff', borderColor: '#0000' })).toBe('green');
  });

  it('falls back from an invalid requested color and returns null without a valid target color', () => {
    const style = { color: '#0000', borderTopColor: 'red', borderColor: 'transparent',
      backgroundColor: '#ffffff00' };

    expect(getWaveColor(style, 'color')).toBe('red');
    expect(getWaveColor({ ...style, borderTopColor: '#fff' }, 'color')).toBeNull();
  });
});
