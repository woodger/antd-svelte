import { isEmptyDecimal, isScientificNumber, numberToString, trimNumber,
  validateNumber } from './decimal-format.engine';
import type { DecimalValue, MiniDecimal } from './mini-decimal.engine';

/** BigIntDecimal mini-decimal 1.0.1: исходные строки, scale и округления. */
export class BigIntDecimal implements MiniDecimal {
  origin = '';
  negative?: boolean;
  integer?: bigint;
  decimal?: bigint;
  decimalLen?: number;
  empty?: boolean;
  nan?: boolean;

  constructor(value: DecimalValue) {
    if (isEmptyDecimal(value)) {
      this.empty = true;
      return;
    }

    this.origin = String(value);
    if (value === '-' || Number.isNaN(value)) {
      this.nan = true;
      return;
    }

    let number = value!;
    if (isScientificNumber(number)) number = Number(number);

    const text = typeof number === 'string' ? number : numberToString(number);
    if (validateNumber(text)) {
      const trimmed = trimNumber(text);
      const parts = trimmed.trimStr.split('.');
      const decimal = parts[1] || '0';

      this.negative = trimmed.negative;
      this.integer = BigInt(parts[0]);
      this.decimal = BigInt(decimal);
      this.decimalLen = decimal.length;
    } else this.nan = true;
  }

  private getMark() {
    return this.negative ? '-' : '';
  }

  private getIntegerStr() {
    return this.integer!.toString();
  }

  private getDecimalStr() {
    return this.decimal!.toString().padStart(this.decimalLen!, '0');
  }

  private alignDecimal(length: number) {
    return BigInt(this.getMark() + this.getIntegerStr() + this.getDecimalStr().padEnd(length, '0'));
  }

  negate() {
    const clone = new BigIntDecimal(this.toString());
    clone.negative = !clone.negative;

    return clone;
  }

  add(value: DecimalValue): BigIntDecimal {
    if (this.isInvalidate()) return new BigIntDecimal(value);

    const offset = new BigIntDecimal(value);
    if (offset.isInvalidate()) return this;

    const length = Math.max(this.getDecimalStr().length, offset.getDecimalStr().length);
    const number = (this.alignDecimal(length) + offset.alignDecimal(length)).toString();
    const { negativeStr, trimStr } = trimNumber(number);
    const hydrated = negativeStr + trimStr.padStart(length + 1, '0');

    return new BigIntDecimal(`${hydrated.slice(0, -length)}.${hydrated.slice(-length)}`);
  }

  isEmpty() {
    return this.empty;
  }

  isNaN() {
    return this.nan;
  }

  isInvalidate() {
    return this.isEmpty() || this.isNaN();
  }

  equals(target: MiniDecimal | null | undefined) {
    return this.toString() === target?.toString();
  }

  lessEquals(target: MiniDecimal) {
    return this.add(target.negate().toString()).toNumber() <= 0;
  }

  toNumber() {
    return this.isNaN() ? NaN : Number(this.toString());
  }

  toString(safe = true) {
    if (!safe) return this.origin;
    if (this.isInvalidate()) return '';

    return trimNumber(`${this.getMark()}${this.getIntegerStr()}.${this.getDecimalStr()}`).fullStr;
  }
}
