// Алгоритм Project Nayuki из @rc-component/qrcode 2.0.0, MIT.
// См. vendor/LICENSE.qrcodegen и vendor/LICENSE.rc-qrcode.
import { Mode } from './qrcode-mode.engine';
import { appendBits } from './qrcode-bits.engine';

export class QrSegment {

  public static makeBytes(data: Readonly<number[]>): QrSegment {
    const bb: number[] = [];
    for (const b of data) {
      appendBits(b, 8, bb);
    }
    return new QrSegment(Mode.BYTE, data.length, bb);
  }

  public static makeNumeric(digits: string): QrSegment {
    if (!QrSegment.isNumeric(digits)) {
      throw new RangeError('String contains non-numeric characters');
    }
    const bb: number[] = [];
    for (let i = 0; i < digits.length;) {
      const n: number = Math.min(digits.length - i, 3);
      appendBits(parseInt(digits.substring(i, i + n), 10), n * 3 + 1, bb);
      i += n;
    }
    return new QrSegment(Mode.NUMERIC, digits.length, bb);
  }

  public static makeAlphanumeric(text: string): QrSegment {
    if (!QrSegment.isAlphanumeric(text)) {
      throw new RangeError('String contains unencodable characters in alphanumeric mode');
    }
    const bb: number[] = [];
    let i: number;
    for (i = 0; i + 2 <= text.length; i += 2) {
      let temp: number = QrSegment.ALPHANUMERIC_CHARSET.indexOf(text.charAt(i)) * 45;
      temp += QrSegment.ALPHANUMERIC_CHARSET.indexOf(text.charAt(i + 1));
      appendBits(temp, 11, bb);
    }
    if (i < text.length) {
      appendBits(QrSegment.ALPHANUMERIC_CHARSET.indexOf(text.charAt(i)), 6, bb);
    }
    return new QrSegment(Mode.ALPHANUMERIC, text.length, bb);
  }

  public static makeSegments(text: string): QrSegment[] {
    if (text == '') {
      return [];
    }
    else if (QrSegment.isNumeric(text)) {
      return [QrSegment.makeNumeric(text)];
    }
    else if (QrSegment.isAlphanumeric(text)) {
      return [QrSegment.makeAlphanumeric(text)];
    }
    else {
      return [QrSegment.makeBytes(QrSegment.toUtf8ByteArray(text))];
    }
  }

  public static makeEci(assignVal: number): QrSegment {
    const bb: number[] = [];
    if (assignVal < 0) {
      throw new RangeError('ECI assignment value out of range');
    }
    else if (assignVal < 1 << 7) {
      appendBits(assignVal, 8, bb);
    }
    else if (assignVal < 1 << 14) {
      appendBits(0b10, 2, bb);
      appendBits(assignVal, 14, bb);
    }
    else if (assignVal < 1000000) {
      appendBits(0b110, 3, bb);
      appendBits(assignVal, 21, bb);
    }
    else {
      throw new RangeError('ECI assignment value out of range');
    }
    return new QrSegment(Mode.ECI, 0, bb);
  }

  public static isNumeric(text: string): boolean {
    return QrSegment.NUMERIC_REGEX.test(text);
  }

  public static isAlphanumeric(text: string): boolean {
    return QrSegment.ALPHANUMERIC_REGEX.test(text);
  }
  public mode: Mode;
  public numChars: number;
  private bitData: number[];

  public constructor(mode: Mode, numChars: number, bitData: number[]) {
    this.mode = mode;
    this.numChars = numChars;
    this.bitData = bitData;
    if (numChars < 0) {
      throw new RangeError('Invalid argument');
    }
    this.bitData = bitData.slice();
  }

  public getData(): number[] {
    return this.bitData.slice();
  }

  public static getTotalBits(segs: Readonly<QrSegment[]>, version: number): number {
    let result: number = 0;
    for (const seg of segs) {
      const ccbits: number = seg.mode.numCharCountBits(version);
      if (seg.numChars >= 1 << ccbits) {
        return Infinity;
      }
      result += 4 + ccbits + seg.bitData.length;
    }
    return result;
  }
  private static toUtf8ByteArray(input: string): number[] {
    const str = encodeURI(input);
    const result: number[] = [];
    for (let i = 0; i < str.length; i++) {
      if (str.charAt(i) != '%') {
        result.push(str.charCodeAt(i));
      }
      else {
        result.push(parseInt(str.substring(i + 1, i + 3), 16));
        i += 2;
      }
    }
    return result;
  }
  private static readonly NUMERIC_REGEX: RegExp = /^[0-9]*$/;
  private static readonly ALPHANUMERIC_REGEX: RegExp = /^[A-Z0-9 $%*+./:-]*$/;
  private static readonly ALPHANUMERIC_CHARSET: string = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';
}
