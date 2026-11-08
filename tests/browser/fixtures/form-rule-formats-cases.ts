import type { ValidationRule, ValidationRuleType } from 'antd-svelte';
import { formRuleTypesValue } from './form-rule-types-cases';

export interface FormRuleFormatsSample {
  id: string;
  type?: string;
  kind?: string;
  value?: unknown;
  required?: boolean;
  enum?: readonly unknown[];
  pattern?: string;
  regex?: boolean;
  flags?: string;
  custom?: boolean;
  constraints?: boolean;
}

export function formRuleFormatsValue(sample: FormRuleFormatsSample) {
  return Object.hasOwn(sample, 'value') ? sample.value : formRuleTypesValue(sample.kind!);
}

export function formRuleFormatsRule(sample: FormRuleFormatsSample): ValidationRule {
  return {
    type: sample.type as ValidationRuleType | undefined, required: sample.required,
    enum: sample.type === 'enum' ? sample.enum ?? ['abc', 0, false] : undefined,
    pattern: sample.regex ? new RegExp(sample.pattern!, sample.flags) : sample.pattern,
    validator: sample.custom ? async () => {} : undefined,
    ...(sample.constraints ? { min: 100, max: 0, len: 0, whitespace: true, pattern: /^no$/ } : {}),
    message: 'Rejected'
  };
}

/** Четыре source URL-ошибки: IPv6 brackets и допустимые TCP/UDP порты. */
export const formRuleFormatsCorrections: Readonly<Record<string, boolean>> = {
  'url-format-5': true,
  'url-format-6': false,
  'url-format-7': true,
  'url-format-8': false
};
