import type { ValidationRule } from 'antd-svelte';

export interface FormTransformSample {
  id: string;
  kind: string;
  value?: unknown;
  expected?: unknown;
  multiple?: boolean;
  first?: boolean;
}

export type FormTransformCall = [string, unknown];

export function formTransformRules(
  sample: FormTransformSample, record: (call: FormTransformCall) => void
): ValidationRule[] {
  const first: ValidationRule = {
    message: 'Rejected',
    transform(value) {
      record(['transform', value]);
      if (sample.kind === 'throw') throw Error('Transform failed');
      if (sample.kind === 'empty') return '';
      if (sample.kind === 'default') return value ?? 'Default';
      if (sample.kind === 'upper') return String(value).toUpperCase();

      return typeof value === 'string' ? value.trim() : value;
    }
  };
  if (['required', 'empty', 'default'].includes(sample.kind)) first.required = true;
  else if (sample.kind === 'min') first.min = 3;
  else if (sample.kind === 'upper') first.pattern = /^ABC$/;
  else if (sample.kind === 'warning') {
    first.pattern = /^yes$/;
    first.warningOnly = true;
  } else first.validator = async (value) => {
    record(['first-validator', value]);
    if (value !== sample.expected) throw Error('First mismatch');
  };

  return sample.multiple ? [first, {
    transform(value) {
      record(['second-transform', value]);
      return value;
    },
    async validator(value) {
      record(['second-validator', value]);
      if (value !== sample.value) throw Error('Second mismatch');
    }
  }] : [first];
}
