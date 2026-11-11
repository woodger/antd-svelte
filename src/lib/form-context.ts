import { getContext, onDestroy, onMount, setContext } from 'svelte';
import type { FormFieldRegistration } from './form-internal';
import type { FormFeedbackIcons, FormRequiredMark, FormSemanticSlots, FormTooltipProps } from './form.types';
import type { FormValidateStatus } from './form-error-list.types';
import type { FormFieldMeta } from './form.model.svelte';
import type { ColProps } from './grid.types';
import type { NamePath } from './form-store.engine';
import type { Variant } from './types';
import { useConfig } from './config-context';
import type { FormRule } from './validation.engine';

export interface FormContext {
  readonly variant?: Variant;
  readonly disabled: boolean;
  readonly submitting: boolean;
  readonly layout: 'vertical' | 'horizontal' | 'inline';
  readonly colon?: boolean;
  readonly labelAlign?: 'left' | 'right';
  readonly labelWrap?: boolean;
  readonly labelCol?: ColProps;
  readonly wrapperCol?: ColProps;
  readonly requiredMark?: FormRequiredMark;
  readonly classNames?: FormSemanticSlots;
  readonly styles?: FormSemanticSlots;
  readonly tooltip?: FormTooltipProps;
  readonly feedbackIcons?: FormFeedbackIcons;
  readonly resetKey?: object;
  getFieldError(name: NamePath): readonly string[];
  getFieldWarning(name: NamePath): readonly string[];
  getFieldMeta(name: NamePath): (Pick<FormFieldMeta, 'touched' | 'validating'>
    & Partial<Pick<FormFieldMeta, 'validated'>>) | undefined;
  isFieldRequired(name: NamePath): boolean;
  hasRequiredRules(rules: readonly FormRule[]): boolean;
  touchField(name: NamePath): void;
  registerField?(field: FormFieldRegistration): (() => void) | undefined;
  markFieldMounted(mountKey: symbol): void;
  getFieldValue(name: NamePath): unknown;
  initializeField(name: NamePath, initialValue?: unknown): void;
  initializeList(name: NamePath, initialValue?: readonly unknown[]): void;
  changeList(name: NamePath, values: readonly unknown[]): void;
}

export interface FormFieldContext {
  // Status-only contexts передают состояние без native association дочерних controls.
  readonly id?: string;
  readonly name?: string;
  readonly label?: string;
  readonly labelledBy?: string;
  readonly disabled: boolean | undefined;
  readonly required: boolean;
  readonly status: FormValidateStatus | undefined;
  // Ошибки остаются доступны и при визуальном success/validating либо явном пустом status.
  readonly invalid?: boolean;
  readonly describedBy: string | undefined;
  registerControl?(getInstance: () => unknown): () => void;
  onBlur(): void;
}

const formKey = Symbol('ant-design-form');
const fieldKey = Symbol('ant-design-form-field');

export function provideForm(form: FormContext) {
  setContext(formKey, form);
}

export function useForm(): FormContext | undefined {
  const parent = getContext<FormContext | undefined>(formKey);
  if (!parent) return;

  const config = useConfig();
  const form: FormContext = Object.create(parent, {
    // Source DisabledContext следует ближайшему provider; native submitting остаётся отдельным.
    disabled: { get: () => config.componentDisabled || parent.submitting }
  });

  return form;
}

export function provideFormField(field: FormFieldContext | undefined) {
  setContext(fieldKey, field);
}

export function useFormField(getInstance?: () => unknown): FormFieldContext | undefined {
  const parent = getContext<FormFieldContext | undefined>(fieldKey);
  const config = useConfig();
  const form = useForm();
  const field: FormFieldContext | undefined = parent ? Object.create(parent, {
    disabled: { get: () => config.componentDisabled || form?.submitting }
  }) : undefined;
  if (field?.registerControl && getInstance) {
    // Порядок определяется деревом компонентов, а не порядком mount дочерних controls.
    let mounted = false;
    const remove = field.registerControl(() => mounted ? getInstance() : undefined);
    onMount(() => {
      mounted = true;
      return () => { mounted = false; };
    });
    onDestroy(remove);
  }

  return field;
}
