import { getContext, setContext } from 'svelte';
import type { FormFieldRegistration } from './form-internal';
import type { NamePath } from './form-store.engine';
import type { Variant } from './types';

export interface FormContext {
  readonly variant?: Variant;
  readonly disabled: boolean;
  readonly layout: 'vertical' | 'horizontal';
  readonly resetKey?: object;
  getFieldError(name: NamePath): readonly string[];
  isFieldRequired(name: NamePath): boolean;
  touchField(name: NamePath): void;
  registerField?(field: FormFieldRegistration): (() => void) | undefined;
  getFieldValue(name: NamePath): unknown;
  initializeList(name: NamePath, initialValue?: readonly unknown[]): void;
  changeList(name: NamePath, values: readonly unknown[]): void;
}

export interface FormFieldContext {
  // Status-only contexts передают состояние без native association дочерних controls.
  readonly id?: string;
  readonly name?: string;
  readonly label?: string;
  readonly disabled: boolean | undefined;
  readonly required: boolean;
  readonly status: 'error' | undefined;
  readonly describedBy: string | undefined;
  onBlur(): void;
}

const formKey = Symbol('ant-design-form');
const fieldKey = Symbol('ant-design-form-field');

export function provideForm(form: FormContext) {
  setContext(formKey, form);
}

export function useForm(): FormContext | undefined {
  return getContext(formKey);
}

export function provideFormField(field: FormFieldContext | undefined) {
  setContext(fieldKey, field);
}

export function useFormField(): FormFieldContext | undefined {
  return getContext(fieldKey);
}
