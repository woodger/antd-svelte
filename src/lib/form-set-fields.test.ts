import { describe, expect, it } from 'vitest';
import { createForm, type FormFieldMeta } from './form.model.svelte.js';
import { getFormHooks } from './form-internal';

function deferred<Value>() {
  let resolve!: (value: Value) => void;
  const promise = new Promise<Value>((complete) => { resolve = complete; });

  return { promise, resolve };
}

describe('createForm setFields', () => {
  it('applies metadata and value entries in order without validating or clearing omitted messages', () => {
    let calls = 0;
    const form = createForm({ initialValues: { name: 'Anna', sibling: 'Kept' }, rules: {
      name: [{ validator: () => { calls++; } }]
    } });
    const errors = ['Server'];
    const warnings = ['Heads up'];
    form.setFields([
      { name: 'name', errors, warnings, touched: true },
      { name: 'name', value: 'Updated' },
      { name: 'name', errors: ['Last'] }
    ]);
    errors.push('Injected');
    warnings.push('Injected');

    expect(calls).toBe(0);
    expect(form.values).toEqual({ name: 'Updated', sibling: 'Kept' });
    expect(form.getFieldError('name')).toEqual(['Last']);
    expect(form.getFieldWarning('name')).toEqual(['Heads up']);
    expect(form.isFieldTouched('name')).toBe(true);
    expect(form.isFieldValidating('name')).toBe(false);
  });

  it('distinguishes absent values from explicit undefined and ignores metadata for unbound paths', () => {
    const form = createForm({ initialValues: { unbound: 'Hidden' } });
    const before = form.getFieldsError();
    form.setFields([
      { name: 'unbound', errors: ['Ignored'], touched: true },
      { name: 'missing', errors: ['Ignored'], warnings: ['Ignored'], touched: true },
      { name: 'new', value: undefined }
    ]);

    expect(form.values).toEqual({ unbound: 'Hidden', new: undefined });
    expect(Object.hasOwn(form.values, 'new')).toBe(true);
    expect(Object.hasOwn(form.values, 'missing')).toBe(false);
    expect(form.getFieldError('unbound')).toEqual([]);
    expect(form.getFieldWarning('missing')).toEqual([]);
    expect(form.isFieldsTouched()).toBe(false);
    expect(form.getFieldsError()).toEqual(before);
    expect(form.getFieldsValue()).toEqual({});
  });

  it('applies metadata to exact typed paths and every binding with that name', () => {
    const form = createForm({ initialValues: { user: { name: 'Nested' }, 'user.name': 'Literal', rows: [{}] } });
    const hooks = getFormHooks(form)!;
    hooks.registerField({ name: ['user', 'name'] });
    hooks.registerField({ name: ['user', 'name'] });
    hooks.registerField({ name: 'user.name' });
    hooks.registerField({ name: ['rows', 0, 'name'] });
    hooks.registerField({ name: ['rows', '0', 'name'] });
    form.setFields([
      { name: ['user', 'name'], value: 'Updated', errors: ['Nested'], touched: true },
      { name: 'user.name', warnings: ['Literal'] },
      { name: ['rows', 0, 'name'], errors: ['Numeric'] },
      { name: ['rows', '0', 'name'], warnings: ['String'] }
    ]);

    expect(form.values.user.name).toBe('Updated');
    expect(form.values['user.name']).toBe('Literal');
    expect(form.getFieldError('user.name')).toEqual([]);
    expect(form.getFieldError(['rows', 0, 'name'])).toEqual(['Numeric']);
    expect(form.getFieldError(['rows', '0', 'name'])).toEqual([]);
    expect(form.getFieldWarning(['rows', '0', 'name'])).toEqual(['String']);
    const metadata: (FormFieldMeta | null)[] = [];
    form.getFieldsValue({ filter: (meta) => { metadata.push(meta); return false; } });
    expect(metadata.filter((meta) => meta?.name[0] === 'user'))
      .toEqual(Array.from({ length: 2 }, () => ({
        name: ['user', 'name'], touched: true, validating: false, validated: false,
        errors: ['Nested'], warnings: []
      })));
  });

  it('marks a metadata-only update dirty while keeping validators idle until requested', async () => {
    let calls = 0;
    const form = createForm<{ fresh?: string }>({ initialValues: {}, rules: {
      fresh: [{ validator: () => { calls++; } }]
    } });
    await form.validateFields({ dirty: true });
    expect(calls).toBe(0);
    form.setFields([{ name: 'fresh', errors: ['Server'] }]);
    expect(calls).toBe(0);
    expect(form.isFieldTouched('fresh')).toBe(false);
    await form.validateFields({ dirty: true });
    expect(calls).toBe(1);
    expect(form.getFieldError('fresh')).toEqual([]);
  });

  it('preserves manual messages and validating for a ruleless field without blocking validation', async () => {
    const form = createForm({ initialValues: { bare: 'Value' } });
    getFormHooks(form)!.registerField({ name: 'bare' });
    form.setFields([{
      name: 'bare', errors: ['Server'], warnings: ['Note'], touched: true, validating: true
    }]);
    const validation = form.validateFields();

    expect(form.getFieldError('bare')).toEqual(['Server']);
    expect(form.getFieldWarning('bare')).toEqual(['Note']);
    expect(form.isFieldValidating('bare')).toBe(true);
    expect(await validation).toEqual({ bare: 'Value' });
    expect(form.getFieldError('bare')).toEqual(['Server']);
    expect(form.getFieldWarning('bare')).toEqual(['Note']);
    expect(form.isFieldValidating('bare')).toBe(true);
    form.setFields([{ name: 'bare', validating: false }]);
    expect(form.isFieldValidating('bare')).toBe(false);
  });

  it('retains the existing root errors projection for ordinary ruleless validation', async () => {
    const form = createForm({ initialValues: { bare: 'Value' } });
    await form.validateFields();

    expect(form.errors).toEqual({ bare: [] });
  });

  it('lets the active validator replace temporary messages when metadata alone changes', async () => {
    const pending = deferred<string>();
    const form = createForm({ initialValues: { name: 'Anna' }, rules: {
      name: [{ validator: () => pending.promise }]
    } });
    const validation = form.validateFields().catch((error: unknown) => error);
    form.setFields([{ name: 'name', errors: ['Manual'], warnings: ['Manual warning'], touched: true }]);

    expect(form.getFieldError('name')).toEqual(['Manual']);
    expect(form.isFieldValidating('name')).toBe(true);
    pending.resolve('Async rejected');
    const result = await validation;
    expect(result).toMatchObject({ outOfDate: false });
    expect(form.getFieldError('name')).toEqual(['Async rejected']);
    expect(form.getFieldWarning('name')).toEqual([]);
    expect(form.isFieldTouched('name')).toBe(true);
    expect(form.isFieldValidating('name')).toBe(false);
  });

  it.each([false, true])('keeps an explicit validating=%s override after an old request completes', async (validating) => {
    const pending = deferred<string>();
    const form = createForm({ initialValues: { name: 'Anna' }, rules: {
      name: [{ validator: () => pending.promise }]
    } });
    const validation = form.validateFields().catch((error: unknown) => error);
    form.setFields([{ name: 'name', validating, errors: ['Override'] }]);
    pending.resolve('Async rejected');
    await validation;

    expect(form.getFieldError('name')).toEqual(['Override']);
    expect(form.isFieldValidating('name')).toBe(validating);
    expect(form.getFieldsValue({ filter: (meta) => !!meta?.validated }))
      .toEqual(validating ? {} : { name: 'Anna' });
    form.setFields([{ name: 'name', validating: false }]);
    expect(form.isFieldsValidating()).toBe(false);
  });

  it('keeps fresh value messages after cancelling a validator for an older snapshot', async () => {
    const pending = deferred<string>();
    const form = createForm({ initialValues: { name: 'Anna' }, rules: {
      name: [{ validator: () => pending.promise }]
    } });
    const validation = form.validateFields().catch((error: unknown) => error);
    form.setFields([{ name: 'name', value: 'Updated', errors: ['Server after write'] }]);
    expect(form.isFieldValidating('name')).toBe(false);
    pending.resolve('Async rejected');
    const result = await validation;

    expect(result).toMatchObject({ outOfDate: true });
    expect(form.values.name).toBe('Updated');
    expect(form.getFieldError('name')).toEqual(['Server after write']);
    expect(form.getFieldsValue({ filter: (meta) => !!meta?.validated })).toEqual({});
  });

  it('invalidates snapshot checks when an undefined own key is added outside their selected field', async () => {
    const pending = deferred<string>();
    const form = createForm<{ name: string; added?: undefined }>({ initialValues: { name: 'Anna' }, rules: {
      name: [{ validator: () => pending.promise }]
    } });
    const validation = form.validateFields().catch((error: unknown) => error);
    form.setFields([{ name: 'added', value: undefined }]);
    pending.resolve('Outdated');
    const result = await validation;

    expect(result).toMatchObject({ outOfDate: true });
    expect(Object.hasOwn(form.values, 'added')).toBe(true);
    expect(form.getFieldError('name')).toEqual([]);
  });

  it('normalizes optional undefined flags to booleans and keeps validated computed', () => {
    const form = createForm({ initialValues: { name: 'Anna' }, rules: { name: [{ required: true }] } });
    form.setFields([{ name: 'name', touched: true, validating: true, errors: ['Server'], warnings: ['Note'] }]);
    form.setFields([{ name: 'name', touched: undefined, validating: undefined, errors: undefined, warnings: undefined }]);
    form.setFields([{ name: 'name', validated: false }]);
    let result: FormFieldMeta | null = null;
    form.getFieldsValue({ filter: (meta) => { result = meta; return true; } });

    expect(result).toEqual({
      name: ['name'], touched: false, validating: false, validated: true, errors: [], warnings: []
    });
  });

  it('copies caller-owned plain values and resets manual metadata with the form defaults', () => {
    const form = createForm({ initialValues: { user: { name: 'Anna' } } });
    getFormHooks(form)!.registerField({ name: 'user' });
    const value = { name: 'Updated' };
    form.setFields([{ name: 'user', value, errors: ['Server'], warnings: ['Note'], touched: true }]);
    value.name = 'Mutated outside';

    expect(form.values.user.name).toBe('Updated');
    form.resetFields();
    expect(form.values.user.name).toBe('Anna');
    expect(form.getFieldError('user')).toEqual([]);
    expect(form.getFieldWarning('user')).toEqual([]);
    expect(form.isFieldsTouched()).toBe(false);
  });
});
