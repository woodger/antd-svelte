import type { FormValues, ValidationRule } from './validation.engine';
import type { ValidateMessages } from './validation-messages.types';

export interface ValidationMessageContext {
  readonly name?: string;
  readonly variables?: Readonly<Record<string, string>>;
  readonly messages?: ValidateMessages;
}

/** Locale и ConfigProvider объединяют группы; Form заменяет их top-level spread отдельно. */
export function mergeValidationMessages(
  ...layers: readonly (ValidateMessages | undefined)[]
): ValidateMessages {
  let merged: ValidateMessages = {};
  for (const layer of layers) {
    if (!layer) continue;
    const previous = merged;
    merged = { ...previous, ...layer };

    for (const key of ['date', 'types', 'string', 'number', 'array', 'pattern'] as const) {
      if (layer[key]) merged[key] = { ...previous[key], ...layer[key] };
    }
  }

  return merged;
}

/** Template formatting адаптирован из async-validator; MIT: vendor/LICENSE.rc-async-validator. */
export function resolveValidationMessage<Values extends FormValues>(
  rule: ValidationRule<Values>,
  context: ValidationMessageContext | undefined,
  path: string | readonly [string, string],
  fallback: string,
  args: readonly unknown[] = [context?.name]
): string {
  if (rule.message !== undefined) return rule.message;

  try {
    let template: unknown = context?.messages;
    for (const key of typeof path === 'string' ? [path] : path) {
      template = template && typeof template === 'object' && Object.hasOwn(template, key)
        ? Reflect.get(template, key) : undefined;
    }
    if (typeof template === 'function') {
      const result = Reflect.apply(template, null, args);
      return typeof result === 'string' ? result : fallback;
    }
    if (typeof template !== 'string') return fallback;

    let index = 0;
    return template.replace(/%[sdj%]/g, placeholder => {
      if (placeholder === '%%') return '%';
      if (index >= args.length) return placeholder;
      const value = args[index++];
      if (placeholder === '%s') return String(value);
      if (placeholder === '%d') return String(Number(value));

      try {
        return JSON.stringify(value) ?? 'undefined';
      } catch {
        return '[Circular]';
      }
    });
  } catch {
    // Ошибка template не должна ломать validation или создавать source console/page errors.
    return fallback;
  }
}

/** Однократная подстановка rc-form; backslash сохраняет буквальный ${variable}. */
export function formatValidationMessages<Values extends FormValues>(
  messages: readonly string[],
  rule: ValidationRule<Values>,
  context?: ValidationMessageContext
): readonly string[] {
  if (!messages.some(message => message.includes('${'))) return messages;

  const variables: Record<string, unknown> = {
    ...rule,
    name: context?.name,
    label: context?.name,
    enum: Array.isArray(rule.enum) ? rule.enum.map(value => value == null ? '' : String(value))
      .join(', ') : '',
    ...context?.variables
  };

  return messages.map(message => message.replace(/\\?\$\{\w+\}/g, (placeholder) => {
    if (placeholder.startsWith('\\')) return placeholder.slice(1);

    const key = placeholder.slice(2, -1);
    // Inherited constructor/toString не являются template variables.
    const value = Object.hasOwn(variables, key) ? variables[key] : undefined;
    try {
      return String(value);
    } catch {
      return 'undefined';
    }
  }));
}
