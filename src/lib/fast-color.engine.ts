import { colorNames } from './color-names';

export interface ColorRgb { r: number; g: number; b: number; a: number; }
export interface ColorHsv { h: number; s: number; v: number; a: number; }
export interface ColorHsl { h: number; s: number; l: number; a: number; }
type OptionalAlpha<T extends { a: number; }> = Omit<T, 'a'> & { a?: number; };
export type FastColorInput = string | OptionalAlpha<ColorRgb> | OptionalAlpha<ColorHsv>
  | OptionalAlpha<ColorHsl> | FastColor | null | undefined;

function limit(value: number, max = 255) {
  return value > max ? max : value < 0 ? 0 : value;
}

function splitColor(value: string, parse: (number: number, text: string, index: number) => number) {
  const parts = value.replace(/^[^(]*\((.*)/, '$1').replace(/\).*/, '')
    .match(/\d*\.?\d+%?/g) || [];
  const numbers = parts.map(part => parseFloat(part));
  for (let index = 0; index < 3; index++) {
    numbers[index] = parse(numbers[index] || 0, parts[index] || '', index);
  }
  numbers[3] = parts[3] ? parts[3].includes('%') ? numbers[3] / 100 : numbers[3] : 1;
  return numbers;
}

/** Арифметика FastColor 3.0.1: сохранены исходные округления и cache HSV/HSL. */
export class FastColor {
  r = 0;
  g = 0;
  b = 0;
  a = 1;
  private hue?: number;
  private hsvSaturation?: number;
  private hslSaturation?: number;
  private lightness?: number;
  private brightnessValue?: number;
  private value?: number;
  private maximum?: number;
  private minimum?: number;

  constructor(input: FastColorInput) {
    if (!input) return;
    if (typeof input === 'string') {
      const text = input.trim();
      if (/^#?[A-F\d]{3,8}$/i.test(text)) this.fromHex(text);
      else if (text.startsWith('rgb')) {
        const [r, g, b, a] = splitColor(text, (number, part) =>
          part.includes('%') ? Math.round(number / 100 * 255) : number);
        Object.assign(this, { r, g, b, a });
      } else if (text.startsWith('hsl') || text.startsWith('hsv') || text.startsWith('hsb')) {
        const [h, s, third, a] = splitColor(text, (number, _, index) =>
          index === 0 ? number : number / 100);
        if (text.startsWith('hsl')) this.fromHsl({ h, s, l: third, a });
        else this.fromHsv({ h, s, v: third, a });
      } else {
        const named = colorNames[text.toLowerCase()];
        if (named) this.fromHex(parseInt(named, 36).toString(16).padStart(6, '0'));
      }
    } else if (input instanceof FastColor) {
      this.r = input.r;
      this.g = input.g;
      this.b = input.b;
      this.a = input.a;
      this.hue = input.hue;
      this.hsvSaturation = input.hsvSaturation;
      this.hslSaturation = input.hslSaturation;
      this.lightness = input.lightness;
      this.value = input.value;
    } else if ('r' in input && 'g' in input && 'b' in input) {
      this.r = limit(input.r);
      this.g = limit(input.g);
      this.b = limit(input.b);
      this.a = typeof input.a === 'number' ? limit(input.a, 1) : 1;
    } else if ('h' in input && 's' in input && 'l' in input) this.fromHsl(input);
    else if ('h' in input && 's' in input && 'v' in input) this.fromHsv(input);
    else throw new Error('@ant-design/fast-color: unsupported input ' + JSON.stringify(input));
  }

  clone(): this {
    return new (this.constructor as typeof FastColor)(this) as this;
  }

  setA(value: number): this {
    const result = this.clone();
    result.a = limit(value, 1);
    return result;
  }

  setHue(value: number): this {
    return new (this.constructor as typeof FastColor)({ ...this.toHsv(), h: value }) as this;
  }

  getHue(): number {
    if (this.hue === undefined) {
      const delta = this.getMax() - this.getMin();
      this.hue = delta === 0 ? 0 : Math.round(60 * (this.r === this.getMax()
        ? (this.g - this.b) / delta + (this.g < this.b ? 6 : 0)
        : this.g === this.getMax() ? (this.b - this.r) / delta + 2
          : (this.r - this.g) / delta + 4));
    }
    return this.hue;
  }

  getHSVSaturation(): number {
    if (this.hsvSaturation === undefined) {
      const delta = this.getMax() - this.getMin();
      this.hsvSaturation = delta === 0 ? 0 : delta / this.getMax();
    }
    return this.hsvSaturation;
  }

  getHSLSaturation(): number {
    if (this.hslSaturation === undefined) {
      const delta = this.getMax() - this.getMin();
      this.hslSaturation = delta === 0 ? 0 : delta / 255 / (1 - Math.abs(2 * this.getLightness() - 1));
    }
    return this.hslSaturation;
  }

  getLightness(): number {
    return this.lightness ??= (this.getMax() + this.getMin()) / 510;
  }

  getValue(): number {
    return this.value ??= this.getMax() / 255;
  }

  mix(input: FastColorInput, amount = 50): this {
    const color = new (this.constructor as typeof FastColor)(input);
    const ratio = amount / 100;
    const calc = (key: keyof ColorRgb) => (color[key] - this[key]) * ratio + this[key];
    return new (this.constructor as typeof FastColor)({
      r: Math.round(calc('r')),
      g: Math.round(calc('g')),
      b: Math.round(calc('b')),
      a: Math.round(calc('a') * 100) / 100
    }) as this;
  }

  onBackground(input: FastColorInput): this {
    const color = new (this.constructor as typeof FastColor)(input);
    const alpha = this.a + color.a * (1 - this.a);
    const calc = (key: 'r' | 'g' | 'b') =>
      Math.round((this[key] * this.a + color[key] * color.a * (1 - this.a)) / alpha);
    return new (this.constructor as typeof FastColor)({
      r: calc('r'), g: calc('g'), b: calc('b'), a: alpha
    }) as this;
  }

  toHexString(): string {
    let result = '#';
    for (const channel of [this.r, this.g, this.b]) {
      const text = (channel || 0).toString(16);
      result += text.length === 2 ? text : '0' + text;
    }
    if (typeof this.a === 'number' && this.a >= 0 && this.a < 1) {
      const text = Math.round(this.a * 255).toString(16);
      result += text.length === 2 ? text : '0' + text;
    }
    return result;
  }

  toHsv(): ColorHsv {
    return { h: this.getHue(), s: this.getHSVSaturation(), v: this.getValue(), a: this.a };
  }

  toHsl(): ColorHsl {
    return { h: this.getHue(), s: this.getHSLSaturation(), l: this.getLightness(), a: this.a };
  }

  toRgb(): ColorRgb {
    return { r: this.r, g: this.g, b: this.b, a: this.a };
  }

  toRgbString(): string {
    return this.a !== 1 ? `rgba(${this.r},${this.g},${this.b},${this.a})`
      : `rgb(${this.r},${this.g},${this.b})`;
  }

  private getMax(): number {
    return this.maximum ??= Math.max(this.r, this.g, this.b);
  }

  private getMin(): number {
    return this.minimum ??= Math.min(this.r, this.g, this.b);
  }

  private fromHex(text: string) {
    const hex = text.replace('#', '');
    const connect = (first: number, second?: number) =>
      parseInt(hex[first] + hex[second || first], 16);
    if (hex.length < 6) {
      this.r = connect(0);
      this.g = connect(1);
      this.b = connect(2);
      this.a = hex[3] ? connect(3) / 255 : 1;
    } else {
      this.r = connect(0, 1);
      this.g = connect(2, 3);
      this.b = connect(4, 5);
      this.a = hex[6] ? connect(6, 7) / 255 : 1;
    }
  }

  private fromHsl({ h: raw, s, l, a }: OptionalAlpha<ColorHsl>) {
    const h = (raw % 360 + 360) % 360;
    this.hue = h;
    this.hslSaturation = s;
    this.lightness = l;
    this.a = typeof a === 'number' ? a : 1;
    if (s <= 0) {
      this.r = this.g = this.b = Math.round(l * 255);
      return;
    }
    const prime = h / 60;
    const chroma = (1 - Math.abs(2 * l - 1)) * s;
    const second = chroma * (1 - Math.abs(prime % 2 - 1));
    let r = 0;
    let g = 0;
    let b = 0;
    if (prime >= 0 && prime < 1) {
      r = chroma;
      g = second;
    } else if (prime >= 1 && prime < 2) {
      r = second;
      g = chroma;
    } else if (prime >= 2 && prime < 3) {
      g = chroma;
      b = second;
    } else if (prime >= 3 && prime < 4) {
      g = second;
      b = chroma;
    } else if (prime >= 4 && prime < 5) {
      r = second;
      b = chroma;
    } else if (prime >= 5 && prime < 6) {
      r = chroma;
      b = second;
    }
    const correction = l - chroma / 2;
    this.r = Math.round((r + correction) * 255);
    this.g = Math.round((g + correction) * 255);
    this.b = Math.round((b + correction) * 255);
  }

  private fromHsv({ h: raw, s, v, a }: OptionalAlpha<ColorHsv>) {
    const h = (raw % 360 + 360) % 360;
    this.hue = h;
    this.hsvSaturation = s;
    this.value = v;
    this.a = typeof a === 'number' ? a : 1;
    this.r = this.g = this.b = Math.round(v * 255);
    if (s <= 0) return;
    const hh = h / 60;
    const index = Math.floor(hh);
    const fraction = hh - index;
    const p = Math.round(v * (1 - s) * 255);
    const q = Math.round(v * (1 - s * fraction) * 255);
    const t = Math.round(v * (1 - s * (1 - fraction)) * 255);
    switch (index) {
      case 0:
        this.g = t;
        this.b = p;
        break;
      case 1:
        this.r = q;
        this.b = p;
        break;
      case 2:
        this.r = p;
        this.b = t;
        break;
      case 3:
        this.r = p;
        this.g = q;
        break;
      case 4:
        this.r = t;
        this.g = p;
        break;
      default:
        this.g = p;
        this.b = q;
        break;
    }
  }
}
