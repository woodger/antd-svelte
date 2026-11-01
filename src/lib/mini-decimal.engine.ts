import { BigIntDecimal } from './decimal-bigint.engine';
import { NumberDecimal } from './decimal-number.engine';
import { trimNumber } from './decimal-format.engine';

export type DecimalValue = number | string | null | undefined;
export interface MiniDecimal {
  add(value: DecimalValue): MiniDecimal;
  negate(): MiniDecimal;
  isEmpty(): boolean | undefined;
  isNaN(): boolean | undefined;
  isInvalidate(): boolean | undefined;
  equals(target: MiniDecimal | null | undefined): boolean;
  lessEquals(target: MiniDecimal): boolean;
  toNumber(): number | undefined;
  toString(safe?: boolean): string;
}

export function getMiniDecimal(value: DecimalValue): MiniDecimal {
  return typeof BigInt === 'function' ? new BigIntDecimal(value) : new NumberDecimal(value);
}

/** Исходное округление mini-decimal; cutOnly отсекает дробь после выхода за min/max. */
export function toFixed(
  number: string,
  separator: string,
  precision?: number,
  cutOnly = false
): string {
  if (number === '') return '';

  const { negativeStr, integerStr, decimalStr } = trimNumber(number);
  const decimal = separator + decimalStr;
  const integer = negativeStr + integerStr;

  if (precision !== undefined && precision >= 0) {
    const advanced = Number(decimalStr[precision]);
    if (advanced >= 5 && !cutOnly) {
      const rounded = getMiniDecimal(number)
        .add(`${negativeStr}0.${'0'.repeat(precision)}${10 - advanced}`);

      return toFixed(rounded.toString(), separator, precision, cutOnly);
    }
    if (precision === 0) return integer;

    return integer + separator + decimalStr.padEnd(precision, '0').slice(0, precision);
  }

  return decimal === '.0' ? integer : integer + decimal;
}
