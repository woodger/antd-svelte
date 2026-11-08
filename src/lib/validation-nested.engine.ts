import type { FormValues, ValidationRule } from './validation.engine';

export interface ValidationMessages {
  errors: string[];
  warnings: string[];
}

export interface ValidationAncestor {
  readonly rule: object;
  readonly value: unknown;
  readonly parent?: ValidationAncestor;
}

type ValidateChildren<Values extends FormValues> = (
  value: unknown, rules: readonly ValidationRule<Values>[], ancestor: ValidationAncestor
) => Promise<ValidationMessages>;

export function collectValidationMessages<Values extends FormValues>(
  rule: ValidationRule<Values>, own: readonly string[], children: readonly ValidationMessages[]
): ValidationMessages {
  if (rule.warningOnly) {
    return { errors: [], warnings: [...own, ...children.flatMap(child =>
      [...child.errors, ...child.warnings])] };
  }

  return {
    errors: [...own, ...children.flatMap(child => child.errors)],
    warnings: children.flatMap(child => child.warnings)
  };
}

function ownValue(value: unknown, key: string): unknown {
  if (value == null) return;
  const source = Object(value);
  return Object.hasOwn(source, key) ? source[key] : undefined;
}

export async function validateNestedRule<Values extends FormValues>(
  value: unknown, original: unknown, rule: ValidationRule<Values>, own: readonly string[],
  validate: ValidateChildren<Values>, ancestor?: ValidationAncestor, identity: object = rule
): Promise<ValidationMessages> {
  const nested = (rule.type === 'object' || rule.type === 'array')
    && (rule.fields || rule.defaultField) && (rule.required || value);
  if (!nested) return collectValidationMessages(rule, own, []);

  if (rule.required && !value && (rule.fields || rule.type === 'object' && rule.defaultField)) {
    return collectValidationMessages(rule, own.length ? own
      : [rule.message ?? 'Заполните это поле.'], []);
  }

  for (let parent = ancestor; parent; parent = parent.parent) {
    if (parent.rule === identity && Object.is(parent.value, original)) {
      return collectValidationMessages(rule, [rule.message ?? 'Вложенные правила образуют цикл.'], []);
    }
  }
  const current = { rule: identity, value: original, parent: ancestor };
  const fields = new Map<string, ValidationRule<Values> | readonly ValidationRule<Values>[]>();
  if (rule.type === 'object' && rule.defaultField && value != null) {
    for (const key of Object.keys(Object(value))) fields.set(key, rule.defaultField);
  }
  for (const [key, child] of Object.entries(rule.fields ?? {})) fields.set(key, child);

  // Schema.fields source сообщает результаты по завершении child promises.
  const children: ValidationMessages[] = [];
  await Promise.all([...fields].map(async ([key, child]) => {
    children.push(await validate(ownValue(value, key), Array.isArray(child)
      ? child : [child as ValidationRule<Values>], current));
  }));

  if (rule.type === 'array' && rule.defaultField && Array.isArray(value)
    && !own.length && !children.some(child => child.errors.length)) {
    // Rc-form defaultField обходит все элементы после explicit fields; sparse holes не являются данными.
    const keys = Object.keys(value).filter(key => /^(?:0|[1-9]\d*)$/.test(key)
      && Number(key) < value.length);
    const defaults = await Promise.all(keys.map(key => validate(
      ownValue(value, key), [rule.defaultField!], current
    )));
    children.push(...defaults);
  }

  return collectValidationMessages(rule, own, children);
}
