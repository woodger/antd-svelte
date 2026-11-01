import { describe, expect, it } from 'vitest';
import {
  commitInputNumberValue,
  inputNumberDecimal,
  inputNumberValue,
  parseInputNumberValue,
  resolveInputNumberValueOptions,
  stepInputNumberValue
} from './input-number-value.engine';

describe('InputNumber value modes', () => {
  it(
    'preserves native empty, finite-number and strict-parser contracts',
    () => {
      const empty = inputNumberDecimal(null, false);
      const invalid = inputNumberDecimal(Infinity, false);

      expect(empty.isEmpty()).toBe(true);
      expect(inputNumberValue(empty, false)).toBeNull();
      expect(inputNumberValue(invalid, false)).toBeNull();
      expect(parseInputNumberValue('1,000', {}).isNaN()).toBe(true);
      expect(inputNumberValue(parseInputNumberValue('+1e-3', {}), false)).toBe(.001);
    }
  );

  it(
    'steps an empty native field to the nearest bound instead of treating it as an owned zero',
    () => {
      const options = resolveInputNumberValueOptions({ min: 0 });
      const next = stepInputNumberValue(inputNumberDecimal(null, false), -1, options)!;

      expect(inputNumberValue(next, false)).toBe(0);
      expect(stepInputNumberValue(inputNumberDecimal(0, false), -1, options)).toBeUndefined();
    }
  );

  it(
    'keeps long string values and a fractional step exact through parse, increment and commit',
    () => {
      const options = resolveInputNumberValueOptions({
        stringMode: true,
        step: '0.00000000000001',
        min: '9007199254740993',
        max: '9007199254740994'
      });
      const current = parseInputNumberValue('9007199254740993.00000000000001', { stringMode: true });
      const incremented = stepInputNumberValue(current, 1, options)!;
      const committed = commitInputNumberValue(incremented, options, false)!;

      expect(inputNumberValue(incremented, true)).toBe('9007199254740993.00000000000002');
      expect(inputNumberValue(committed, true)).toBe('9007199254740993.00000000000002');
      expect(inputNumberValue(stepInputNumberValue(current, 1, options, true)!, true))
        .toBe('9007199254740993.00000000000011');
    }
  );

  it(
    'does not block a string draft outside its bounds and clamps only when committed',
    () => {
      const options = resolveInputNumberValueOptions({ stringMode: true, min: '0', max: '3.8', precision: 0 });
      const decimal = parseInputNumberValue('4', { stringMode: true });

      expect(commitInputNumberValue(decimal, options, true)).toBeUndefined();
      expect(inputNumberValue(commitInputNumberValue(decimal, options, false)!, true)).toBe('3');
    }
  );

  it(
    'supports parser-returned strings and decimal separators without precision loss',
    () => {
      const parsed = parseInputNumberValue('$ 9007199254740993.00000000000001', {
        stringMode: true,
        parser: text => text!.replace('$ ', '')
      });
      const comma = parseInputNumberValue('1,25', { decimalSeparator: ',' });

      expect(inputNumberValue(parsed, true)).toBe('9007199254740993.00000000000001');
      expect(inputNumberValue(comma, false)).toBe(1.25);
    }
  );

  it(
    'keeps the native nearest-representable bound when precision cannot fit a rounded value',
    () => {
      const options = resolveInputNumberValueOptions({ min: .15, max: .28, precision: 1 });
      const parsed = parseInputNumberValue('.15', {});

      expect(inputNumberValue(commitInputNumberValue(parsed, options, false)!, false)).toBe(.2);
    }
  );
});
