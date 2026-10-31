// Алгоритм Project Nayuki из @rc-component/qrcode 2.0.0, MIT.
// См. vendor/LICENSE.qrcodegen и vendor/LICENSE.rc-qrcode.

export function appendBits(val: number, len: number, bb: number[]): void {
  if (len < 0 || len > 31 || val >>> len != 0) {
    throw new RangeError('Value out of range');
  }
  for (let i = len - 1; i >= 0; i--) {
    bb.push((val >>> i) & 1);
  }
}

export function getBit(x: number, i: number): boolean {
  return ((x >>> i) & 1) != 0;
}

export function assert(cond: boolean): void {
  if (!cond) {
    throw new Error('Assertion error');
  }
}
