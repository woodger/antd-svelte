import { tick, untrack } from 'svelte';
import { FormValidationError } from './FormValidationError';
import { setFormHooks, type FormFieldRegistration } from './form-internal';
import {
  containsFormPath,
  copyFormValue,
  formNamePath,
  getFormValue,
  mergeFormValues,
  sameFormPath,
  setFormValue,
  type NamePath,
  type NamePathValue,
  type PartialFormValues
} from './form-store.engine';
import {
  validateFieldValue,
  type FieldError,
  type FieldErrors,
  type FormRules,
  type FormValues
} from './validation.engine';

export type SubmissionResult<Values extends FormValues> =
  | { status: 'success'; }
  | { status: 'invalid'; error: FormValidationError<Values>; }
  | { status: 'failed'; error: unknown; }
  | { status: 'busy'; };

/** Реактивные значения, validation и submit одной формы; экземпляр не разделяется глобально. */
export interface FormInstance<Values extends FormValues> {
  readonly values: Readonly<Values>;
  /** Прежняя проекция ошибок верхнего уровня; для вложенных полей используйте getFieldsError. */
  readonly errors: Readonly<FieldErrors<Values>>;
  readonly isSubmitting: boolean;
  readonly submissionError: unknown;
  getFieldValue<const Path extends NamePath>(name: Path): NamePathValue<Values, Path>;
  /** Возвращает ошибки полей модели либо явно перечисленных путей. */
  getFieldsError(names?: readonly NamePath[]): FieldError[];
  getFieldError(name: NamePath): readonly string[];
  /** Предупреждения warningOnly не входят в errors и не блокируют submit. */
  getFieldWarning(name: NamePath): readonly string[];
  isFieldTouched(name: NamePath): boolean;
  isFieldValidating(name: NamePath): boolean;
  isFieldRequired(name: NamePath): boolean;
  setFieldValue<const Path extends NamePath>(name: Path, value: NamePathValue<Values, Path>): void;
  /** Объединяет plain objects, заменяет массивы и очищает ошибки изменённых полей. */
  setFieldsValue(next: PartialFormValues<Values>): void;
  touchField(name: NamePath): void;
  resetFields(): void;
  validateFields(names?: readonly NamePath[]): Promise<Values>;
  submit(onFinish: (values: Values) => void | Promise<void>): Promise<SubmissionResult<Values>>;
}

interface StoredField {
  path: (string | number)[];
  persistent?: boolean;
  registration?: FormFieldRegistration;
  errors?: string[];
  warnings?: string[];
  touched: boolean;
  validating: boolean;
  run: number;
}

/**
 * Создаёт изолированную реактивную модель формы. Plain objects и массивы копируются;
 * устаревшая асинхронная validation не заменяет ошибки новой версии значений.
 */
export function createForm<Values extends FormValues>({
  initialValues,
  rules = {}
}: {
  initialValues: Values;
  rules?: FormRules<Values>;
}): FormInstance<Values> {
  const defaults = copyFormValue(initialValues);
  let revision = $state(0);
  let request = 0;
  let values = $state<Values>(copyFormValue(defaults));
  let resetKey = $state.raw<object>({});
  let fields = $state<StoredField[]>([]);
  let isSubmitting = $state(false);
  let submissionError = $state.raw<unknown>();

  function fieldPath(field: StoredField): (string | number)[] {
    return formNamePath(field.registration?.name ?? field.path);
  }

  function findField(name: NamePath): StoredField | undefined {
    return fields.find((field) => sameFormPath(fieldPath(field), name));
  }

  function ensureField(name: NamePath): StoredField {
    const existing = findField(name);
    if (existing) return existing;

    fields.push({ path: formNamePath(name), touched: false, validating: false, run: 0 });

    return fields[fields.length - 1];
  }

  for (const name of new Set([...Object.keys(defaults), ...Object.keys(rules)])) {
    ensureField(name).persistent = true;
  }

  function fieldRules(field: StoredField) {
    const path = fieldPath(field);

    return field.registration?.rules
      ?? (path.length === 1 && Object.hasOwn(rules, path[0])
        ? rules[path[0] as keyof typeof rules] : undefined)
      ?? [];
  }

  function rootErrors(entries: readonly FieldError[]): FieldErrors<Values> {
    return Object.fromEntries(entries.filter((field) => field.name.length === 1)
      .map((field) => [field.name[0], [...field.errors]])) as FieldErrors<Values>;
  }

  function getFieldsError(names?: readonly NamePath[]): FieldError[] {
    return names
      ? names.map((name) => ({
        name: formNamePath(name),
        errors: [...(findField(name)?.errors ?? [])],
        warnings: [...(findField(name)?.warnings ?? [])]
      }))
      : fields.map((field) => ({
        name: fieldPath(field),
        errors: [...(field.errors ?? [])],
        warnings: [...(field.warnings ?? [])]
      }));
  }

  async function validate(selected: readonly StoredField[]): Promise<Values> {
    const snapshot = copyFormValue(values);
    const startRevision = revision;
    const token = ++request;
    const entries = selected.map((field) => ({ field, path: fieldPath(field) }));

    for (const { field } of entries) {
      field.run = token;
      field.validating = true;
    }

    const results = await Promise.all(entries.map(async ({ field, path }) => {
      const messages = await validateFieldValue(
        getFormValue(snapshot, path), snapshot, fieldRules(field)
      );

      if (field.run === token) {
        field.validating = false;

        if (revision === startRevision && sameFormPath(path, fieldPath(field))) {
          field.errors = messages.errors;
          field.warnings = messages.warnings;
        }
      }

      return { name: path, ...messages };
    }));

    const nextErrors = results.filter((field) => field.errors.length);

    const outOfDate = revision !== startRevision || entries.some(({ field, path }) =>
      field.run !== token || !fields.includes(field) || !sameFormPath(path, fieldPath(field))
    );

    if (outOfDate || nextErrors.length) {
      throw new FormValidationError(snapshot, rootErrors(nextErrors), outOfDate, nextErrors);
    }

    return snapshot;
  }

  function validateFields(names?: readonly NamePath[]): Promise<Values> {
    return validate(names ? names.map(ensureField) : [...fields]);
  }

  function revalidateTouched() {
    if (isSubmitting) return;

    const selected = fields.filter((field) => field.touched);

    if (selected.length) {
      void validate(selected).catch((error: unknown) => {
        if (!(error instanceof FormValidationError)) throw error;
      });
    }
  }

  function updateValues(next: Values) {
    // Svelte перечисляет inherited names лишь при наличии own property в исходном target.
    if (Object.keys(next).some((name) => !Object.hasOwn(values, name)
      && Object.hasOwn(Object.prototype, name))) {
      values = copyFormValue(next);

      return;
    }

    for (const name of Object.keys(values)) {
      if (!Object.hasOwn(next, name)) delete (values as FormValues)[name];
    }

    for (const name of Object.keys(next)) {
      (values as FormValues)[name] = next[name];
    }
  }

  function clearField(field: StoredField) {
    field.errors = [];
    field.warnings = [];
    field.validating = false;
    field.run = ++request;
  }

  const form: FormInstance<Values> = {
    get values() {
      void revision;

      return values;
    },
    get errors() {
      return rootErrors(fields.filter((field) => field.errors !== undefined)
        .map((field) => ({ name: fieldPath(field), errors: field.errors ?? [], warnings: [] })));
    },
    get isSubmitting() {
      return isSubmitting;
    },
    get submissionError() {
      return submissionError;
    },
    getFieldValue(name) {
      void revision;

      return getFormValue(values, name) as NamePathValue<Values, typeof name>;
    },
    getFieldsError,
    getFieldError: (name) => findField(name)?.errors ?? [],
    getFieldWarning: (name) => findField(name)?.warnings ?? [],
    isFieldTouched: (name) => findField(name)?.touched ?? false,
    isFieldValidating: (name) => findField(name)?.validating ?? false,
    isFieldRequired: (name) => {
      const field = findField(name);

      return field ? fieldRules(field).some((rule) => rule.required && !rule.warningOnly) : false;
    },
    setFieldValue(name, value) {
      if (Object.is(getFormValue(values, name), value)) return;

      updateValues(setFormValue(values, name, value) as Values);
      const field = ensureField(name);
      clearField(field);

      for (const child of fields) {
        if (child !== field && containsFormPath(name, fieldPath(child))) clearField(child);
      }

      revision++;
      submissionError = undefined;
      revalidateTouched();
    },
    setFieldsValue(next) {
      const merged = mergeFormValues(values, next);

      for (const field of fields) {
        const path = fieldPath(field);
        const parent = getFormValue(next, path.slice(0, -1));
        const provided = parent !== null && typeof parent === 'object'
          && path.length > 0 && Object.hasOwn(parent, path[path.length - 1]);

        if (!Object.is(getFormValue(values, path), getFormValue(merged, path))
          || provided) {
          clearField(field);
        }
      }

      updateValues(merged);
      revision++;
      submissionError = undefined;
      revalidateTouched();
    },
    touchField(name) {
      ensureField(name).touched = true;
      revalidateTouched();
    },
    resetFields() {
      revision++;
      values = copyFormValue(defaults);
      resetKey = {};

      for (const field of fields) {
        const registration = field.registration;
        const path = fieldPath(field);

        if (registration?.isList && !registration.isListField
          && registration.initialValue !== undefined
          && getFormValue(values, path) === undefined) {
          updateValues(setFormValue(values, path, registration.initialValue) as Values);
        }
      }

      for (const field of fields) {
        field.errors = undefined;
        field.warnings = undefined;
        field.touched = false;
        field.validating = false;
        field.run = ++request;
      }

      submissionError = undefined;
    },
    validateFields,
    async submit(onFinish) {
      if (isSubmitting) return { status: 'busy' };

      isSubmitting = true;
      submissionError = undefined;

      for (const field of fields) {
        field.touched = true;
      }

      try {
        const result = await validateFields();
        await onFinish(result);

        return { status: 'success' };
      } catch (error) {
        if (error instanceof FormValidationError) return { status: 'invalid', error };

        submissionError = error;

        return { status: 'failed', error };
      } finally {
        isSubmitting = false;
      }
    }
  };

  function initializeList(name: NamePath, initialValue?: readonly unknown[]) {
    untrack(() => {
      if (initialValue !== undefined && getFormValue(values, name) === undefined) {
        updateValues(setFormValue(values, name, initialValue) as Values);
        revision++;
      }
    });
  }

  setFormHooks(form, {
    get resetKey() {
      return resetKey;
    },
    initializeList,
    changeList(name, next) {
      updateValues(setFormValue(values, name, next) as Values);
      revision++;
      submissionError = undefined;
      const list = ensureField(name);
      clearField(list);
      list.touched = true;

      for (const field of fields) {
        if (field !== list && containsFormPath(name, fieldPath(field))) {
          field.run = ++request;
          field.validating = false;
        }
      }

      // Имена keyed rows обновятся при flush; metadata остаётся у прежнего экземпляра строки.
      void tick().then(revalidateTouched);
    },
    registerField(registration) {
      return untrack(() => {
        if (registration.isList) initializeList(registration.name, registration.initialValue);

        let field = findField(registration.name);

        if (!field || field.registration) {
          fields.push({
            path: formNamePath(registration.name), touched: false, validating: false, run: 0
          });
          field = fields[fields.length - 1];
        }

        const registered = field;
        registered.registration = registration;

        return () => {
          if (registered.persistent) {
            if (registration.rules !== undefined) {
              registered.run = ++request;
              registered.errors = undefined;
              registered.warnings = undefined;
              registered.touched = false;
              registered.validating = false;
            }

            registered.registration = undefined;
          } else {
            registered.run = ++request;
            fields = fields.filter((entry) => entry !== registered);
          }
        };
      });
    }
  });

  return form;
}
