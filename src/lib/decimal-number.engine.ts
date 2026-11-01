import { getNumberPrecision, isEmptyDecimal, numberToString } from './decimal-format.engine';
import type { DecimalValue, MiniDecimal } from './mini-decimal.engine';

/** Исходный fallback mini-decimal для runtime без BigInt. */
export class NumberDecimal implements MiniDecimal {
  origin = '';
  number?: number;
  empty?: boolean;

  constructor(value: DecimalValue) {
    if (isEmptyDecimal(value)) {
      this.empty = true;
      return;
    }

    this.origin = String(value);
    this.number = Number(value);
  }

  negate() {
    return new NumberDecimal(-this.toNumber()!);
  }

  add(value: DecimalValue): NumberDecimal {
    if (this.isInvalidate()) return new NumberDecimal(value);

    const target = Number(value);
    if (Number.isNaN(target)) return this;

    const number = this.number! + target;
    if (number > Number.MAX_SAFE_INTEGER) return new NumberDecimal(Number.MAX_SAFE_INTEGER);
    if (number < Number.MIN_SAFE_INTEGER) return new NumberDecimal(Number.MIN_SAFE_INTEGER);

    const precision = Math.max(getNumberPrecision(this.number), getNumberPrecision(target));

    return new NumberDecimal(number.toFixed(precision));
  }

  isEmpty() {
    return this.empty;
  }

  isNaN() {
    return Number.isNaN(this.number);
  }

  isInvalidate() {
    return this.isEmpty() || this.isNaN();
  }

  equals(target: MiniDecimal | null | undefined) {
    return this.toNumber() === target?.toNumber();
  }

  lessEquals(target: MiniDecimal) {
    return this.add(target.negate().toString()).toNumber()! <= 0;
  }

  toNumber() {
    return this.number;
  }

  toString(safe = true) {
    if (!safe) return this.origin;
    if (this.isInvalidate()) return '';

    return numberToString(this.number!);
  }
}
