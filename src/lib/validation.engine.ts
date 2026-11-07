/** Значение поля может быть скаляром, вложенным контейнером или экземпляром класса. */
export type FormValue = unknown;
export type FormValues = Record<string, FormValue>;
export type FieldName<Values> = Extract<keyof Values, string>;

export interface ValidationRule<Values extends FormValues = FormValues> {
  required?: boolean;
  /** По умолчанию false; сообщение попадает в warnings и не блокирует submit. */
  warningOnly?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  message?: string;
  validator?: (
    value: FormValue,
    values: Readonly<Values>
  ) => string | void | Promise<string | void>;
}

export type FormRules<Values extends FormValues> = Partial<
  Record<FieldName<Values>, readonly ValidationRule<Values>[]>
>;

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
  rules: readonly ValidationRule<Values>[]
): Promise<{ errors: string[]; warnings: string[] }> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const array = Array.isArray(value);
  const empty = value === null
    || value === undefined
    || (typeof value === 'string'
      && !value.trim())
    || (array
      && value.length === 0);

  for (const rule of rules) {
    const messages = rule.warningOnly ? warnings : errors;

    if (empty && rule.required) {
      messages.push(rule.message ?? 'Заполните это поле.');
      continue;
    }

    if (empty && !rule.validator) {
      continue;
    }

    const length = array
      ? value.length
      : typeof value === 'string'
        ? [...value].length
        : typeof value === 'number' ? value : undefined;

    if (length !== undefined && rule.min !== undefined && length < rule.min) {
      messages.push(
        rule.message ?? `${array ? 'Минимальное количество' : 'Минимальное значение'}: ${rule.min}.`
      );
      continue;
    }

    if (length !== undefined && rule.max !== undefined && length > rule.max) {
      messages.push(
        rule.message
        ?? `${array
          ? 'Максимальное количество'
          : 'Максимальное значение'}: ${rule.max}.`
      );
      continue;
    }

    if (!empty
      && !array
      && rule.pattern
      && !new RegExp(rule.pattern.source, rule.pattern.flags).test(
        String(value)
      )) {
      messages.push(rule.message ?? 'Проверьте формат значения.');
      continue;
    }

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
            : 'Проверьте значение.'));
      }
    }
  }

  return { errors, warnings };
}
