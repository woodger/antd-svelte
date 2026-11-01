import {
  commitInputNumber,
  normalizeInputNumber,
  parseInputNumber,
  resolveInputNumberOptions,
  stepInputNumber,
  type InputNumberOptions
} from './input-number.engine';
import { getNumberPrecision, getDecupleSteps } from './decimal-format.engine';
import { getMiniDecimal, toFixed, type DecimalValue, type MiniDecimal }
  from './mini-decimal.engine';
import type { InputNumberProps, InputNumberValue } from './input-number.types';

export interface InputNumberValueOptions {
  stringMode: boolean;
  min: MiniDecimal | null;
  max: MiniDecimal | null;
  step: InputNumberValue;
  precision?: number;
  native: InputNumberOptions;
}

export function inputNumberDecimal(value: DecimalValue, stringMode: boolean) {
  const decimal = getMiniDecimal(value);

  if (stringMode) return decimal;

  return getMiniDecimal(decimal.isInvalidate() ? null : normalizeInputNumber(decimal.toNumber()));
}

export function inputNumberValue(
  decimal: MiniDecimal,
  stringMode: boolean
): InputNumberValue | null {
  if (decimal.isInvalidate()) return null;

  return stringMode ? decimal.toString() : normalizeInputNumber(decimal.toNumber());
}

export function parseInputNumberValue(
  text: string,
  options: Pick<InputNumberProps<InputNumberValue>,
    'stringMode' | 'parser' | 'formatter' | 'decimalSeparator'>
): MiniDecimal {
  if (options.parser) return getMiniDecimal(options.parser(text));

  let parsed = text;
  if (options.decimalSeparator) parsed = parsed.replace(options.decimalSeparator, '.');

  if (options.stringMode || options.formatter || options.decimalSeparator) {
    return getMiniDecimal(parsed.replace(/[^\w.-]+/g, ''));
  }

  const native = parseInputNumber(parsed);

  return getMiniDecimal(native === undefined ? NaN : native);
}

export function resolveInputNumberValueOptions(options: Pick<InputNumberProps<InputNumberValue>,
  'stringMode' | 'min' | 'max' | 'step' | 'precision'>): InputNumberValueOptions {
  const stringMode = options.stringMode ?? false;
  const native = resolveInputNumberOptions({
    min: options.min === undefined ? undefined : Number(options.min),
    max: options.max === undefined ? undefined : Number(options.max),
    step: options.step === undefined ? undefined : Number(options.step),
    precision: options.precision
  });

  function bound(value: DecimalValue) {
    const decimal = getMiniDecimal(value);

    return decimal.isInvalidate() ? null : decimal;
  }

  return {
    stringMode,
    min: bound(stringMode ? options.min : native.min),
    max: bound(stringMode ? options.max : native.max),
    step: stringMode ? options.step ?? 1 : options.step !== undefined
      && Number(options.step) === native.step ? options.step : native.step,
    precision: stringMode ? Number.isInteger(options.precision) && options.precision! >= 0
      ? options.precision : undefined : native.precision,
    native
  };
}

export function getInputNumberRangeValue(decimal: MiniDecimal, options: InputNumberValueOptions) {
  if (options.max && !decimal.lessEquals(options.max)) return options.max;
  if (options.min && !options.min.lessEquals(decimal)) return options.min;

  return null;
}

export function isInputNumberValueInRange(decimal: MiniDecimal, options: InputNumberValueOptions) {
  return !getInputNumberRangeValue(decimal, options);
}

export function inputNumberPrecision(
  text: string,
  options: Pick<InputNumberValueOptions, 'precision' | 'step'>,
  typing: boolean
) {
  if (typing) return undefined;
  if (options.precision !== undefined) return options.precision;

  return Math.max(getNumberPrecision(text), getNumberPrecision(options.step));
}

/** Numeric mode сохраняет прежний native commit; stringMode повторяет rc-input-number. */
export function commitInputNumberValue(
  decimal: MiniDecimal,
  options: InputNumberValueOptions,
  typing: boolean
): MiniDecimal | undefined {
  if (decimal.isNaN()) return undefined;
  if (decimal.isEmpty()) return decimal;
  if (typing) return isInputNumberValueInRange(decimal, options) ? decimal : undefined;

  if (!options.stringMode) {
    const next = commitInputNumber(normalizeInputNumber(decimal.toNumber()), options.native);

    return next === undefined ? undefined : getMiniDecimal(next);
  }

  const next = getInputNumberRangeValue(decimal, options) ?? decimal;
  const text = next.toString();
  const precision = inputNumberPrecision(text, options, false);
  let result = getMiniDecimal(toFixed(text, '.', precision));

  if (!isInputNumberValueInRange(result, options)) {
    result = getMiniDecimal(toFixed(text, '.', precision, true));
  }

  return result;
}

export function stepInputNumberValue(
  decimal: MiniDecimal,
  direction: 1 | -1,
  options: InputNumberValueOptions,
  shift = false
): MiniDecimal | undefined {
  if (!options.stringMode) {
    const next = stepInputNumber(decimal.isInvalidate() ? null
      : normalizeInputNumber(decimal.toNumber()), direction, {
      ...options.native,
      step: shift ? options.native.step * 10 : options.native.step
    });

    return next === null ? undefined : getMiniDecimal(next);
  }

  if (!decimal.isInvalidate() && (direction === 1
    ? options.max?.lessEquals(decimal) : options.min && decimal.lessEquals(options.min))) {
    return undefined;
  }

  let step = getMiniDecimal(shift ? getDecupleSteps(options.step) : options.step);
  if (direction === -1) step = step.negate();

  return commitInputNumberValue(decimal.add(step.toString()), options, false);
}
