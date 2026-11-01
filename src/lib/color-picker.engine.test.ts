import { describe, it, expect } from 'vitest';
import { AggregationColor, toHexFormat } from './color';
import { ColorCore } from './color-core.engine';
import {
  calculatePickerColor,
  fillPickerColor,
  genAlphaColor,
  generateColor,
  getColorAlpha,
  getColorModes,
  getColorText,
  getGradientPercentColor,
  getPickerColors,
  isBrightColor
} from './color-picker.engine';

describe('AggregationColor', () => {
  it('preserves RGB, hex alpha and source HSB formatting', () => {
    const color = generateColor('#1677ff80');

    expect(color.toRgb()).toEqual({ r: 22, g: 119, b: 255, a: 128 / 255 });
    expect(color.toHex()).toBe('1677ff80');
    expect(color.toHsbString()).toBe('hsba(215, 91%, 100%, 0.50)');
    expect(color.toRgbString()).toBe(`rgba(22,119,255,${128 / 255})`);
    expect(getColorAlpha(color)).toBe(50);
    expect(getColorText(color, 'hex')).toBe('#1677FF,50%');
  });

  it('preserves unrounded hue, saturation and brightness across cloning a black value', () => {
    const color = generateColor({ h: 123.456, s: .23456789, b: 0, a: .123456 });
    const copy = new AggregationColor(color);

    expect(copy.toHsb()).toEqual({ h: (123.456 % 360 + 360) % 360,
      s: .23456789, b: 0, a: .123456 });
    expect(copy.toRgb()).toEqual({ r: 0, g: 0, b: 0, a: .123456 });
    expect(genAlphaColor(copy).toHsb().h).toBe(copy.toHsb().h);
    expect(generateColor(color)).toBe(color);
    expect(copy).not.toBe(color);
  });

  it('distinguishes a cleared value from an explicit transparent color', () => {
    for (const value of [undefined, null, '', []] as const) {
      const color = generateColor(value);

      expect(color.cleared).toBe(true);
      expect(color.toHexString()).toBe('#00000000');
      expect(color.isGradient()).toBe(false);
    }
    expect(generateColor('#0000').cleared).toBe(false);
    expect(generateColor('transparent').toRgbString()).toBe('rgb(0,0,0)');
  });

  it('accepts named colors, percentage RGB, HSL and HSB strings using source rounding', () => {
    expect(generateColor('rebeccapurple').toHexString()).toBe('#663399');
    expect(generateColor('RGB(255,0,0)').toHexString()).toBe('#000000');
    expect(generateColor('rgb(100% 50% 0% / 50%)').toHexString()).toBe('#ff800080');
    expect(generateColor('hsl(120deg 100% 25% / 50%)').toHexString()).toBe('#00800080');
    expect(generateColor('hsb(120,100%,50%)').toHexString()).toBe('#008000');
    expect(toHexFormat('##12-34-56-78', true)).toBe('12345678');
    expect(toHexFormat('##12-34-56-78')).toBe('123456');
  });

  it('keeps gradient ordering and clones nested points without changing the source', () => {
    const first = generateColor('#f00');
    const points = [{ percent: 100, color: first }, { percent: 0, color: '#00f' }];
    const color = generateColor(points);
    const copy = new AggregationColor(color);
    copy.getColors()[0].color.cleared = true;

    expect(color.toCssString()).toBe('linear-gradient(90deg, rgb(255,0,0) 100%, rgb(0,0,255) 0%)');
    expect(color.toHexString()).toBe('#ff0000');
    expect(color.isGradient()).toBe(true);
    expect(color.getColors()[0].color.cleared).toBe(false);
    expect(first.cleared).toBe(false);
    expect(points[0].percent).toBe(100);
  });

  it('compares source hexadecimal colors and gradient point positions', () => {
    const single = generateColor('#f00');
    const gradient = generateColor([{ percent: 0, color: '#f00' }]);

    expect(single.equals(generateColor('red'))).toBe(true);
    expect(single.equals(gradient)).toBe(false);
    expect(gradient.equals(generateColor([{ percent: 1, color: '#f00' }]))).toBe(false);
    expect(gradient.equals(new AggregationColor(gradient))).toBe(true);
    expect(single.equals(null)).toBe(false);
  });
});

describe('ColorPicker transitions', () => {
  it('fills cleared hue/alpha controls with visible color and preserves picker alpha precision', () => {
    const current = generateColor(null);
    const hue = fillPickerColor(current, 'single', 0,
      new ColorCore({ h: 120, s: 0, b: 0, a: 0 }), { type: 'hue', value: 120 });
    const alpha = fillPickerColor(current, 'single', 0,
      new ColorCore({ h: 0, s: 0, b: 0, a: .3 }), { type: 'alpha', value: 30 });

    expect(hue.toHexString()).toBe('#00ff00');
    expect(alpha.toHexString()).toBe('#ff00004d');
    expect(alpha.cleared).toBe(false);
    expect(calculatePickerColor(alpha, .25, .4).toHsb()).toEqual({ h: 0, s: .25, b: .6, a: .3 });
    expect(calculatePickerColor(alpha, -1, 3).toHsb()).toEqual({ h: 0, s: 0, b: 0, a: .3 });
  });

  it('replaces only the active gradient color without mutating the original collection', () => {
    const current = generateColor([{ percent: 0, color: '#f00' }, { percent: 100, color: '#00f' }]);
    const next = fillPickerColor(current, 'gradient', 1, generateColor('#0f0'));

    expect(next.toCssString()).toBe('linear-gradient(90deg, rgb(255,0,0) 0%, rgb(0,255,0) 100%)');
    expect(current.getColors()[1].color.toHexString()).toBe('#0000ff');
    expect(getPickerColors(generateColor(null)).map(entry => entry.percent)).toEqual([0, 100]);
  });

  it('interpolates integer RGB and two-decimal alpha and extends endpoint colors', () => {
    const colors = [{ percent: 20, color: 'rgba(255,0,0,.2)' },
      { percent: 80, color: 'rgba(0,0,255,.8)' }];

    expect(getGradientPercentColor(colors, 0)).toBe('rgba(255,0,0,0.2)');
    expect(getGradientPercentColor(colors, 50)).toBe('rgba(128,0,128,0.5)');
    expect(getGradientPercentColor(colors, 100)).toBe('rgba(0,0,255,0.8)');
    expect(getGradientPercentColor([{ percent: 0, color: '#f00' },
      { percent: 0, color: '#00f' }], 0)).toBe('#f00');
  });

  it('orders source modes and derives preset contrast against the active background', () => {
    expect(getColorModes(['gradient', 'single', 'gradient'])).toEqual(['single', 'gradient']);
    expect(getColorModes([])).toEqual(['single']);
    expect(getColorModes('gradient')).toEqual(['gradient']);
    expect(isBrightColor(generateColor('#fff'), '#000')).toBe(true);
    expect(isBrightColor(generateColor('#0000'), '#fff')).toBe(true);
    expect(isBrightColor(generateColor('#0000'), '#000')).toBe(false);
  });
});
