import type { FormValidateStatus } from './form-error-list.types';

interface FormStatusOptions {
  validateStatus?: FormValidateStatus;
  validating?: boolean;
  touched?: boolean;
  errors: readonly unknown[];
  warnings: readonly unknown[];
}

export function resolveFormStatus({
  validateStatus, validating, touched, errors, warnings
}: FormStatusOptions): FormValidateStatus | undefined {
  if (validateStatus !== undefined) return validateStatus;
  if (validating) return 'validating';
  if (errors.length) return 'error';
  if (warnings.length) return 'warning';
  if (touched) return 'success';
}
