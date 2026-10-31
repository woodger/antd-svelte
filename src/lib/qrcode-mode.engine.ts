// Алгоритм Project Nayuki из @rc-component/qrcode 2.0.0, MIT.
// См. vendor/LICENSE.qrcodegen и vendor/LICENSE.rc-qrcode.

export class Mode {
  public static readonly NUMERIC = new Mode(0x1, [10, 12, 14]);
  public static readonly ALPHANUMERIC = new Mode(0x2, [9, 11, 13]);
  public static readonly BYTE = new Mode(0x4, [8, 16, 16]);
  public static readonly KANJI = new Mode(0x8, [8, 10, 12]);
  public static readonly ECI = new Mode(0x7, [0, 0, 0]);
  public modeBits: number;
  private numBitsCharCount: [number, number, number];

  private constructor(modeBits: number, numBitsCharCount: [number, number, number]) {
    this.modeBits = modeBits;
    this.numBitsCharCount = numBitsCharCount;
  }

  public numCharCountBits(ver: number): number {
    return this.numBitsCharCount[Math.floor((ver + 7) / 17)];
  }
}
