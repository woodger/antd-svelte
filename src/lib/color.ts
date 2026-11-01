import { ColorCore, type ColorGenInput } from './color-core.engine';

export type GradientColor = { color: AggregationColor; percent: number; }[];
export type ColorStops = readonly { color: ColorGenInput<AggregationColor>; percent: number; }[];

/**
 * Цвет Ant Design: строковые форматы теряют точность HSV, объект сохраняет её.
 * Градиент хранит точки в исходном порядке; toHsb/toRgb относятся к первой точке.
 */
export class AggregationColor {
  private metaColor: ColorCore;
  private colors?: GradientColor;
  cleared = false;

  constructor(color: ColorGenInput<AggregationColor> | ColorCore | ColorStops | null | undefined) {
    if (color instanceof AggregationColor) {
      this.metaColor = color.metaColor.clone();
      this.colors = color.colors?.map(entry => ({
        color: new AggregationColor(entry.color), percent: entry.percent
      }));
      this.cleared = color.cleared;
      return;
    }
    if (Array.isArray(color) && color.length) {
      this.colors = color.map(entry => ({
        color: new AggregationColor(entry.color), percent: entry.percent
      }));
      this.metaColor = new ColorCore(this.colors[0].color.metaColor);
    } else {
      this.metaColor = new ColorCore(Array.isArray(color) ? '' : color as ColorGenInput);
    }
    if (!color || Array.isArray(color) && !this.colors) {
      this.metaColor = this.metaColor.setA(0);
      this.cleared = true;
    }
  }

  toHsb() { return this.metaColor.toHsb(); }
  toHsbString() { return this.metaColor.toHsbString(); }
  toHex() { return toHexFormat(this.toHexString(), this.metaColor.a < 1); }
  toHexString() { return this.metaColor.toHexString(); }
  toRgb() { return this.metaColor.toRgb(); }
  toRgbString() { return this.metaColor.toRgbString(); }
  isGradient() { return Boolean(this.colors) && !this.cleared; }

  getColors(): GradientColor {
    return this.colors || [{ color: this, percent: 0 }];
  }

  toCssString(): string {
    if (!this.colors) return this.metaColor.toRgbString();
    const colors = this.colors.map(entry => `${entry.color.toRgbString()} ${entry.percent}%`);
    return `linear-gradient(90deg, ${colors.join(', ')})`;
  }

  equals(color: AggregationColor | null): boolean {
    if (!color || this.isGradient() !== color.isGradient()) return false;
    if (!this.isGradient()) return this.toHexString() === color.toHexString();
    return this.colors!.length === color.colors!.length
      && this.colors!.every((entry, index) => entry.percent === color.colors![index].percent
        && entry.color.equals(color.colors![index].color));
  }
}

export function toHexFormat(value?: string, alpha = false): string {
  return value?.replace(/[^0-9a-f]/gi, '').slice(0, alpha ? 8 : 6) || '';
}
