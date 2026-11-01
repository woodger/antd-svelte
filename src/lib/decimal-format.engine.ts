// Числовые преобразования mini-decimal 1.0.1; MIT, LICENSE.rc-mini-decimal.
export function trimNumber(number: string) {
  let text = number.trim();
  let negative = text.startsWith('-');

  if (negative) text = text.slice(1);

  text = text.replace(/(\.\d*[^0])0*$/, '$1').replace(/\.0*$/, '').replace(/^0+/, '');
  if (text.startsWith('.')) text = `0${text}`;

  const trimStr = text || '0';
  const parts = trimStr.split('.');
  const integerStr = parts[0] || '0';
  const decimalStr = parts[1] || '0';

  if (integerStr === '0' && decimalStr === '0') negative = false;

  const negativeStr = negative ? '-' : '';

  return { negative, negativeStr, trimStr, integerStr, decimalStr, fullStr: negativeStr + trimStr };
}

export function isScientificNumber(number: string | number) {
  const text = String(number);

  return !Number.isNaN(Number(text)) && text.includes('e');
}

export function getNumberPrecision(number: string | number | undefined) {
  const text = String(number);

  if (isScientificNumber(text)) {
    let precision = Number(text.slice(text.indexOf('e-') + 2));
    const decimal = text.match(/\.(\d+)/);

    if (decimal?.[1]) precision += decimal[1].length;

    return precision;
  }

  return text.includes('.') && validateNumber(text) ? text.length - text.indexOf('.') - 1 : 0;
}

export function numberToString(number: number) {
  let text = String(number);

  if (isScientificNumber(number)) {
    if (number > Number.MAX_SAFE_INTEGER) {
      return String(typeof BigInt === 'function' ? BigInt(number) : Number.MAX_SAFE_INTEGER);
    }
    if (number < Number.MIN_SAFE_INTEGER) {
      return String(typeof BigInt === 'function' ? BigInt(number) : Number.MIN_SAFE_INTEGER);
    }

    text = number.toFixed(getNumberPrecision(text));
  }

  return trimNumber(text).fullStr;
}

export function validateNumber(number: string | number | null | undefined) {
  if (typeof number === 'number') return !Number.isNaN(number);
  if (!number) return false;

  return /^\s*-?\d+(\.\d+)?\s*$/.test(number)
    || /^\s*-?\d+\.\s*$/.test(number)
    || /^\s*-?\.\d+\s*$/.test(number);
}

export function isEmptyDecimal(value: string | number | null | undefined) {
  return !value && value !== 0 && !Number.isNaN(value) || !String(value).trim();
}

export function getDecupleSteps(step: string | number) {
  const text = typeof step === 'number' ? numberToString(step) : trimNumber(step).fullStr;

  if (!text.includes('.')) return step + '0';

  return trimNumber(text.replace(/(\d)\.(\d)/g, '$1$2.')).fullStr;
}
