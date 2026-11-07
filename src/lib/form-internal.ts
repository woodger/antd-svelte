import type { NamePath } from './form-store.engine';
import type { ValidationRule } from './validation.engine';

export interface FormFieldRegistration {
  readonly name: NamePath;
  readonly rules?: readonly ValidationRule[];
}

export interface FormHooks {
  registerField(field: FormFieldRegistration): () => void;
}

// Регистрация относится к экземпляру createForm и не расширяет публичный FormInstance.
const formHooks = new WeakMap<object, FormHooks>();

export function setFormHooks(form: object, hooks: FormHooks) {
  formHooks.set(form, hooks);
}

export function getFormHooks(form: object): FormHooks | undefined {
  return formHooks.get(form);
}
