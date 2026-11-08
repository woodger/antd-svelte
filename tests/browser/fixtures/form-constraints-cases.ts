import type { ValidationRule } from 'antd-svelte';

export interface FormConstraintsSample {
  id: string;
  value: unknown;
  len?: number;
  whitespace?: boolean;
  min?: number;
  max?: number;
  required?: boolean;
  warningOnly?: boolean;
  pattern?: string;
  trim?: boolean;
}

export function formConstraintsRule(sample: FormConstraintsSample): ValidationRule {
  return {
    len: sample.len, whitespace: sample.whitespace, min: sample.min, max: sample.max,
    required: sample.required, warningOnly: sample.warningOnly, message: 'Rejected',
    pattern: sample.pattern ? new RegExp(sample.pattern) : undefined,
    transform: sample.trim ? value => String(value).trim() : undefined
  };
}
