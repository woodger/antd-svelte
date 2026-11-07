import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';
import { createForm } from './form.model.svelte.js';
import { getFormHooks } from './form-internal';
import type { NamePath } from './form-store.engine';

function deferred<Value>() {
  let resolve!: (value: Value) => void;
  const promise = new Promise<Value>((complete) => { resolve = complete; });

  return { promise, resolve };
}

describe('createForm resetFields', () => {
  it('resets only exact metadata paths while restoring descendant values for a parent', () => {
    const form = createForm({ initialValues: {
      user: { name: 'Anna', role: 'Writer' }, 'user.name': 'Literal', sibling: 'Kept'
    } });
    const resets: string[] = [];
    const hooks = getFormHooks(form)!;
    hooks.registerField({ name: ['user', 'name'], onReset: () => { resets.push('nested'); } });
    hooks.registerField({ name: 'user.name', onReset: () => { resets.push('literal'); } });
    form.setFields([
      { name: ['user', 'name'], value: 'Draft', errors: ['Nested'], warnings: ['Note'], touched: true },
      { name: 'user.name', value: 'Literal draft', errors: ['Literal'], touched: true }
    ]);
    form.resetFields(['user']);

    expect(form.values.user).toEqual({ name: 'Anna', role: 'Writer' });
    expect(form.values['user.name']).toBe('Literal draft');
    expect(form.getFieldError(['user', 'name'])).toEqual(['Nested']);
    expect(form.isFieldTouched(['user', 'name'])).toBe(true);
    expect(resets).toEqual([]);
    form.resetFields([['user', 'name']]);
    expect(form.getFieldError(['user', 'name'])).toEqual([]);
    expect(form.getFieldWarning(['user', 'name'])).toEqual([]);
    expect(form.isFieldTouched(['user', 'name'])).toBe(false);
    expect(form.getFieldError('user.name')).toEqual(['Literal']);
    expect(resets).toEqual(['nested']);
  });

  it('resets numeric and string metadata independently even when both address an array element', () => {
    const form = createForm({ initialValues: { rows: [{ name: 'Anna' }] } });
    const numeric: NamePath = ['rows', 0, 'name'];
    const string: NamePath = ['rows', '0', 'name'];
    const hooks = getFormHooks(form)!;
    hooks.registerField({ name: numeric });
    hooks.registerField({ name: string });
    form.setFields([
      { name: numeric, value: 'Draft', errors: ['Numeric'], touched: true },
      { name: string, warnings: ['String'], touched: true }
    ]);
    form.resetFields([numeric]);

    expect(form.values.rows[0].name).toBe('Anna');
    expect(form.getFieldError(numeric)).toEqual([]);
    expect(form.isFieldTouched(numeric)).toBe(false);
    expect(form.getFieldWarning(string)).toEqual(['String']);
    expect(form.isFieldTouched(string)).toBe(true);
  });

  it('writes undefined own values for unknown paths without registering metadata', () => {
    const form = createForm({ initialValues: { name: 'Anna' } });
    const before = form.getFieldsError();
    form.resetFields(['missing', ['extra', 0, 'name']]);

    expect(form.values).toEqual({ name: 'Anna', missing: undefined, extra: [{ name: undefined }] });
    expect(Object.hasOwn(form.values, 'missing')).toBe(true);
    expect(form.getFieldsError()).toEqual(before);
  });

  it('treats an empty selection as a no-op, including a pending validation snapshot', async () => {
    const pending = deferred<string>();
    const form = createForm({ initialValues: { name: 'Anna' }, rules: {
      name: [{ validator: () => pending.promise }]
    } });
    const validation = form.validateFields().catch((error: unknown) => error);
    const values = form.values;
    const key = getFormHooks(form)!.resetKey;
    form.resetFields([]);

    expect(form.values).toBe(values);
    expect(getFormHooks(form)!.resetKey).toBe(key);
    expect(form.isFieldValidating('name')).toBe(true);
    pending.resolve('Current');
    const result = await validation;
    expect(result).toMatchObject({ outOfDate: false });
    expect(form.getFieldError('name')).toEqual(['Current']);
  });

  it('treats the empty path as a store reset without selecting every binding', () => {
    const form = createForm({ initialValues: { name: 'Anna', sibling: 'Kept' } });
    let resets = 0;
    getFormHooks(form)!.registerField({ name: 'name', onReset: () => { resets++; } });
    form.setFields([{ name: 'name', value: 'Draft', errors: ['Server'], touched: true }]);
    form.resetFields([[]]);

    expect(form.values).toEqual({ name: 'Anna', sibling: 'Kept' });
    expect(form.getFieldError('name')).toEqual(['Server']);
    expect(form.isFieldTouched('name')).toBe(true);
    expect(resets).toBe(0);
  });

  it('notifies each selected binding once and keeps the full-reset identity for named resets', () => {
    const form = createForm({ initialValues: { name: 'Anna', sibling: 'Kept' } });
    const hooks = getFormHooks(form)!;
    const resets: string[] = [];
    hooks.registerField({ name: 'name', onReset: () => { resets.push('first'); } });
    hooks.registerField({ name: 'name', onReset: () => { resets.push('second'); } });
    hooks.registerField({ name: 'sibling', onReset: () => { resets.push('sibling'); } });
    const key = hooks.resetKey;
    form.resetFields(['name', 'name']);

    expect(resets).toEqual(['first', 'second']);
    expect(hooks.resetKey).toBe(key);
    form.resetFields();
    expect(resets).toEqual(['first', 'second', 'first', 'second', 'sibling']);
    expect(hooks.resetKey).not.toBe(key);
  });

  it('uses the current root List initialValue only for an exact selected list without Form defaults', () => {
    const form = createForm<Record<string, unknown>>({ initialValues: { sibling: 'Kept' } });
    let initialValue = [{ name: 'First' }];
    getFormHooks(form)!.registerField({
      name: 'people', isList: true,
      get initialValue() { return initialValue; }
    });
    form.setFields([{ name: 'people', value: [{ name: 'Draft' }] }]);
    initialValue = [{ name: 'Updated default' }];
    form.resetFields(['people']);

    expect(form.values).toEqual({ sibling: 'Kept', people: [{ name: 'Updated default' }] });
    initialValue[0].name = 'Outside mutation';
    expect(form.getFieldValue(['people', 0, 'name'])).toBe('Updated default');
  });

  it('keeps Form defaults above List defaults and skips nested List initialValue fallback', () => {
    const form = createForm({ initialValues: { people: [{ name: 'Form' }] } });
    getFormHooks(form)!.registerField({ name: 'people', isList: true, initialValue: [{ name: 'List' }] });
    getFormHooks(form)!.registerField({
      name: ['people', 0, 'items'], isList: true, isListField: true, initialValue: ['Nested']
    });
    form.resetFields(['people', ['people', 0, 'items']]);

    expect(form.values).toEqual({ people: [{ name: 'Form', items: undefined }] });
  });

  it('does not choose an arbitrary List initialValue when two bindings supply the same path', () => {
    const form = createForm<Record<string, unknown>>({ initialValues: {} });
    const hooks = getFormHooks(form)!;
    hooks.registerField({ name: 'people', isList: true, initialValue: ['First'] });
    hooks.registerField({ name: 'people', isList: true, initialValue: ['Second'] });
    form.resetFields(['people']);

    expect(form.values).toEqual({ people: undefined });
    form.resetFields();
    expect(form.values).toEqual({});
  });

  it('copies plain defaults while retaining the identity of opaque values on named resets', () => {
    const when = dayjs('2026-11-07');
    const form = createForm({ initialValues: { user: { name: 'Anna' }, when } });
    form.setFields([{ name: 'user', value: { name: 'Draft' } }, { name: 'when', value: null }]);
    form.resetFields(['user', 'when']);

    expect(form.values.user.name).toBe('Anna');
    expect(form.values.when).toBe(when);
    form.values.user.name = 'External mutation';
    form.resetFields(['user']);
    expect(form.values.user.name).toBe('Anna');
  });

  it('rejects an old snapshot after resetting its selected field without restoring late messages', async () => {
    const pending = deferred<string>();
    const form = createForm({ initialValues: { name: 'Anna' }, rules: {
      name: [{ validator: () => pending.promise }]
    } });
    const validation = form.validateFields().catch((error: unknown) => error);
    form.resetFields(['name']);
    pending.resolve('Outdated');
    const result = await validation;

    expect(result).toMatchObject({ outOfDate: true });
    expect(form.getFieldError('name')).toEqual([]);
    expect(form.isFieldValidating('name')).toBe(false);
    expect(form.getFieldsValue({ filter: (meta) => !!meta?.validated })).toEqual({});
  });

  it('keeps a disjoint pending validation current when the selected reset changes no store values', async () => {
    const pending = deferred<string>();
    const form = createForm({ initialValues: { name: 'Anna', sibling: 'Kept' }, rules: {
      name: [{ validator: () => pending.promise }]
    } });
    const validation = form.validateFields(['name']).catch((error: unknown) => error);
    form.resetFields(['sibling']);
    pending.resolve('Current');
    const result = await validation;

    expect(result).toMatchObject({ outOfDate: false });
    expect(form.getFieldError('name')).toEqual(['Current']);
  });
});
