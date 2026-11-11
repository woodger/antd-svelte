import { getContext, setContext } from 'svelte';
import type { FormValidateStatus } from './form-error-list.types';
import type { RenderEmptyContent } from './types';

export interface FormFeedbackIcon {
  readonly status: Exclude<FormValidateStatus, ''>;
  readonly prefixCls: string;
  readonly prefixScope?: string;
  readonly content?: RenderEmptyContent;
}
export interface FormFeedbackContext {
  readonly isFormItemInput?: boolean;
  readonly hasFeedback?: boolean;
  readonly icon?: FormFeedbackIcon;
}
const key = Symbol('ant-design-form-feedback');
const empty: FormFeedbackContext = {};
export function useFormFeedback(): FormFeedbackContext {
  return getContext<FormFeedbackContext | undefined>(key) ?? empty;
}
export function provideFormFeedback(value: FormFeedbackContext) {
  setContext(key, value);
}
