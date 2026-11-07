import type { FieldError, FieldErrors, FormValues } from './validation.engine';

/** Ошибка validation со значениями и полевыми ошибками; outOfDate — устаревшая проверка. */
export class FormValidationError<Values extends FormValues = FormValues> extends Error {
  constructor(
    readonly values: Readonly<Values>,
    readonly errors: FieldErrors<Values>,
    readonly outOfDate = false,
    readonly errorFields: readonly FieldError[] = Object.entries(errors).map(([name, messages]) => ({
      name: [name],
      errors: messages ?? [],
      warnings: []
    }))
  ) {
    super(outOfDate ? 'Form values changed during validation' : 'Form validation failed');
    this.name = 'FormValidationError';
  }
}
