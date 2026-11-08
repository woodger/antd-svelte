import type { ValidationRule, ValidationRuleType } from 'antd-svelte';

export interface FormRuleTypesSample {
  id: string;
  type: string;
  kind: string;
  required?: boolean;
  min?: number;
  max?: number;
  len?: number;
  whitespace?: boolean;
  pattern?: string;
  custom?: boolean;
}

export function formRuleTypesValue(kind: string): unknown {
  switch (kind) {
    case 'undefined': return undefined;
    case 'null': return null;
    case 'string': return 'abc';
    case 'empty': return '';
    case 'spaces': return '  ';
    case 'zero': return 0;
    case 'integer': return 3;
    case 'fraction': return 3.5;
    case 'false': return false;
    case 'true': return true;
    case 'array': return ['a', 'b'];
    case 'empty-array': return [];
    case 'object': return { a: 1 };
    case 'date': return new Date('2026-01-01T00:00:00Z');
    case 'invalid-date': return new Date(NaN);
    case 'regexp': return /^abc$/;
    case 'invalid-regexp': return '[';
    case 'method': return () => true;
    case 'nan': return NaN;
    case 'infinity': return Infinity;
    case 'bigint': return 3n;
    case 'symbol': return Symbol('value');
    case 'large-integer': return 1e21;
    default: throw Error(`Unknown rule value: ${kind}`);
  }
}

export function formRuleTypesRule(sample: FormRuleTypesSample): ValidationRule {
  return {
    type: sample.type as ValidationRuleType, required: sample.required,
    min: sample.min, max: sample.max, len: sample.len, whitespace: sample.whitespace,
    pattern: sample.pattern ? new RegExp(sample.pattern) : undefined,
    validator: sample.custom ? async () => {} : undefined,
    message: 'Rejected'
  };
}

/** Source использует parseInt, который ошибочно классифицирует scientific notation. */
export const formRuleTypesCorrections: Readonly<Record<string, boolean>> = {
  'integer-large-integer': true,
  'float-large-integer': false
};
