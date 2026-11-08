import type { FormValues, NamePath, RenderEmptyContent, ValidationRule } from 'antd-svelte';

export interface FormMessageVariablesSample {
  id: string;
  name?: NamePath;
  value?: unknown;
  label?: RenderEmptyContent;
  rich?: boolean;
  message?: string;
  variables?: Readonly<Record<string, string>>;
  rule?: {
    type?: string;
    min?: number;
    max?: number;
    required?: boolean;
    enum?: readonly unknown[];
    pattern?: string;
    fields?: Readonly<Record<string, { min: number; message: string }>>;
    defaultField?: { min: number; message: string };
  };
}

export function messageVariablesInitialValues(sample: FormMessageVariablesSample): FormValues {
  const value = Object.hasOwn(sample, 'value') ? sample.value : 'ab';
  return Array.isArray(sample.name) ? { user: { name: value } }
    : { [(sample.name as string | number | undefined) ?? 'field']: value };
}

export function messageVariablesRule(sample: FormMessageVariablesSample): ValidationRule {
  return {
    min: 5, ...sample.rule, type: sample.rule?.type as ValidationRule['type'],
    pattern: sample.rule?.pattern ? new RegExp(sample.rule.pattern) : undefined,
    ...(sample.message !== undefined ? { message: sample.message } : {})
  };
}

export const messageVariablesCorrections: Readonly<Record<string, readonly string[]>> = {
  'zero-name': ['0/0'],
  'prototype-name': ['undefined'],
  'prototype-to-string': ['undefined'],
  'object-child-context': ['Field label/field.name/5']
};
