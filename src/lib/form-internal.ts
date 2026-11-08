import type { NamePath } from './form-store.engine';
import type { ValidationRule } from './validation.engine';

export interface FormFieldRegistration {
  readonly name: NamePath;
  readonly rules?: readonly ValidationRule[];
  readonly validateFirst?: boolean | 'parallel';
  readonly isList?: boolean;
  readonly isListField?: boolean;
  readonly initialValue?: readonly unknown[];
  /** Пересоздаёт содержимое выбранного Field без замены соседних controls. */
  readonly onReset?: () => void;
  readonly getInstance?: () => unknown;
  readonly getElement?: () => Element | undefined;
}

export interface FormHooks {
  readonly resetKey: object;
  registerField(field: FormFieldRegistration): () => void;
  initializeList(name: NamePath, initialValue?: readonly unknown[]): void;
  changeList(name: NamePath, values: readonly unknown[]): void;
}

// Неперечисляемый Symbol сохраняет связь и через Svelte proxy, не расширяя публичный FormInstance.
const formHooksKey = Symbol('ant-design-form-hooks');

export function setFormHooks(form: object, hooks: FormHooks) {
  Object.defineProperty(form, formHooksKey, { value: hooks });
}

export function getFormHooks(form: object): FormHooks | undefined {
  return (form as { [formHooksKey]?: FormHooks })[formHooksKey];
}
