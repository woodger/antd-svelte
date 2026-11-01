import { describe, expect, it, vi } from 'vitest';
import { getMiniDecimal, toFixed } from './mini-decimal.engine';
import { getDecupleSteps, getNumberPrecision, numberToString } from './decimal-format.engine';

describe('mini-decimal source arithmetic', () => {
  it(
    'steps decimal strings beyond the safe integer limit without losing fractional digits',
    () => {
      const value = getMiniDecimal('9007199254740993123456789.00000000000001');
      const next = value.add('0.00000000000001');

      expect(next.toString()).toBe('9007199254740993123456789.00000000000002');
      expect(next.add('-0.00000000000002').toString()).toBe('9007199254740993123456789');
      expect(value.toString()).toBe('9007199254740993123456789.00000000000001');
      expect(value.lessEquals(next)).toBe(true);
      expect(next.lessEquals(value)).toBe(false);
    }
  );

  it.each([
    ['0001.2000', '1.2'],
    ['-.0100', '-0.01'],
    ['-0.000', '0'],
    ['1.', '1'],
    ['1e-7', '0.0000001']
  ])(
    'normalizes %s while preserving its raw origin',
    (input, expected) => {
      const value = getMiniDecimal(input);

      expect(value.toString()).toBe(expected);
      expect(value.toString(false)).toBe(input);
    }
  );

  it(
    'keeps empty values separate from invalid drafts and adds to either like upstream',
    () => {
      const empty = getMiniDecimal('');
      const invalid = getMiniDecimal('-');

      expect(empty.isEmpty()).toBe(true);
      expect(empty.toNumber()).toBe(0);
      expect(invalid.isNaN()).toBe(true);
      expect(invalid.toNumber()).toBeNaN();
      expect(invalid.toString(false)).toBe('-');
      expect(empty.add('0.1').toString()).toBe('0.1');
      expect(invalid.add('2').toString()).toBe('2');
    }
  );

  it.each([
    ['1.005', 2, '1.01', '1.00'],
    ['-1.005', 2, '-1.01', '-1.00'],
    ['9.999', 2, '10.00', '9.99'],
    ['0.5', 0, '1', '0'],
    ['-0.5', 0, '-1', '-0']
  ])(
    'rounds and cuts %s at %i digits using source decimal operations',
    (input, precision, rounded, cut) => {
      expect(toFixed(input, '.', precision)).toBe(rounded);
      expect(toFixed(input, '.', precision, true)).toBe(cut);
      expect(toFixed(input, ',', precision)).toBe(rounded.replace('.', ','));
    }
  );

  it(
    'uses the source scale for scientific notation and shifted decimal steps',
    () => {
      expect(getNumberPrecision('1.23e-7')).toBe(9);
      expect(numberToString(1e-7)).toBe('0.0000001');
      expect(getDecupleSteps('0.00000000000001')).toBe('0.0000000000001');
      expect(getDecupleSteps(1)).toBe('10');
    }
  );

  it(
    'uses the original safe-number fallback when BigInt is unavailable',
    () => {
      vi.stubGlobal('BigInt', undefined);

      try {
        expect(getMiniDecimal(.2).add(.1).toString()).toBe('0.3');
        expect(getMiniDecimal(Number.MAX_SAFE_INTEGER).add(1).toNumber())
          .toBe(Number.MAX_SAFE_INTEGER);
        expect(getMiniDecimal('bad').isNaN()).toBe(true);
      } finally {
        vi.unstubAllGlobals();
      }
    }
  );
});
