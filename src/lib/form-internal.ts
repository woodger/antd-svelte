import type { NamePath } from './form-store.engine';
import type { ValidationRule } from './validation.engine';
import type { FormFieldMeta } from './form.model.svelte';

export interface FormFieldRegistration {
  readonly name: NamePath;
  // Symbol сохраняет identity, когда registration хранится внутри Svelte proxy.
  readonly mountKey?: symbol;
  readonly rules?: readonly ValidationRule[];
  readonly validateFirst?: boolean | 'parallel';
  readonly validateDebounce?: number;
  readonly isList?: boolean;
  readonly isListField?: boolean;
  readonly initialValue?: unknown;
  /** Пересоздаёт содержимое выбранного Field без замены соседних controls. */
  readonly onReset?: () => void;
  readonly getInstance?: () => unknown;
  readonly getElement?: () => Element | undefined;
}

export interface FormHooks {
  readonly resetKey: object;
  getFieldMeta(name: NamePath): FormFieldMeta | undefined;
  registerField(field: FormFieldRegistration): () => void;
  markFieldMounted(mountKey: symbol): void;
  initializeField(name: NamePath, initialValue?: unknown): void;
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
