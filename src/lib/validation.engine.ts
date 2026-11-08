import {
  matchesValidationType, normalizeValidationType, type ValidationRuleType
} from './validation-type.engine';
import { matchesValidationPattern } from './validation-format.engine';
import type { FormInstance } from './form.model.svelte';
import {
  collectValidationMessages, validateNestedRule,
  type ValidationMessages, type ValidationAncestor
} from './validation-nested.engine';
import {
  formatValidationMessages, resolveValidationMessage, type ValidationMessageContext
} from './validation-message.engine';
export type { ValidationRuleType } from './validation-type.engine';

/** Значение поля может быть скаляром, вложенным контейнером или экземпляром класса. */
export type FormValue = unknown;
export type FormValues = Record<string, FormValue>;
export type FieldName<Values> = Extract<keyof Values, string>;

export interface ValidationRule<Values extends FormValues = FormValues> {
  /** Явный type включает исходные правила пустых значений и выбора constraints. */
  type?: ValidationRuleType;
  required?: boolean;
  /** По умолчанию false; сообщение попадает в warnings и не блокирует submit. */
  warningOnly?: boolean;
  min?: number;
  max?: number;
  /** Точное число/длина; date сравнивает timestamp. Приоритет над min/max. */
  len?: number;
  /** В implicit/string rule отклоняет непустую строку только из whitespace. */
  whitespace?: boolean;
  pattern?: RegExp | string;
  /** Строгое сравнение без coercion; используется при type='enum'. */
  enum?: readonly FormValue[];
  /** Правила именованных дочерних значений при type='object' или 'array'. */
  fields?: Readonly<Record<string, ValidationRule<Values> | readonly ValidationRule<Values>[]>>;
  /** Правило элементов массива; для object применяется к ключам без собственного fields rule. */
  defaultField?: ValidationRule<Values>;
  message?: string;
  /** Синхронно преобразует значение только для этого правила, не записывая результат в Form. */
  transform?: (value: FormValue) => FormValue;
  /** При явном type заменяет встроенные проверки; native signature value/values сохраняется. */
  validator?: (
    value: FormValue,
    values: Readonly<Values>
  ) => string | void | Promise<string | void>;
}

/** Чистая фабрика настроек получает текущую модель формы; вызывается до проверки правил. */
export type ValidationRuleFactory<Values extends FormValues = FormValues> =
  (form: FormInstance<Values>) => ValidationRule<Values>;

export type FormRule<Values extends FormValues = FormValues> =
  ValidationRule<Values> | ValidationRuleFactory<Values>;

export type FormRules<Values extends FormValues> = Partial<
  Record<FieldName<Values>, readonly FormRule<Values>[]>
>;

export function resolveValidationRules<Values extends FormValues>(
  rules: readonly FormRule<Values>[], form: FormInstance<Values>
): readonly ValidationRule<Values>[] {
  // Object-only arrays сохраняют прежнюю identity и capture semantics.
  if (rules.every(rule => typeof rule !== 'function')) return rules;

  return rules.map(rule => typeof rule === 'function' ? rule(form) : rule);
}

export type FieldErrors<Values extends FormValues> = Partial<Record<FieldName<Values>, string[]>>;

/** Ошибки поля сохраняют исходные сегменты пути, включая различие строк и чисел. */
export interface FieldError {
  name: (string | number)[];
  errors: string[];
  warnings: string[];
}

export async function validateValue<Values extends FormValues>(
  value: FormValue,
  values: Readonly<Values>,
  rules: readonly ValidationRule<Values>[]
): Promise<string[]> {
  return (await validateFieldValue(value, values, rules)).errors;
}

export async function validateFieldValue<Values extends FormValues>(
  value: FormValue,
  values: Readonly<Values>,
  rules: readonly ValidationRule<Values>[],
  validateFirst: boolean | 'parallel' = false,
  context?: ValidationMessageContext
): Promise<{ errors: string[]; warnings: string[] }> {
  return validateRules(value, values, rules, validateFirst, undefined, context);
}

async function validateRules<Values extends FormValues>(
  value: FormValue,
  values: Readonly<Values>,
  rules: readonly ValidationRule<Values>[],
  validateFirst: boolean | 'parallel' = false,
  ancestor?: ValidationAncestor,
  context?: ValidationMessageContext
): Promise<ValidationMessages> {
  const ordered = [...rules].sort((first, second) =>
    Number(Boolean(first.warningOnly)) - Number(Boolean(second.warningOnly))
  );

  if (validateFirst === true) {
    let warnings: string[] | undefined;
    for (const rule of ordered) {
      if (rule.warningOnly && warnings) return { errors: [], warnings };
      const messages = await validateRuleValue(value, values, rule, ancestor, context);
      if (messages.errors.length) return { errors: messages.errors, warnings: [] };
      if (messages.warnings.length) warnings ??= messages.warnings;
    }

    return { errors: [], warnings: warnings ?? [] };
  }

  const checks = ordered.map((rule) => validateRuleValue(value, values, rule, ancestor, context));
  if (validateFirst === 'parallel') {
    if (!checks.length) return { errors: [], warnings: [] };

    return new Promise((resolve, reject) => {
      let remaining = checks.length;
      let blocking = ordered.filter((rule) => !rule.warningOnly).length;
      let warning: string[] | undefined;

      checks.forEach((check, index) => {
        check.then((messages) => {
          remaining--;
          if (!ordered[index].warningOnly) {
            blocking--;
            if (messages.errors.length) {
              resolve({ errors: messages.errors, warnings: [] });
              return;
            }
          }
          if (messages.warnings.length) warning ??= messages.warnings;

          // Source выбирает и ранний warning, теряя позднюю ошибку; блокирующие правила ждём.
          if (!blocking && warning) resolve({ errors: [], warnings: warning });
          else if (!remaining) resolve({ errors: [], warnings: [] });
        }, reject);
      });
    });
  }

  const results = await Promise.all(checks);
  const errors: string[] = [];
  const warnings: string[] = [];
  results.forEach((messages) => {
    errors.push(...messages.errors);
    warnings.push(...messages.warnings);
  });

  return { errors, warnings };
}

async function validateRuleValue<Values extends FormValues>(
  originalValue: FormValue,
  values: Readonly<Values>,
  configuration: ValidationRule<Values>,
  ancestor?: ValidationAncestor,
  context?: ValidationMessageContext
): Promise<ValidationMessages> {
  const rule = ancestor || (configuration.type === 'object' || configuration.type === 'array')
    && (configuration.fields || configuration.defaultField) ? { ...configuration } : configuration;
  let transformedValue = originalValue;
  if (rule.transform) {
    try {
      transformedValue = rule.transform(originalValue);
    } catch (error) {
      // Source теряет исключение transform и принимает значение; ошибка не должна давать success.
      return collectValidationMessages(rule, formatValidationMessages(
        [rule.message ?? (error instanceof Error ? error.message : 'Проверьте значение.')],
        rule,
        context
      ), []);
    }
  }
  const messages = formatValidationMessages(
    await validatePrimitiveRule(transformedValue, values, rule, context),
    rule,
    context
  );

  return validateNestedRule(
    transformedValue,
    originalValue,
    rule,
    messages,
    (child, rules, parent, key) => validateRules(
      child,
      values,
      rules,
      false,
      parent,
      { ...context, name: context?.name ? `${context.name}.${key}` : key }
    ),
    ancestor,
    configuration,
    context
  );
}

async function validatePrimitiveRule<Values extends FormValues>(
  transformedValue: FormValue,
  values: Readonly<Values>,
  rule: ValidationRule<Values>,
  context?: ValidationMessageContext
): Promise<string[]> {
  const messages: string[] = [];
  const type = rule.type;
  if (type && rule.validator) return validateCustomRule(transformedValue, values, rule, context);

  const message = (
    path: string | readonly [string, string],
    fallback: string,
    ...args: unknown[]
  ) => resolveValidationMessage(rule, context, path, fallback, [context?.name, ...args]);

  const value = normalizeValidationType(transformedValue, type);
  const array = Array.isArray(value);
  const missing = value === null || value === undefined;
  const empty = type ? missing
    || ['string', 'date', 'email', 'url', 'hex', 'tel', 'pattern'].includes(type) && value === ''
    : missing || typeof value === 'string' && !value.trim() || array && value.length === 0;

  if (rule.required && (empty || type === 'array' && array && value.length === 0)) {
    messages.push(message('required', 'Заполните это поле.'));
    return messages;
  }

  if (!type && rule.whitespace === true && typeof value === 'string' && value !== '' && !value.trim()) {
    return [message('whitespace', 'Поле не может состоять только из пробелов.')];
  }

  const exactLength = typeof rule.len === 'number';
  if (empty && !rule.validator && !(exactLength
    && (array || typeof value === 'string' && value.length > 0))) {
    return messages;
  }

  if (type && !matchesValidationType(value, type)) {
    return [message(['types', type], `Проверьте тип значения: ${type}.`, type)];
  }
  const choices = Array.isArray(rule.enum) ? rule.enum : [];
  if (type === 'enum' && choices.indexOf(value) === -1) {
    if (rule.message !== undefined) return [rule.message];

    return [message(
      'enum',
      choices.length ? `Значение должно быть одним из: ${choices.map(String).join(', ')}.`
        : 'Недопустимое значение.',
      choices.map(value => value == null ? '' : String(value)).join(', ')
    )];
  }
  if (type && ['boolean', 'object', 'regexp', 'method', 'any',
    'enum', 'email', 'url', 'hex', 'tel'].includes(type)) return [];

  const length = type === 'pattern' ? undefined : array
    ? value.length
    : typeof value === 'string'
      ? [...value].length
      : typeof value === 'number' ? value
        : type === 'date' && value instanceof Date ? value.getTime() : undefined;
  const rangeType = array ? 'array' : typeof value === 'string' ? 'string' : 'number';

  if (length !== undefined && exactLength && length !== rule.len) {
    return [message(
      [rangeType, 'len'],
      `${array ? 'Точное количество элементов'
        : typeof value === 'string' ? 'Точная длина' : 'Точное значение'}: ${rule.len}.`,
      rule.len
    )];
  }

  if (!exactLength && length !== undefined && rule.min !== undefined && length < rule.min) {
    messages.push(
      message(
        [rangeType, rule.max !== undefined ? 'range' : 'min'],
        `${array ? 'Минимальное количество' : 'Минимальное значение'}: ${rule.min}.`,
        ...(rule.max !== undefined ? [rule.min, rule.max] : [rule.min])
      )
    );
    return messages;
  }

  if (!exactLength && length !== undefined && rule.max !== undefined && length > rule.max) {
    messages.push(
      message(
        [rangeType, rule.min !== undefined ? 'range' : 'max'],
        `${array ? 'Максимальное количество' : 'Максимальное значение'}: ${rule.max}.`,
        ...(rule.min !== undefined ? [rule.min, rule.max] : [rule.max])
      )
    );
    return messages;
  }

  if ((!type || type === 'string' || type === 'pattern') && !empty
    && (!array || type === 'pattern')
    && rule.pattern
    && !matchesValidationPattern(value, rule.pattern, !type || type === 'string')) {
    messages.push(message(['pattern', 'mismatch'], 'Проверьте формат значения.', value, rule.pattern));
    return messages;
  }

  if (type === 'string' && rule.whitespace === true && value !== ''
    && typeof value === 'string' && !value.trim()) {
    return [message('whitespace', 'Поле не может состоять только из пробелов.')];
  }

  return validateCustomRule(value, values, rule, context);
}

async function validateCustomRule<Values extends FormValues>(
  value: FormValue,
  values: Readonly<Values>,
  rule: ValidationRule<Values>,
  context?: ValidationMessageContext
): Promise<string[]> {
  const messages: string[] = [];
  if (rule.validator) {
    try {
      const message = await rule.validator(value, values);

      if (message) {
        messages.push(message);
      }
    } catch (error) {
      messages.push(rule.message
        ?? (error instanceof Error
          ? error.message
          : resolveValidationMessage(rule, context, 'default', 'Проверьте значение.')));
    }
  }

  return messages;
}
