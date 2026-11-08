import type { FormValues, ValidationRule } from './validation.engine';

export interface ValidationMessageContext {
  readonly name?: string;
  readonly variables?: Readonly<Record<string, string>>;
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
