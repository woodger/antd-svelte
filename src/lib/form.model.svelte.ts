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
  sameFormValue,
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

/** Все флаги по умолчанию false; возвращаемый snapshot сохраняет прежний полный объём values. */
export interface FormValidateOptions {
  /** Не меняет errors/warnings/touched/validating и не помечает поле проверенным для dirty. */
  validateOnly?: boolean;
  /** Проверяет также зарегистрированные поля, чей путь начинается с выбранного имени. */
  recursive?: boolean;
  /** Проверяет изменённые, touched, уже запущенные обычной validation поля и заданные defaults. */
  dirty?: boolean;
}

/** Состояние конкретного binding; name сохраняет типы сегментов пути. */
export interface FormFieldMeta {
  touched: boolean;
  validating: boolean;
  errors: readonly string[];
  warnings: readonly string[];
  name: readonly (string | number)[];
  /**
   * Обычная validation завершена либо значение изменено через setFieldsValue;
   * setFields.validating задаёт флаг вручную, validateOnly не влияет.
   */
  validated: boolean;
}

/** Null передаётся для явно выбранного пути без известного binding. */
export type FormFilterFunc = (meta: FormFieldMeta | null) => boolean;

/** Фильтр полей для getFieldsValue; корни FormList заполняются отдельно от фильтра. */
export interface FormGetFieldsValueConfig {
  filter?: FormFilterFunc;
}

/** Отсутствующие свойства сохраняются; metadata обновляет только известные bindings. */
export interface FormFieldData {
  name: NamePath;
  value?: unknown;
  touched?: boolean;
  validating?: boolean;
  errors?: readonly string[];
  warnings?: readonly string[];
  /** Принимается, как в upstream, но вычисляемый validated не заменяет. */
  validated?: boolean;
}

/** Реактивные значения, validation и submit одной формы; экземпляр не разделяется глобально. */
export interface FormInstance<Values extends FormValues> {
  readonly values: Readonly<Values>;
  /** Прежняя проекция ошибок верхнего уровня; для вложенных полей используйте getFieldsError. */
  readonly errors: Readonly<FieldErrors<Values>>;
  readonly isSubmitting: boolean;
  readonly submissionError: unknown;
  getFieldValue<const Path extends NamePath>(name: Path): NamePathValue<Values, Path>;
  /** Значения известных bindings; форма результата может быть частичной, как в upstream. */
  getFieldsValue(): Values;
  /** True без фильтра возвращает весь store; пути выбирают binding и его потомков. */
  getFieldsValue(names: readonly NamePath[] | true, filter?: FormFilterFunc): Values;
  getFieldsValue(config: FormGetFieldsValueConfig): Values;
  /** Возвращает ошибки полей модели либо явно перечисленных путей. */
  getFieldsError(names?: readonly NamePath[]): FieldError[];
  getFieldError(name: NamePath): readonly string[];
  /** Предупреждения warningOnly не входят в errors и не блокируют submit. */
  getFieldWarning(name: NamePath): readonly string[];
  /** Учитывает само поле и известных модели потомков; пустой путь проверяет всю модель. */
  isFieldTouched(name: NamePath): boolean;
  /** Без имён: любое touched-поле; true требует все bindings, кроме корней FormList. */
  isFieldsTouched(allTouched?: boolean): boolean;
  /** Для allTouched=true каждый выбранный префикс должен содержать хотя бы одно touched-поле. */
  isFieldsTouched(names?: readonly NamePath[], allTouched?: boolean): boolean;
  isFieldValidating(name: NamePath): boolean;
  /** Есть ли видимая validation; имена совпадают точно, без автоматического включения потомков. */
  isFieldsValidating(names?: readonly NamePath[]): boolean;
  isFieldRequired(name: NamePath): boolean;
  setFieldValue<const Path extends NamePath>(name: Path, value: NamePathValue<Values, Path>): void;
  /** Объединяет plain objects, заменяет массивы и очищает ошибки изменённых полей. */
  setFieldsValue(next: PartialFormValues<Values>): void;
  /** Применяет записи по порядку, не запускает validation; value работает и без binding. */
  setFields(fields: readonly FormFieldData[]): void;
  touchField(name: NamePath): void;
  resetFields(): void;
  validateFields(options?: FormValidateOptions): Promise<Values>;
  validateFields(names?: readonly NamePath[], options?: FormValidateOptions): Promise<Values>;
  submit(onFinish: (values: Values) => void | Promise<void>): Promise<SubmissionResult<Values>>;
}

interface StoredField {
  path: (string | number)[];
  persistent?: boolean;
  registration?: FormFieldRegistration;
  registrationOrder?: number;
  errors?: string[];
  warnings?: string[];
  touched: boolean;
  dirty: boolean;
  validating: boolean;
  validated: boolean;
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
  let lastValidation = 0;
  let registrationOrder = 0;
  let values = $state<Values>(copyFormValue(defaults));
  let resetKey = $state.raw<object>({});
  // При teardown Svelte читает прежний $state; реестр хранит актуальные регистрации.
  const fieldRegistry = new Set<StoredField>();
  let fields = $state.raw<StoredField[]>([]);
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

    return addField(name);
  }

  function addField(name: NamePath): StoredField {
    const field = $state<StoredField>({
      path: formNamePath(name), touched: false, dirty: false, validating: false,
      validated: false, run: 0
    });
    fieldRegistry.add(field);
    fields = [...fieldRegistry];

    return field;
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

  function isFieldTouched(name: NamePath): boolean {
    return fields.some((field) => containsFormPath(name, fieldPath(field)) && field.touched);
  }

  function isFieldsTouched(
    namesOrAll?: readonly NamePath[] | boolean,
    allTouched = false
  ): boolean {
    const names = Array.isArray(namesOrAll) ? namesOrAll as readonly NamePath[] : undefined;
    const all = typeof namesOrAll === 'boolean' ? namesOrAll : allTouched;

    if (names) return all ? names.every(isFieldTouched) : names.some(isFieldTouched);

    // Корни initialValues без binding — контейнеры store, а не дополнительные controls.
    const bindings = fields.filter((field) =>
      field.registration || fieldRules(field).length || field.touched
    );

    return all
      ? bindings.every((field) => field.touched || field.registration?.isList)
      : bindings.some((field) => field.touched);
  }

  function isFieldsValidating(names?: readonly NamePath[]): boolean {
    return fields.some((field) => field.validating
      && (!names || names.some((name) => sameFormPath(name, fieldPath(field)))));
  }

  function getFieldsValue(
    namesOrConfig?: readonly NamePath[] | true | FormGetFieldsValueConfig,
    filter?: FormFilterFunc
  ): Values {
    void revision;
    if (namesOrConfig === true && !filter) return values;

    const names = Array.isArray(namesOrConfig) ? namesOrConfig as readonly NamePath[] : undefined;
    const select = names || namesOrConfig === true
      ? filter : (namesOrConfig as FormGetFieldsValueConfig | undefined)?.filter;
    // Порядок UI bindings не зависит от заранее созданных контейнеров initialValues.
    const bindings = fields.filter((field) => fieldPath(field).length > 0
      && (field.registration || fieldRules(field).length))
      .sort((first, second) => (first.registrationOrder ?? 0) - (second.registrationOrder ?? 0));
    // Именованный запрос выбирает последний binding каждого пути, сохраняя порядок имён.
    const unique: StoredField[] = [];
    if (names) {
      for (const field of bindings) {
        const index = unique.findIndex((entry) => sameFormPath(fieldPath(entry), fieldPath(field)));
        if (index < 0) unique.push(field);
        else unique[index] = field;
      }
    }
    const selected: { path: (string | number)[]; field?: StoredField }[] = names
      ? names.flatMap((name) => {
        const path = formNamePath(name);
        const exact = unique.find((field) => sameFormPath(path, fieldPath(field)));
        const matches = path.length ? [
          ...(exact ? [exact] : []),
          ...unique.filter((field) => containsFormPath(path, fieldPath(field))
            && !sameFormPath(path, fieldPath(field)))
        ] : [];

        return matches.length
          ? matches.map((field) => ({ path: fieldPath(field), field })) : [{ path }];
      })
      : bindings.map((field) => ({ path: fieldPath(field), field }));
    const lists: NamePath[] = [];
    let result = {} as Values;

    for (const { path, field } of selected) {
      if (field?.registration?.isList) {
        lists.push(path);
        continue;
      }

      const meta: FormFieldMeta | null = field ? {
        touched: field.touched, validating: field.validating,
        errors: [...(field.errors ?? [])], warnings: [...(field.warnings ?? [])],
        name: [...path], validated: field.validated
      } : null;
      if (!select || select(meta)) {
        result = setFormValue(result, path, getFormValue(values, path)) as Values;
      }
    }

    for (const path of lists) {
      if (!getFormValue(result, path)) result = setFormValue(result, path, []) as Values;
    }

    return result;
  }

  async function validate(selected: readonly StoredField[], validateOnly = false): Promise<Values> {
    const snapshot = copyFormValue(values);
    const startRevision = revision;
    const token = ++request;
    // Свежесть Promise общая; validateOnly не меняет field.run видимой проверки.
    lastValidation = token;
    const entries = selected.map((field) => ({
      field, path: fieldPath(field), run: field.run, hasRules: fieldRules(field).length > 0
    }));

    if (!validateOnly) {
      for (const { field, hasRules } of entries) {
        if (!hasRules) {
          // Прежняя errors-проекция сохраняет пустые ключи; ручные metadata не очищаются.
          field.errors ??= [];
          field.warnings ??= [];
          continue;
        }

        field.run = token;
        field.validating = true;
        field.warnings = [];
        field.dirty = true;
        field.validated = false;
      }
    }

    const results = await Promise.all(entries.map(async ({ field, path, hasRules }) => {
      if (!hasRules) return { name: path, errors: [], warnings: [] };

      const messages = await validateFieldValue(
        getFormValue(snapshot, path), snapshot, fieldRules(field)
      );

      if (!validateOnly && field.run === token) {
        field.validating = false;

        if (revision === startRevision && sameFormPath(path, fieldPath(field))) {
          field.errors = messages.errors;
          field.warnings = messages.warnings;
          field.validated = true;
        }
      }

      return { name: path, ...messages };
    }));

    const nextErrors = results.filter((field) => field.errors.length);

    const outOfDate = lastValidation !== token || revision !== startRevision
      || entries.some(({ field, path, run, hasRules }) =>
        field.run !== (validateOnly || !hasRules ? run : token) || !fields.includes(field)
          || !sameFormPath(path, fieldPath(field))
      );

    if (outOfDate || nextErrors.length) {
      throw new FormValidationError(snapshot, rootErrors(nextErrors), outOfDate, nextErrors);
    }

    return snapshot;
  }

  function validateFields(
    namesOrOptions?: readonly NamePath[] | FormValidateOptions,
    options?: FormValidateOptions
  ): Promise<Values> {
    const names = Array.isArray(namesOrOptions) ? namesOrOptions as readonly NamePath[] : undefined;
    const settings = (names ? options : namesOrOptions ?? options) as FormValidateOptions | undefined;
    let selected = [...fields];

    if (names) {
      if (settings?.recursive) {
        selected = fields.filter((field) =>
          names.some((name) => containsFormPath(name, fieldPath(field)))
        );
      } else if (settings?.validateOnly) {
        selected = fields.filter((field) =>
          names.some((name) => sameFormPath(name, fieldPath(field)))
        );
      } else {
        selected = names.map(ensureField);
      }
    }

    if (settings?.dirty) {
      selected = selected.filter((field) => field.dirty || field.touched
        || field.registration?.initialValue !== undefined
        || getFormValue(defaults, fieldPath(field)) !== undefined);
    }

    return validate(selected, settings?.validateOnly);
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
    getFieldsValue,
    getFieldsError,
    getFieldError: (name) => findField(name)?.errors ?? [],
    getFieldWarning: (name) => findField(name)?.warnings ?? [],
    isFieldTouched,
    isFieldsTouched,
    isFieldValidating: (name) => isFieldsValidating([name]),
    isFieldsValidating,
    isFieldRequired: (name) => {
      const field = findField(name);

      return field ? fieldRules(field).some((rule) => rule.required && !rule.warningOnly) : false;
    },
    setFieldValue(name, value) {
      if (Object.is(getFormValue(values, name), value)) {
        const field = findField(name);
        if (field) field.dirty = true;

        return;
      }

      updateValues(setFormValue(values, name, value) as Values);
      const field = ensureField(name);
      field.dirty = true;
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
        if (!sameFormValue(getFormValue(values, path), getFormValue(merged, path))) {
          field.dirty = true;
          field.validated = true;
        }

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
    setFields(updates) {
      for (const update of updates) {
        const { name, ...data } = update;

        if ('value' in data) {
          const next = setFormValue(values, name, data.value) as Values;
          const changed = !sameFormValue(values, next);
          updateValues(next);

          if (changed) {
            revision++;
            submissionError = undefined;

            for (const field of fields) {
              if (containsFormPath(name, fieldPath(field))) {
                field.run = ++request;
                field.validating = false;
              }
            }
          }
        }

        for (const field of fields) {
          if (!sameFormPath(name, fieldPath(field))
            || (!field.registration && !fieldRules(field).length)) {
            continue;
          }

          if ('touched' in update) field.touched = !!update.touched;
          if ('validating' in update) {
            field.run = ++request;
            field.validating = !!update.validating;
            field.validated = !field.validating;
          }
          if ('errors' in update) field.errors = [...(update.errors ?? [])];
          if ('warnings' in update) field.warnings = [...(update.warnings ?? [])];
          field.dirty = true;
        }
      }
    },
    touchField(name) {
      const field = ensureField(name);
      field.touched = true;
      field.dirty = true;
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
        field.dirty = false;
        field.validating = false;
        field.validated = false;
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
      list.dirty = true;

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

        if (!field || field.registration) field = addField(registration.name);

        const registered = field;
        registered.registration = registration;
        registered.registrationOrder = ++registrationOrder;

        return () => {
          if (registered.persistent) {
            if (registration.rules !== undefined) {
              registered.run = ++request;
              registered.errors = undefined;
              registered.warnings = undefined;
              registered.touched = false;
              registered.dirty = false;
              registered.validating = false;
              registered.validated = false;
            }

            registered.registration = undefined;
          } else {
            registered.run = ++request;
            fieldRegistry.delete(registered);
            fields = [...fieldRegistry];
          }
        };
      });
    }
  });

  return form;
}
