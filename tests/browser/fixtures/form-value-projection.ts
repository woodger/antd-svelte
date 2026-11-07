import type { FormFieldMeta, FormInstance } from 'antd-svelte';

function encode(value: unknown): unknown {
  if (value === undefined) return { $undefined: true };
  if (Array.isArray(value)) {
    return Array.from({ length: value.length }, (_, index) =>
      Object.hasOwn(value, index) ? encode(value[index]) : { $hole: true }
    );
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).map((key) =>
      [key, encode((value as Record<string, unknown>)[key])]
    ));
  }

  return value;
}

export function snapshotFormValues(form: FormInstance<Record<string, unknown>>) {
  const meta: (FormFieldMeta | null)[] = [];
  const filter = (value: FormFieldMeta | null) => { meta.push(value); return true; };
  const queries: Record<string, () => unknown> = {
    mounted: () => form.getFieldsValue(),
    store: () => form.getFieldsValue(true),
    empty: () => form.getFieldsValue([]),
    user: () => form.getFieldsValue([['user']]),
    literal: () => form.getFieldsValue(['user.name']),
    unbound: () => form.getFieldsValue(['unbound']),
    missing: () => form.getFieldsValue(['missing']),
    root: () => form.getFieldsValue([[]]),
    touched: () => form.getFieldsValue({ filter: (value) => !!value?.touched }),
    validated: () => form.getFieldsValue({ filter: (value) => !!value?.validated }),
    validating: () => form.getFieldsValue(true, (value) => !!value?.validating),
    rejected: () => form.getFieldsValue({ filter: () => false }),
    list: () => form.getFieldsValue(['people']),
    row: () => form.getFieldsValue([['people', 0]]),
    filteredSelection: () => form.getFieldsValue([['user'], 'unbound', 'missing'], filter),
    meta: () => form.getFieldsValue({ filter: (value) => { meta.push(value); return false; } })
  };
  const values = Object.fromEntries(Object.entries(queries).map(([key, get]) => [key, encode(get())]));

  return { values, meta: encode(meta) };
}
