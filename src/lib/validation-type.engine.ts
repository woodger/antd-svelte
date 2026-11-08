/** Primitive Rule.type по async-validator 6.0.0; MIT: vendor/LICENSE.rc-async-validator. */
export type ValidationRuleType = 'string' | 'number' | 'integer' | 'float' | 'boolean'
  | 'array' | 'object' | 'date' | 'regexp' | 'method' | 'any';

export function normalizeValidationType(value: unknown, type: ValidationRuleType | undefined) {
  if (type === 'number' && value === '') return undefined;
  if (type !== 'date' || value == null || value === '' || value instanceof Date) return value;

  try {
    return new Date(value as string);
  } catch {
    // Source проглатывает исключение Date constructor и даёт success; сохраняем invalid date.
    return new Date(NaN);
  }
}

export function matchesValidationType(value: unknown, type: ValidationRuleType) {
  switch (type) {
    case 'string': return typeof value === 'string';
    case 'number': return typeof value === 'number' && !Number.isNaN(value);
    case 'integer': return typeof value === 'number' && Number.isInteger(value);
    case 'float': return typeof value === 'number' && !Number.isNaN(value)
      && !Number.isInteger(value);
    case 'boolean': return typeof value === 'boolean';
    case 'array': return Array.isArray(value);
    case 'object': return typeof value === 'object' && value !== null && !Array.isArray(value);
    case 'date': return value instanceof Date && !Number.isNaN(value.getTime());
    case 'method': return typeof value === 'function';
    case 'regexp':
      if (value instanceof RegExp) return true;
      try { new RegExp(value as string); return true; }
      catch { return false; }
    case 'any': return true;
    default: return false;
  }
}
