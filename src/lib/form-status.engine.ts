import type { FormValidateStatus } from './form-error-list.types';

interface FormStatusOptions {
  validateStatus?: FormValidateStatus;
  validating?: boolean;
  touched?: boolean;
  hasFeedback?: boolean;
  validated?: boolean;
  errors: readonly unknown[];
  warnings: readonly unknown[];
}

export function resolveFormStatus({
  validateStatus, validating, touched, hasFeedback, validated, errors, warnings
}: FormStatusOptions): FormValidateStatus | undefined {
  if (validateStatus !== undefined) return validateStatus;
  if (validating) return 'validating';
  if (errors.length) return 'error';
  if (warnings.length) return 'warning';
  if (touched || hasFeedback && validated) return 'success';
}
