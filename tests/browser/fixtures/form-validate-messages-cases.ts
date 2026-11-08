import type { ValidateMessages, ValidationRule } from 'antd-svelte';

export interface FormMessagesDescriptor {
  readonly [key: string]: string | FormMessagesDescriptor;
}

export interface FormMessagesRule extends Omit<ValidationRule, 'pattern' | 'fields' | 'defaultField'> {
  pattern?: string;
  fields?: Readonly<Record<string, FormMessagesRule>>;
  defaultField?: FormMessagesRule;
}

export interface FormValidateMessagesSample {
  id: string;
  value: unknown;
  rule: FormMessagesRule;
  local?: FormMessagesDescriptor;
  outer?: FormMessagesDescriptor;
  inner?: {
    form?: { colon?: boolean };
    locale?: { Form?: { defaultValidateMessages?: FormMessagesDescriptor } };
  };
  variables?: Readonly<Record<string, string>>;
}

export function buildValidationMessages(
  descriptor?: FormMessagesDescriptor, calls: string[][] = []
): ValidateMessages | undefined {
  if (!descriptor) return;

  return Object.fromEntries(Object.entries(descriptor).map(([key, value]) => {
    if (typeof value === 'object') return [key, buildValidationMessages(value, calls)];
    if (value === '@undefined') return [key, undefined];
    if (value === '@throws') return [key, () => { throw Error('Template exploded'); }];
    if (value === '@function' || value === '@arguments') {
      return [key, (...args: unknown[]) => {
        calls.push(args.map(String));
        return value === '@function' ? 'Function ${label}'
          : `Function ${args.map(String).join('/')} \${label}`;
      }];
    }
    return [key, value];
  }));
}

export function buildMessagesRule(descriptor: FormMessagesRule): ValidationRule {
  return {
    ...descriptor,
    pattern: descriptor.pattern ? new RegExp(descriptor.pattern) : undefined,
    fields: descriptor.fields ? Object.fromEntries(Object.entries(descriptor.fields)
      .map(([key, value]) => [key, buildMessagesRule(value)])) : undefined,
    defaultField: descriptor.defaultField ? buildMessagesRule(descriptor.defaultField) : undefined
  };
}

export const validateMessagesCorrections: Readonly<Record<string, readonly string[]>> = {
  'config-replace': ['Заполните это поле.'],
  'local-group-replace': ['Минимальное значение: 4.'],
  'nested-object': ['Nested Field label/field.child/4'],
  'undefined-template': ['Заполните это поле.'],
  'function-throws': ['Заполните это поле.']
};
